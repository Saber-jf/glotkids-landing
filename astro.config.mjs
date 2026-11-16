import { defineConfig } from "astro/config";
import { SITE } from "./src/site.ts";

// Static: plain files, hostable anywhere, no server code of ours.
// A draft (DRAFT=1, `npm run build:draft`) goes to its own folder so it can
// never be the folder that is deployed (scripts/check.mjs).
const draft = process.env.DRAFT === "1";
export default defineConfig({
  site: SITE.url ?? "https://taslak.invalid",
  output: "static",
  outDir: draft ? "./dist-taslak" : "./dist",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
