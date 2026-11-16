/**
 * What the site says about the operator, its providers and its decisions --
 * in one place, in both languages, so no two pages can disagree, and so the
 * release check (scripts/check.mjs) can refuse a production build while
 * anything here is unknown or unverified.
 *
 * `null` = NOT KNOWN. Never put a guess, an example address or a plausible
 * number here. Every null renders a visible "[To be filled …]" mark, and
 * `npm run build` stops while any required one is left; a draft preview is
 * `npm run build:draft`, chosen on purpose. Deleting a word from a page proves
 * nothing: the check reads THIS file.
 *
 * The audience that matters most: App Store and Google Play reviewers, who
 * compare these pages with the app. So the pages say only what the app does
 * at release -- and `APP` below lists what the app must do first.
 *
 * Plain TypeScript (no enums): Node reads this file directly.
 */

export type L = { en: string; tr: string };

export const SITE = {
  name: "GlotKids",
  /** the live address, "https://…" -- unknown until the domain is bought */
  url: null as string | null,
  urlVerified: false,
  ages: "4–8",
  /** the date the legal texts are approved, ISO "YYYY-MM-DD" */
  legalUpdated: null as string | null,
  legalVersion: "draft-2026-11-16",
};

/** the data controller, as registered -- from the owner */
export const CONTROLLER = {
  legalName: null as string | null,
  /** "company" (MERSİS/KEP apply) or "sole" (a sole trader: what applies is for the lawyer) */
  kind: null as "company" | "sole" | null,
  address: null as string | null,
  mersis: null as string | null,
  kep: null as string | null,
  privacyEmail: null as string | null,
  supportEmail: null as string | null,
};

/**
 * Who the app and the site share data with. A role is never assumed:
 * "processor" only when the contract says the provider acts on our
 * instructions; Google/Apple sign-in also act for themselves.
 */
export interface Provider {
  /** null: not chosen yet */
  name: string | null;
  what: L;
  data: L;
  /** from the live setup and the contract, never assumed */
  region: L | null;
  role: "processor" | "independent" | null;
  verified: boolean;
}
export const PROVIDERS: Provider[] = [
  { name: "Supabase",
    what: { en: "Parent account sign-in", tr: "Ebeveyn hesabı ve giriş" },
    data: { en: "Email address, account ID, sign-in method and sign-in records", tr: "E-posta adresi, hesap kimliği, giriş yöntemi ve giriş kayıtları" },
    /* region from the project's settings screen; role per Supabase's DPA. `verified`: the owner checks both live */
    region: { en: "EU (Frankfurt, Germany)", tr: "AB (Frankfurt, Almanya)" }, role: "processor", verified: false },
  { name: "Expo (EAS Update)",
    what: { en: "Delivering app updates", tr: "Uygulama güncellemelerinin dağıtımı" },
    data: { en: "IP address, a random identifier for this installation, operating system, app version", tr: "IP adresi, bu kuruluma özgü rastgele bir kimlik, işletim sistemi, uygulama sürümü" },
    /* role per Expo's DPA (it acts as a processor for EAS services) */
    region: { en: "United States", tr: "ABD" }, role: "processor", verified: false },
  { name: null /* the app server's host */,
    what: { en: "Hosting our app server (content, progress backups)", tr: "Uygulama sunucumuzun barındırılması (içerik, ilerleme yedekleri)" },
    data: { en: "IP address, server logs, account and backup data", tr: "IP adresi, sunucu kayıtları, hesap ve yedek verileri" },
    region: null /* from the owner: the chosen host's country */, role: "processor", verified: false },
  { name: null /* the mail service */,
    what: { en: "Sending sign-in codes and account emails", tr: "Giriş kodları ve hesap e-postaları" },
    data: { en: "Email address", tr: "E-posta adresi" },
    region: null /* from the owner: Supabase's own mail, or your SMTP provider */, role: "processor", verified: false },
  { name: "Google, Apple",
    what: { en: "Sign-in, only if you choose it", tr: "Giriş, yalnızca bu yolu seçerseniz" },
    data: { en: "What sign-in needs; with Apple you may hide your email", tr: "Giriş için gereken bilgi; Apple'da e-postanızı gizleyebilirsiniz" },
    region: { en: "United States and other countries", tr: "ABD ve diğer ülkeler" }, role: "independent", verified: false },
];

