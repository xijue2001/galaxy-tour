import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const relative = pathname === '/' ? 'index.html' : pathname.startsWith('/vendor/three/') ? `node_modules/three/${pathname.slice(14)}` : pathname.slice(1);
    const file = resolve(root, relative);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !/^(index\.html|comparison\.html|motion\.html|style\.css|favicon\.svg|src\/[^/]+\.js|node_modules\/three\/(build|examples\/jsm)\/.+\.js|assets\/[^/]+\.(jpg|png|webp)|screenshots\/(?:v[345]\/)?[^/]+\.(jpg|png)|(?:README|PROJECT_STATUS|SCIENCE_SOURCES|SCIENCE_GALAXY|VISUAL_SOURCES|CATALOG|MOTION_SOURCES|COSMIC_SOURCES)\.md)$/.test(relative)) {
      res.writeHead(404); return res.end('Not found');
    }
    if (!(await stat(file)).isFile()) { res.writeHead(404); return res.end('Not found'); }
    let body = await readFile(file);
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
    if (/gzip/.test(req.headers['accept-encoding'] || '') && /\.(js|css|html|svg)$/.test(file)) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; headers.Vary = 'Accept-Encoding'; }
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers); res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', error => { console.error(`Unable to start preview: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Galaxy Tour preview: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
