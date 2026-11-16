// The release gate.
//
//   node scripts/check.mjs pre    before a PRODUCTION build: every required
//                                 fact in src/site.ts known and verified, or stop
//   node scripts/check.mjs post   after a build: nothing in the pages that a
//                                 visitor must never see (blank marks, example
//                                 addresses, the draft banner)
//
// `npm run build` runs both and fails on anything. A preview with blanks is
// `npm run build:draft` (DRAFT=1): it goes to dist-taslak/, carries a
// "TASLAK" banner and noindex on every page, and is never a release.
// Removing the word from a page proves nothing: `pre` reads src/site.ts.
import { readdirSync, readFileSync, statSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];
const draft = process.env.DRAFT === "1";

if (mode === "pre") {
  const { missing, CONTROLLER, SITE } = await import("../src/site.ts");
  const m = missing();
  /* a filled-in field can still be a placeholder */
  const fake = /(todo|alanadi|example\.|ornek|örnek|test@|@localhost|xxx|lorem|\.invalid)/i;
  for (const [k, v] of Object.entries({ ...CONTROLLER, url: SITE.url })) {
    if (typeof v === "string" && fake.test(v)) m.push(`${k}: örnek/yer tutucu değer ("${v}")`);
  }
  for (const k of ["privacyEmail", "supportEmail"]) {
    const v = CONTROLLER[k];
    if (v && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) m.push(`CONTROLLER.${k}: geçerli bir e-posta değil`);
  }
  if (SITE.url && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/i.test(SITE.url)) m.push(`SITE.url: https ile başlayan bir alan adı değil`);
  if (!m.length) { console.log("yayın kontrolü (önce): tamam"); process.exit(0); }
  console.error(`\nYAYIN DURDU: ${m.length} zorunlu bilgi eksik ya da doğrulanmadı (src/site.ts):\n  - ${m.join("\n  - ")}`);
  console.error("\nTaslak önizleme için: npm run build:draft  (dist-taslak/, yayımlanamaz)\n");
  /* an older dist/ must not be mistaken for this release */
  rmSync("dist", { recursive: true, force: true });
  process.exit(1);
}

if (mode === "post") {
  const out = draft ? "dist-taslak" : "dist";
  if (!existsSync(out)) { console.error(`${out} yok`); process.exit(1); }
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const marks = [/\[Doldurulacak/g, /\[To be filled/g, /\bTODO\b/g, /data-draft/g, /alanadi/gi, /example\.(com|org)/gi, /\.invalid/g];
  const hits = [];
  for (const f of walk(out).filter((f) => f.endsWith(".html"))) {
    const s = readFileSync(f, "utf8");
    const n = marks.reduce((a, re) => a + (s.match(re)?.length ?? 0), 0);
    if (n) hits.push(`${f.slice(out.length)}: ${n}`);
  }
  if (!hits.length) { console.log(`yayın kontrolü (sonra): ${out} temiz`); process.exit(0); }
  console.log(`\nDoldurulacak / taslak işaretleri (${out}):\n  ${hits.join("\n  ")}`);
  if (draft) { console.log("\nTASLAK derlemesi: dist-taslak/ yayımlanmaz."); process.exit(0); }
  console.error("\nYAYIN DURDU: üretim derlemesinde taslak işareti kaldı."); process.exit(1);
}
console.error("kullanım: node scripts/check.mjs pre|post"); process.exit(2);
