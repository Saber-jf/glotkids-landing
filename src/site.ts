/**
 * What the site says about itself, in one place.
 *
 * The legal pages follow the company's other app, GlotCast
 * (glotcast.com/terms, /privacy; user, 2026-11-20): a global app, plain
 * numbered sections, one contact address, no country-specific annexes.
 * They say only what the app does -- when the app changes (purchases,
 * analytics, saving what onboarding asks), the pages change with it.
 */

export type L = { en: string; tr: string };

export const SITE = {
  name: "GlotKids",
  url: "https://glotkids.imtiyaz.io",
  ages: "4–8",
  /** the date the legal texts took effect, ISO "YYYY-MM-DD" */
  legalUpdated: "2026-11-20",
  /** one address for everything (user, 2026-11-23) */
  email: "support@imtiyaz.io",
};