/** the owner's decisions the texts depend on (both languages) */
export const DECISIONS = {
  /** ISO country codes the app is published in (decides KVKK only, or GDPR / COPPA too) */
  markets: null as string[] | null,
  /*
   * Retention, set from what comparable children's apps publish (read on
   * 2026-11-16): inactive accounts 24 months (Lingokids, Sago Mini; Toca Boca
   * 2 years), logs 30–90 days (Lingokids), support 1 year (Toca Boca; Sago
   * Mini 3 years), backups overwritten in rotation (Lingokids). These are
   * PROMISES: the server must do them (APP.retentionJobs) before release.
   * The owner may change any of them here.
   */
  retention: {
    inactiveAccount: { en: "24 months without a sign-in or sync; we email you 30 days before deleting", tr: "24 ay boyunca giriş ya da eşitleme yoksa; silmeden 30 gün önce e-postayla haber verilir" } as L | null,
    deletionRecord: { en: "3 years, then deleted", tr: "3 yıl, sonra silinir" } as L | null,
    serverLogs: { en: "30 days", tr: "30 gün" } as L | null,
    supportMail: { en: "1 year after the request is closed", tr: "talep kapandıktan sonra 1 yıl" } as L | null,
    infraBackups: { en: "30 days; backups are overwritten in rotation", tr: "30 gün; yedekler sırayla üzerine yazılır" } as L | null,
    authProvider: { en: "30 days", tr: "30 gün" } as L | null,
  },
  /** transfers abroad: the mechanism actually in place, with dates (a KVKK
   *  standard contract is not the same thing as EU SCCs) */
  transfers: {
    en: "For providers outside Türkiye, we sign the standard contracts published by the Personal Data Protection Board under KVKK Article 9 and notify the Authority within five business days of signing.",
    tr: "Türkiye dışındaki sağlayıcılarla KVKK m.9 uyarınca Kişisel Verileri Koruma Kurulu'nun ilan ettiği standart sözleşmeleri imzalar, imzadan sonraki beş iş günü içinde Kurum'a bildiririz.",
  } as L | null,
  /** the site's host as checked on the live site: name, log period, own cookies */
  webHosting: null as L | null,
  pricing: null as L | null,
  legalBasesReviewed: false,
  legalReview: false,
};

/**
 * What the APP and SERVER must do before these pages can be published -- the
 * pages describe this behaviour as fact. Plan and evidence:
 * docs/GIZLILIK-INCELEMESI.md §4. Each is a yes from whoever shipped it.
 */
