import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

/** The sources live under `frontend/`, and SvelteKit only allows its `lib` and `routes` folders by default. */
const SOURCE_ROOT = "frontend";

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173, strictPort: false, fs: { allow: [SOURCE_ROOT] } },
});
