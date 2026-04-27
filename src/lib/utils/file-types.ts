/**
 * 文件类型识别和格式化工具函数
 */

import type { FileCategory } from "../types";

/** 文本文件扩展名集合 */
const TEXT_EXTS = new Set([
  "txt", "md", "json", "xml", "yaml", "yml", "toml", "csv", "log", "ini",
  "cfg", "conf", "sh", "bash", "zsh", "py", "js", "ts", "jsx", "tsx",
  "css", "html", "htm", "rs", "go", "java", "c", "cpp", "h", "hpp",
  "rb", "php", "sql", "r", "swift", "kt", "dart", "lua", "pl", "ex",
  "exs", "hs", "ml", "scm", "clj", "vue", "svelte", "svelte",
]);

/** 图片文件扩展名集合 */
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "tif"]);
/** 音频文件扩展名集合 */
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "opus"]);
/** 视频文件扩展名集合 */
const VIDEO_EXTS = new Set(["mp4", "webm", "mkv", "avi", "mov", "wmv", "flv", "m4v"]);
/** 压缩文件扩展名集合 */
const ARCHIVE_EXTS = new Set(["zip", "tar", "gz", "bz2", "xz", "7z", "rar"]);

/** 根据文件名和 MIME 类型判断文件分类 */
export function getFileCategory(filename: string, contentType?: string | null): FileCategory {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  // 先按扩展名匹配
  if (TEXT_EXTS.has(ext)) return "text";
  if (IMAGE_EXTS.has(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (AUDIO_EXTS.has(ext)) return "audio";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ARCHIVE_EXTS.has(ext)) return "archive";

  // 扩展名匹配失败时使用 MIME 类型
  if (contentType) {
    if (contentType.startsWith("text/")) return "text";
    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("audio/")) return "audio";
    if (contentType.startsWith("video/")) return "video";
    if (contentType === "application/pdf") return "pdf";
  }

  return "unknown";
}

/** 根据文件分类获取图标名称 */
export function getFileIcon(category: FileCategory, isDir: boolean): string {
  if (isDir) return "folder";
  const icons: Record<FileCategory, string> = {
    text: "file-text",
    image: "image",
    pdf: "file-text",
    audio: "music",
    video: "film",
    docx: "file-text",
    xlsx: "table",
    pptx: "presentation",
    archive: "archive",
    unknown: "file",
  };
  return icons[category];
}

/** 格式化文件大小为易读格式 */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** 格式化日期时间为中文本地格式 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
