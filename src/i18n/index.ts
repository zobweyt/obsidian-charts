import { getLanguage } from "obsidian";

import am from "./locales/am.json" with { type: "json" };
import ar from "./locales/ar.json" with { type: "json" };
import be from "./locales/be.json" with { type: "json" };
import bn from "./locales/bn.json" with { type: "json" };
import ca from "./locales/ca.json" with { type: "json" };
import cs from "./locales/cs.json" with { type: "json" };
import da from "./locales/da.json" with { type: "json" };
import de from "./locales/de.json" with { type: "json" };
import en from "./locales/en.json" with { type: "json" };
import enGB from "./locales/en-GB.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };
import fa from "./locales/fa.json" with { type: "json" };
import fi from "./locales/fi.json" with { type: "json" };
import fr from "./locales/fr.json" with { type: "json" };
import ga from "./locales/ga.json" with { type: "json" };
import he from "./locales/he.json" with { type: "json" };
import hu from "./locales/hu.json" with { type: "json" };
import id from "./locales/id.json" with { type: "json" };
import it from "./locales/it.json" with { type: "json" };
import ja from "./locales/ja.json" with { type: "json" };
import ka from "./locales/ka.json" with { type: "json" };
import kh from "./locales/kh.json" with { type: "json" };
import ko from "./locales/ko.json" with { type: "json" };
import lv from "./locales/lv.json" with { type: "json" };
import ms from "./locales/ms.json" with { type: "json" };
import ne from "./locales/ne.json" with { type: "json" };
import nl from "./locales/nl.json" with { type: "json" };
import no from "./locales/no.json" with { type: "json" };
import pl from "./locales/pl.json" with { type: "json" };
import pt from "./locales/pt.json" with { type: "json" };
import ptBR from "./locales/pt-BR.json" with { type: "json" };
import ro from "./locales/ro.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };
import sk from "./locales/sk.json" with { type: "json" };
import sq from "./locales/sq.json" with { type: "json" };
import sr from "./locales/sr.json" with { type: "json" };
import sv from "./locales/sv.json" with { type: "json" };
import th from "./locales/th.json" with { type: "json" };
import tr from "./locales/tr.json" with { type: "json" };
import uk from "./locales/uk.json" with { type: "json" };
import uz from "./locales/uz.json" with { type: "json" };
import vi from "./locales/vi.json" with { type: "json" };
import zh from "./locales/zh.json" with { type: "json" };
import zhTW from "./locales/zh-TW.json" with { type: "json" };

const locales = {
  am,
  ar,
  be,
  bn,
  ca,
  cs,
  da,
  de,
  en,
  "en-gb": enGB,
  es,
  fa,
  fi,
  fr,
  ga,
  he,
  hu,
  id,
  it,
  ja,
  ka,
  kh,
  ko,
  lv,
  ms,
  ne,
  nl,
  no,
  pl,
  pt,
  "pt-br": ptBR,
  ro,
  ru,
  sk,
  sq,
  sr,
  sv,
  th,
  tr,
  uk,
  uz,
  vi,
  zh,
  "zh-tw": zhTW,
} satisfies Record<string, typeof en>;

type TranslationKey = keyof typeof en;

function resolveLocale(): keyof typeof locales {
  const full = getLanguage();

  if (full in locales) {
    return full as keyof typeof locales;
  }

  const short = full.split("-")[0];

  if (short in locales) {
    return short as keyof typeof locales;
  }

  return "en";
}

const currentLocale = resolveLocale();

export function t(key: TranslationKey): string {
  return locales[currentLocale][key] ?? en[key] ?? key;
}
