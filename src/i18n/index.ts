import { getLanguage } from "obsidian";

import en from "./locales/en.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };

const locales = { en, ru };
const locale = getLanguage().split("-")[0] as keyof typeof locales;

export function t(key: keyof typeof en) {
  return locales[locale]?.[key] ?? en[key] ?? key;
}
