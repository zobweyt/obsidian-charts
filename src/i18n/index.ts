import { moment } from "obsidian";
import en from "./locales/en.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };

const locales: Record<string, typeof en> = { en, ru };
const locale = moment.locale().toLowerCase().split("-")[0];

export function t(key: keyof typeof en) {
  return locales[locale]?.[key] ?? en[key];
}
