/**
 * Vercel production build only — do not use for local dev (use vite.config.ts).
 * Adds Nitro with Vercel preset for TanStack Start SSR on Vercel Functions.
 */
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({
      preset: process.env.NITRO_PRESET || "vercel",
    }),
  ],
});
