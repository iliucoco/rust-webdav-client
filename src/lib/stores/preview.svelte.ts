/**
 * 文件预览状态管理
 * 处理文件预览加载、取消和文本编辑功能
 */

import type { FileCategory } from "../types";
import { api } from "../api";

/** 预览面板是否打开 */
let isOpen = $state(false);
/** 当前预览文件的路径 */
let filePath = $state<string | null>(null);
/** 当前预览文件的名称 */
let fileName = $state<string | null>(null);
/** 文件类型分类 */
let fileType = $state<FileCategory | null>(null);
/** 是否正在加载 */
let isLoading = $state(false);
/** 是否处于编辑模式 */
let isEditing = $state(false);
/** 文件数据（文本字符串或二进制 ArrayBuffer） */
let data = $state<ArrayBuffer | string | null>(null);
/** 错误信息 */
let error = $state<string | null>(null);
/** 用于取消正在进行的预览请求 */
let abortController = $state<AbortController | null>(null);

export function getIsOpen() {
  return isOpen;
}
export function getFilePath() {
  return filePath;
}
export function getFileName() {
  return fileName;
}
export function getFileType() {
  return fileType;
}
export function getIsLoading() {
  return isLoading;
}
export function getIsEditing() {
  return isEditing;
}
export function getData() {
  return data;
}
export function getError() {
  return error;
}

/** 预览大小限制 - 50MB */
const PREVIEW_SIZE_LIMIT = 50 * 1024 * 1024;

/** 打开文件进行预览，支持取消和大小限制检查 */
export async function openFile(
  path: string,
  name: string,
  category: FileCategory,
  size?: number | null,
) {
  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  // 超过大小限制的文件不预览
  if (size && size > PREVIEW_SIZE_LIMIT) {
    filePath = path;
    fileName = name;
    fileType = category;
    isOpen = true;
    isLoading = false;
    isEditing = false;
    error = `File too large to preview (${(size / 1024 / 1024).toFixed(1)} MB). Please download to view locally.`;
    data = null;
    abortController = null;
    return;
  }

  // 初始化预览状态
  filePath = path;
  fileName = name;
  fileType = category;
  isOpen = true;
  isLoading = true;
  isEditing = false;
  error = null;
  data = null;

  try {
    if (category === "text") {
      // 文本文件直接获取文本内容
      data = await api.edit.getTextContent(path, size ?? null, abortController.signal);
    } else {
      // 二进制文件获取原始数据并标准化格式
      const result = await api.preview.getPreviewData(path, size ?? null, abortController.signal);
      let bytes: Uint8Array;
      if (result instanceof Uint8Array) {
        bytes = result;
      } else if (result instanceof ArrayBuffer) {
        bytes = new Uint8Array(result);
      } else if (Array.isArray(result)) {
        bytes = new Uint8Array(result);
      } else if (typeof result === "object" && result !== null) {
        // 处理 Tauri IPC 序列化的对象格式
        bytes = new Uint8Array(Object.values(result) as number[]);
      } else {
        throw new Error("Unsupported data type received");
      }
      data = bytes.buffer;
    }
  } catch (e) {
    console.error("Preview error:", e);
    // 忽略用户主动取消的错误
    if (!(e instanceof Error && e.name === "AbortError")) {
      error = String(e);
    }
  } finally {
    isLoading = false;
    abortController = null;
  }
}

/** 保存编辑后的文本内容 */
export async function saveContent(content: string) {
  if (!filePath) return;
  isLoading = true;
  error = null;
  try {
    await api.edit.saveTextContent(filePath, content);
    data = content;
    isEditing = false;
  } catch (e) {
    error = String(e);
  } finally {
    isLoading = false;
  }
}

/** 切换编辑模式 */
export function setEditing(editing: boolean) {
  isEditing = editing;
}

/** 关闭预览面板并取消所有进行中的请求 */
export function close() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  isOpen = false;
  filePath = null;
  fileName = null;
  fileType = null;
  data = null;
  error = null;
  isEditing = false;
}
