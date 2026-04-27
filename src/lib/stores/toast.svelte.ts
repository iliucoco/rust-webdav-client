/**
 * Toast 通知消息状态管理
 * 提供临时的用户操作反馈
 */

/** Toast 消息接口 */
export interface Toast {
  /** 唯一标识符 */
  id: number;
  /** 消息内容 */
  message: string;
  /** 消息类型 */
  type: "success" | "error" | "info";
}

/** 当前显示的 Toast 列表 */
let toasts = $state<Toast[]>([]);
/** 下一个 Toast 的 ID */
let nextId = 0;

/** 获取所有当前显示的 Toast */
export function getToasts() {
  return toasts;
}

/** 显示 Toast 通知，3秒后自动消失 */
export function showToast(message: string, type: Toast["type"] = "info") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  // 3秒后自动移除
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
  }, 3000);
}
