// The release check.
//
//   node scripts/check.mjs pre    before a build: the site's address and contact are real
//   node scripts/check.mjs post   after a build: nothing in the pages a visitor
//                                 must never see (example addresses, the draft banner)
//
// `npm run build` runs both. A preview is `npm run build:draft` (DRAFT=1):
// dist-taslak/, a banner and noindex on every page.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];
const draft = process.env.DRAFT === "1";

if (mode === "pre") {
  const { SITE } = await import("../src/site.ts");
  const m = [];
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/i.test(SITE.url ?? "")) m.push("SITE.url: https ile başlayan bir alan adı değil");
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(SITE.email ?? "")) m.push("SITE.email: geçerli bir e-posta değil");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(SITE.legalUpdated ?? "")) m.push("SITE.legalUpdated: tarih yok");
  if (!m.length) { console.log("yayın kontrolü (önce): tamam"); process.exit(0); }
  console.error(`\nYAYIN DURDU (src/site.ts):\n  - ${m.join("\n  - ")}\n`);
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
  console.log(`\nTaslak işaretleri (${out}):\n  ${hits.join("\n  ")}`);
  if (draft) { console.log("\nTASLAK derlemesi: dist-taslak/ yayımlanmaz."); process.exit(0); }
  console.error("\nYAYIN DURDU: üretim derlemesinde taslak işareti kaldı."); process.exit(1);
}
console.error("kullanım: node scripts/check.mjs pre|post"); process.exit(2);
