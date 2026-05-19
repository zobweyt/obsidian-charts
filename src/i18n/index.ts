import { moment } from "obsidian";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

const locales: Record<string, typeof en> = { en, ru };
const locale = moment.locale().toLowerCase().split("-")[0];

export function t(key: keyof typeof en): string {
  return locales[locale]?.[key] ?? en[key];
}
