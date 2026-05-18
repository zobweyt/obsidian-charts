import { moment } from "obsidian";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

export type LocaleStrings = typeof en;

let activeStrings: LocaleStrings | null = null;
let fallbackStrings: LocaleStrings = en;

export async function initLocale() {
  const locale = moment.locale().toLowerCase();

  fallbackStrings = en;

  if (locale === "en" || locale.startsWith("en")) {
    activeStrings = en;
    return;
  }

  if (locale === "ru" || locale.startsWith("ru")) {
    activeStrings = ru;
    return;
  }

  activeStrings = en;
}

export function t(key: keyof LocaleStrings): string {
  return activeStrings?.[key] ?? fallbackStrings?.[key] ?? key;
}