export const APP = {
  /** a deleted account stays deleted: no write from an old token re-creates it */
  deletionSticks: false,
  /** a parent can delete the server backup in the app, and no device re-uploads it without asking */
  backupDeletionInApp: false,
  /** "Başa dön" with an account resets on every device, not only this one */
  resetSticks: false,
  /** a restore from an infrastructure backup re-applies deletions made after it */
  restoreReplaysDeletions: false,
  /** the deletion record keeps no email address, and has a retention period */
  auditWithoutEmail: false,
  /** production backups are always encrypted, the key is managed, old ones are deleted */
  backupsEncryptedAndRotated: false,
  /** a link to the privacy policy inside the app, behind the parental gate */
  privacyLinkInApp: false,
  /** before an account is made: what is backed up is shown (and consent taken, if the lawyer says so) */
  noticeBeforeAccount: false,
  /** Expo updates vs. App Store 1.3 (device information to third parties): decided and done */
  updatesDecision: false,
  /** the release build shows no test tabs and asks the child nothing it does not need (name, age…) */
  reviewerUi: false,
  /** the retention periods in DECISIONS.retention are carried out: inactive-account job (with the
   *  30-day email), 30-day log rotation, auth log purge, deletion-record purge, support mailbox rule */
  retentionJobs: false,
  /** the KVKK standard contracts are signed with every provider outside Türkiye and notified to the Authority */
  transferContractsSigned: false,
};
const APP_SAYS: Record<keyof typeof APP, string> = {
  deletionSticks: "silinen hesap eski oturumla yeniden oluşmuyor",
  backupDeletionInApp: "uygulamada 'yedeği sil' ve 'yedeklemeyi durdur'; sessiz yeniden yükleme yok",
  resetSticks: "hesap açıkken 'Başa dön' kalıcı",
  restoreReplaysDeletions: "geri yüklemede silmeler yeniden uygulanıyor",
  auditWithoutEmail: "silme kaydında e-posta yok, süresi var",
  backupsEncryptedAndRotated: "yedekler hep şifreli, anahtar yönetiliyor, eskiler siliniyor",
  privacyLinkInApp: "uygulama içinde gizlilik bağlantısı",
  noticeBeforeAccount: "hesap açılmadan önce bilgilendirme (ve gerekiyorsa onay)",
  updatesDecision: "Expo güncellemeleri / App Store 1.3 kararı uygulandı",
  reviewerUi: "yayın sürümünde test sekmeleri yok, çocuktan ad/yaş istenmiyor",
  retentionJobs: "saklama süreleri uygulanıyor (24 ay hesap işi + 30 gün önce e-posta, 30 gün kayıt, giriş kaydı temizliği, 3 yıl silme kaydı, 1 yıl destek)",
  transferContractsSigned: "KVKK standart sözleşmeleri imzalandı ve Kurum'a bildirildi",
};

/** every blank or unverified fact, for the pages' marks and the release check */
export function missing(): string[] {
  const m: string[] = [];
  if (!SITE.url) m.push("SITE.url: gerçek alan adı");
  else if (!SITE.urlVerified) m.push("SITE.urlVerified: alan adı doğrulanmadı");
  if (!SITE.legalUpdated) m.push("SITE.legalUpdated: yasal metinlerin onay tarihi");
  for (const [k, v] of Object.entries(CONTROLLER)) {
    if ((k === "mersis" || k === "kep") && CONTROLLER.kind === "sole") continue;
    if (v === null || v === "") m.push(`CONTROLLER.${k}`);
  }
  PROVIDERS.forEach((p, i) => {
    const who = p.name ?? `PROVIDERS[${i}]`;
    if (!p.name) m.push(`PROVIDERS[${i}]: sağlayıcının adı (${p.what.tr})`);
    if (!p.verified) m.push(`PROVIDERS: "${who}" doğrulanmadı`);
    if (!p.region) m.push(`PROVIDERS: "${who}" veri bölgesi`);
    if (!p.role) m.push(`PROVIDERS: "${who}" rolü (sözleşmeye göre)`);
  });
  if (!DECISIONS.markets?.length) m.push("DECISIONS.markets: yayın ülkeleri");
  for (const [k, v] of Object.entries(DECISIONS.retention)) if (!v) m.push(`DECISIONS.retention.${k}`);
  if (!DECISIONS.transfers) m.push("DECISIONS.transfers: yurt dışı aktarım mekanizması");
  if (!DECISIONS.webHosting) m.push("DECISIONS.webHosting: sitenin barındırması, kayıt süresi, sağlayıcı çerezi");
  if (!DECISIONS.pricing) m.push("DECISIONS.pricing: fiyatlandırma");
  if (!DECISIONS.legalBasesReviewed) m.push("DECISIONS.legalBasesReviewed: hukuki sebepler hukukçu tarafından gözden geçirilmedi");
  if (!DECISIONS.legalReview) m.push("DECISIONS.legalReview: yasal metinler hukukçu tarafından onaylanmadı");
  for (const [k, ok] of Object.entries(APP)) if (!ok) m.push(`APP.${k}: ${APP_SAYS[k as keyof typeof APP]} (uygulama/sunucu)`);
  return m;
}
