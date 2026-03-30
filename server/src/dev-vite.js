import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite در حالت middleware — همان پورت Express؛ بدون پروکسی جدا.
 * پلاگین‌ها فقط از client/vite.config.js بارگذاری می‌شوند (اگر اینجا هم react() بگذاریم دوبار اجرا می‌شود و HMR خطای «RefreshRuntime» می‌دهد).
 */
export async function attachViteMiddleware(app) {
  const { createServer } = await import("vite");
  const clientRoot = path.join(__dirname, "..", "..", "client");
  const vite = await createServer({
    root: clientRoot,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  return vite;
}
