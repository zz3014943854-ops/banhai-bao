import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isCloudflarePages = process.env.CF_PAGES === "1";

export default defineConfig({
  base: isCloudflarePages ? "/" : "/banhai-bao/",
  plugins: [react()],
});
