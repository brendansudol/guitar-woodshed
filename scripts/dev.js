// Local preview: serves the folder at http://localhost:4173 with index.html wrapped on the fly.
const http = require('http'), fs = require('fs'), path = require('path');
const wrap = require('./wrap');
const root = path.join(__dirname, '..');
const port = process.env.PORT || 4173;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return res.end(wrap(fs.readFileSync(path.join(root, 'index.html'), 'utf8')));
  }
  const f = path.join(root, path.normalize(u));
  if (!f.startsWith(root + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('Guitar Woodshed running at http://localhost:' + port));
