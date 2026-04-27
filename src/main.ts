/**
 * 应用入口文件
 * 初始化 Svelte 应用并挂载到 DOM
 */

import "./app.css";
import "./lib/i18n";
import App from "./App.svelte";
import { mount } from "svelte";
import { initTheme } from "./lib/stores/theme.svelte";

// 初始化主题
initTheme();

// 将根组件挂载到 #app 元素
const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
