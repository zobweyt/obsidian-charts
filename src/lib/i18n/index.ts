import { getLanguage } from "obsidian";

import en from "./locales/en.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };

const locales: Record<string, Record<string, string>> = {
  en,
  ru,
};

const locale = getLanguage().split("-")[0];

export function t(key: keyof typeof en) {
  return locales[locale]?.[key] ?? en[key] ?? key;
}
