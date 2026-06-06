import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Proxy all /api requests to FastAPI backend
// Note: pathFilter preserves the full path (app.use("/api", ...) would strip the /api prefix)
app.use(
  createProxyMiddleware({
    pathFilter: "/api/**",
    target: "http://localhost:8000",
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
  })
);

// Serve frontend
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SignalAI frontend serving on http://localhost:${PORT} → API proxied to http://localhost:8000`);
});
