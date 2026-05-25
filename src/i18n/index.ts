import { getLanguage } from "obsidian";

import en from "./locales/en.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };

const fallback: Record<string, string> = en as Record<string, string>;
const locales: Record<string, Record<string, string>> = {
  en: fallback,
  ru: ru as Record<string, string>,
};
const locale = getLanguage().split("-")[0];

export function t(key: string): string {
  return locales[locale]?.[key] ?? fallback[key] ?? key;
}
