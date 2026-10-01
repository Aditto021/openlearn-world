import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// `public/` doubles as the build output dir (see publicDir:false below), so Vite's
// dev server never learns to serve it as static files. Without this, any real file
// under public/ (the standalone /tech/*.html pages, /academy.html, /books/*.pdf,
// favicon, manifest, etc.) gets swallowed by Vite's SPA history fallback and silently
// returns the React app shell instead of the actual file.
function servePublicFilesInDev(): Plugin {
  const publicDir = path.resolve(__dirname, 'public');
  const contentTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8'
  };
  return {
    name: 'serve-public-files-in-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url === '/') return next();
        const urlPath = req.url.split('?')[0];
        const ext = path.extname(urlPath).toLowerCase();
        if (!ext) return next();
        const filePath = path.join(publicDir, decodeURIComponent(urlPath));
        if (filePath.startsWith(publicDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          // No validators (ETag/Last-Modified) are sent, so without this the browser is
          // free to cache these files indefinitely on its own heuristics — meaning edits
          // to /tech/*.html, *.js, *.css can silently keep serving a stale copy even
          // after a hard refresh. This is dev-only middleware, so always-fresh is safe.
          res.setHeader('Cache-Control', 'no-store');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), servePublicFilesInDev()],
  publicDir: false,
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: { outDir: 'public', emptyOutDir: false }
});
