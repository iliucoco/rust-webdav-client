import { init, getLocaleFromNavigator, addMessages, waitLocale } from "svelte-i18n";

import en from "./en.json";
import zhCN from "./zh-CN.json";
import zhTW from "./zh-TW.json";
import ja from "./ja.json";
import ko from "./ko.json";
import de from "./de.json";
import ru from "./ru.json";

addMessages("en", en);
addMessages("zh-CN", zhCN);
addMessages("zh-TW", zhTW);
addMessages("ja", ja);
addMessages("ko", ko);
addMessages("de", de);
addMessages("ru", ru);

const supported = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "ru"];

const saved = typeof localStorage !== "undefined" ? localStorage.getItem("locale") : null;
const nav = getLocaleFromNavigator();
const initial = (saved && supported.includes(saved)) ? saved
  : (nav && supported.includes(nav)) ? nav
  : "en";

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
