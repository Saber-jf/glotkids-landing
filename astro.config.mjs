import { defineConfig } from "astro/config";
import { SITE } from "./src/site.ts";

// Static: plain files, hostable anywhere, no server code of ours.
export default defineConfig({
  site: SITE.url ?? "https://taslak.invalid",
  output: "static",
  outDir: "./dist",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
