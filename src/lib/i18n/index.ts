import { init, getLocaleFromNavigator, addMessages, waitLocale } from "svelte-i18n";

import en from "./en.json";
import zhCN from "./zh-CN.json";

addMessages("en", en);
addMessages("zh-CN", zhCN);

const saved = typeof localStorage !== "undefined" ? localStorage.getItem("locale") : null;
const initial = saved || getLocaleFromNavigator() || "zh-CN";

init({
  fallbackLocale: "en",
  initialLocale: initial,
});

export async function setLocale(locale: string) {
  const { locale: setFn } = await import("svelte-i18n");
  localStorage.setItem("locale", locale);
  setFn.set(locale);
}

export { waitLocale };
