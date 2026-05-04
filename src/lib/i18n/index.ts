import { init, getLocaleFromNavigator, addMessages, waitLocale } from "svelte-i18n";
import { invoke } from "@tauri-apps/api/core";

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

function matchLocale(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (supported.includes(raw)) return raw;
  const primary = raw.split("-")[0].toLowerCase();
  // zh-Hans-CN → zh-CN, zh-Hant-TW → zh-TW
  if (primary === "zh") {
    if (raw.includes("Hant") || raw.includes("TW") || raw.includes("HK")) return "zh-TW";
    return "zh-CN";
  }
  // de-DE → de, ja-JP → ja, etc.
  const byPrimary = supported.find((s) => s.startsWith(primary));
  return byPrimary || null;
}

async function resolveInitialLocale(): Promise<string> {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem("locale") : null;
  if (saved && supported.includes(saved)) return saved;

  const nav = getLocaleFromNavigator();
  const navMatch = matchLocale(nav);
  if (navMatch) return navMatch;

  try {
    const sysLocale: string = await invoke("get_system_locale");
    const sysMatch = matchLocale(sysLocale);
    if (sysMatch) return sysMatch;
  } catch {
    // Tauri not available, ignore
  }

  return "en";
}

export async function initLocale() {
  const initial = await resolveInitialLocale();
  init({
    fallbackLocale: "en",
    initialLocale: initial,
  });
}

export async function setLocale(locale: string) {
  const { locale: setFn } = await import("svelte-i18n");
  localStorage.setItem("locale", locale);
  setFn.set(locale);
}

export { waitLocale };
