// Builds the standalone site into dist/ (what GitHub Pages serves).
const fs = require('fs'), path = require('path');
const wrap = require('./wrap');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), wrap(fs.readFileSync(path.join(root, 'index.html'), 'utf8')));
for (const f of fs.readdirSync(path.join(root, 'js'))) fs.copyFileSync(path.join(root, 'js', f), path.join(out, 'js', f));
fs.copyFileSync(path.join(root, 'share.png'), path.join(out, 'share.png'));
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Built dist/ (' + fs.readdirSync(path.join(out, 'js')).length + ' scripts)');
