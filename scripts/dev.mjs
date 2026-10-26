import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const root = fileURLToPath(new URL(process.argv.includes('--dist') ? '../dist/' : '../', import.meta.url));
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.wav': 'audio/wav' };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = file.slice(root.length);
    if (!file.startsWith(root) || relative.split(sep).some(part => part.startsWith('.')) || !['/index.html', '/styles.css', '/animations.css'].includes(pathname) && pathname !== '/' && !/^\/(assets|src)\//.test(pathname)) {
      res.writeHead(404);res.end('Not found');return;
    }
    if (!(await stat(file)).isFile()) { res.writeHead(404);res.end('Not found');return; }
    const contents = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(contents);
  } catch { res.writeHead(404);res.end('Not found'); }
});

server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message);process.exitCode = 1; });
