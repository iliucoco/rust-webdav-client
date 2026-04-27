/**
 * 主题切换状态管理
 * 支持浅色、深色、跟随系统三种模式
 */

/** 主题类型 */
export type Theme = "light" | "dark" | "auto";

/** 当前选中的主题 */
let theme = $state<Theme>("auto");

/** 获取当前主题 */
export function getTheme(): Theme {
  return theme;
}

/** 设置主题并应用到 document */
export function setTheme(newTheme: Theme) {
  theme = newTheme;
  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
}

/** 切换主题 - 在 light/dark/auto 之间循环 */
export function toggleTheme() {
  if (theme === "light") {
    setTheme("dark");
  } else if (theme === "dark") {
    setTheme("auto");
  } else {
    setTheme("light");
  }
}

/** 应用主题到 document 根元素 */
function applyTheme(themeValue: Theme) {
  const root = document.documentElement;
  // 清除所有主题 class
  root.classList.remove("light", "dark", "auto");
  // 添加当前主题 class
  root.classList.add(themeValue);
}

/** 从 localStorage 初始化主题 */
export function initTheme() {
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved && ["light", "dark", "auto"].includes(saved)) {
    setTheme(saved);
  } else {
    // 默认使用深色
    setTheme("dark");
  }
}
