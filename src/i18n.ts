/**
 * Two languages: English is the default (the stores' reviewers read it),
 * Turkish lives under /tr/. Every page has a counterpart, so the switcher
 * always lands on the same page in the other language.
 */
import type { L } from "./site";

export type Lang = "en" | "tr";

/** each page in both languages; the KVKK pages are Turkish legal texts and stay Turkish */
export const ROUTES = {
  home: { en: "/", tr: "/tr/" },
  parents: { en: "/parents", tr: "/tr/ebeveynler" },
  faq: { en: "/faq", tr: "/tr/sss" },
  privacy: { en: "/privacy", tr: "/tr/gizlilik" },
  deletion: { en: "/delete-account", tr: "/tr/hesap-silme" },
  terms: { en: "/terms", tr: "/tr/kullanim-kosullari" },
  contact: { en: "/contact", tr: "/tr/iletisim" },
  licenses: { en: "/licenses", tr: "/tr/lisanslar" },
  kvkk: { en: "/tr/kvkk-aydinlatma", tr: "/tr/kvkk-aydinlatma" },
  request: { en: "/tr/basvuru", tr: "/tr/basvuru" },
} as const;
export type Page = keyof typeof ROUTES;
export const href = (p: Page, lang: Lang) => ROUTES[p][lang];

export const pick = (v: L, lang: Lang) => v[lang];

const DATE = { en: "en-GB", tr: "tr-TR" };
export const fmtDate = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(DATE[lang], { day: "numeric", month: "long", year: "numeric" });
export const country = (code: string, lang: Lang) =>
  new Intl.DisplayNames([DATE[lang]], { type: "region" }).of(code) ?? code;

export const UI = {
  en: {
    skip: "Skip to content",
    nav: { how: "How it works", worlds: "Worlds", parents: "For parents", privacy: "Privacy", faq: "FAQ", soon: "Coming soon", menu: "Menu" },
    langName: "Türkçe", langShort: "TR", langLabel: "Bu sayfanın Türkçesi",
    footerBlurb: "English words for children aged 4–8, played with Lili and Kuki. No ads. No reading needed.",
    footer: { app: "The app", privacy: "Privacy", other: "More", how: "How it works", worlds: "Worlds and games", parents: "For parents", faq: "FAQ", contact: "Contact and support",
      policy: "Privacy Policy", deletion: "Delete your account and data", kvkk: "KVKK notice (Turkish)", terms: "Terms of Use", licenses: "Licenses" },
    rights: "All rights reserved.",
    noCookies: "This site's own code sets no cookies and uses no tracking.",
    draft: "DRAFT — not for publication: the marked facts are still to be filled in and checked by the owner and a lawyer.",
    onPage: "On this page", updated: "Last updated", version: "Version", toBeFilled: "To be filled",
  },
  tr: {
    skip: "İçeriğe geç",
    nav: { how: "Nasıl öğrenir?", worlds: "Dünyalar", parents: "Ebeveynler için", privacy: "Gizlilik", faq: "SSS", soon: "Yakında", menu: "Menü" },
    langName: "English", langShort: "EN", langLabel: "This page in English",
    footerBlurb: "4–8 yaş çocuklar için Lili ve Kuki'yle oynayarak İngilizce kelimelerle tanışma. Reklam yok, okuma bilmek gerekmez.",
    footer: { app: "Uygulama", privacy: "Gizlilik", other: "Diğer", how: "Nasıl öğrenir?", worlds: "Dünyalar ve oyunlar", parents: "Ebeveynler için", faq: "Sık sorulan sorular", contact: "İletişim ve destek",
      policy: "Gizlilik Politikası", deletion: "Hesabı ve verileri silme", kvkk: "KVKK Aydınlatma Metni", terms: "Kullanım Koşulları", licenses: "Lisanslar", request: "Veri sahibi başvurusu" },
    rights: "Tüm hakları saklıdır.",
    noCookies: "Bu sitenin kendi kodu çerez ya da izleme aracı içermez.",
    draft: "TASLAK — yayımlanamaz: işaretli bilgiler işletme sahibi ve hukukçu tarafından doldurulup doğrulanmadı.",
    onPage: "Bu sayfada", updated: "Son güncelleme", version: "Sürüm", toBeFilled: "Doldurulacak",
  },
} as const;
