/**
 * 确认对话框状态管理
 * 提供统一的二次确认对话框功能
 */

import { t } from "svelte-i18n";

type DialogType = "confirm" | "alert";

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

let dialogState = $state<DialogState>({
  isOpen: false,
  type: "confirm",
  title: "",
  message: "",
  confirmText: "确定",
  cancelText: "取消",
  onConfirm: null,
  onCancel: null,
});

let pendingResolve = $state<((value: boolean) => void) | null>(null);

export function getDialogState() {
  return dialogState;
}

/**
 * 显示确认对话框
 * @param message 对话框消息内容
 * @param title 对话框标题
 * @param confirmText 确认按钮文字
 * @param cancelText 取消按钮文字
 * @returns Promise<boolean> 用户点击确认返回 true，取消返回 false
 */
export function showConfirm(
  message: string,
  title: string = "确认操作",
  confirmText: string = "确定",
  cancelText: string = "取消",
): Promise<boolean> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
    dialogState = {
      isOpen: true,
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        closeDialog();
        resolve(true);
      },
      onCancel: () => {
        closeDialog();
        resolve(false);
      },
    };
  });
}

/**
 * 显示提示对话框（只有确定按钮）
 * @param message 对话框消息内容
 * @param title 对话框标题
 * @param confirmText 确认按钮文字
 */
export function showAlert(
  message: string,
  title: string = "提示",
  confirmText: string = "确定",
): Promise<void> {
  return new Promise((resolve) => {
    dialogState = {
      isOpen: true,
      type: "alert",
      title,
      message,
      confirmText,
      cancelText: "",
      onConfirm: () => {
        closeDialog();
        resolve();
      },
      onCancel: null,
    };
  });
}

function closeDialog() {
  dialogState = {
    ...dialogState,
    isOpen: false,
  };
  pendingResolve = null;
}

export function handleConfirm() {
  if (dialogState.onConfirm) {
    dialogState.onConfirm();
  }
}

export function handleCancel() {
  if (dialogState.onCancel) {
    dialogState.onCancel();
  }
}
