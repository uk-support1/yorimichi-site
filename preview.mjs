// ローカル確認用サーバー。使い方: node preview.mjs  →  http://localhost:8080/yorimichi-site/
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const docs = join(dirname(fileURLToPath(import.meta.url)), 'docs');
const base = '/yorimichi-site/';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(302, { Location: base }); return res.end(); }
  if (!p.startsWith(base)) { res.writeHead(404); return res.end('not found'); }
  p = normalize(p.slice(base.length));
  if (p.startsWith('..')) { res.writeHead(403); return res.end(); }
  if (p === '' || p === '.' || p.endsWith('\\') || p.endsWith('/')) p = join(p, 'index.html');
  try {
    const data = await readFile(join(docs, p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    try { const nf = await readFile(join(docs, '404.html')); res.writeHead(404, { 'Content-Type': types['.html'] }); res.end(nf); }
    catch { res.writeHead(404); res.end('not found'); }
  }
}).listen(8080, () => {
  const url = 'http://localhost:8080' + base;
  console.log('プレビュー中: ' + url + '\n(止めるときは Ctrl+C)');
  exec(`start "" "${url}"`);
});
