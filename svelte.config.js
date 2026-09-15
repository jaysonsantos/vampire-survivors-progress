import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// GitHub Pages serves a project site under /<repo>. The workflow sets BASE_PATH
// from the Pages configuration, which gives "/" for a root site and
// "/<repo>" for a project site. SvelteKit wants "" for the root.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

/** @type {import("@sveltejs/kit").Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    // There is no server: every unknown path falls back to the SPA shell.
    adapter: adapter({ fallback: "index.html", pages: "frontend/build", assets: "frontend/build" }),
    paths: { base: basePath, relative: false },
    files: {
      routes: "frontend/src/routes",
      lib: "frontend/src/lib",
      appTemplate: "frontend/src/app.html",
      assets: "frontend/static",
    },
    outDir: ".svelte-kit",
  },
};
