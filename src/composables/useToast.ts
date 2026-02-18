import { reactive } from "vue";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

let nextId = 0;

// toasts 是全局单例状态，所有组件共享同一个数组。
// 这是有意为之的设计决策，确保 toast 通知在整个应用中统一管理。
const toasts = reactive<ToastItem[]>([]);

const addToast = (type: ToastType, message: string, duration = 3000) => {
  const id = nextId++;
  toasts.push({ id, type, message, duration });

  if (duration > 0) {
    setTimeout(() => {
      // toast 可能已被手动移除，需要检查是否仍然存在
      const index = toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
      }
    }, duration);
  }
};

const removeToast = (id: number) => {
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
  }
};

export function useToast() {
  return {
    toasts,
    removeToast,
    success: (message: string, duration?: number) => addToast("success", message, duration),
    error: (message: string, duration?: number) => addToast("error", message, duration),
    warning: (message: string, duration?: number) => addToast("warning", message, duration),
    info: (message: string, duration?: number) => addToast("info", message, duration),
  };
}
