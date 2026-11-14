// index.html is a page fragment (title, styles, markup, scripts) so it can be published as a Claude
// artifact unchanged. This wraps it in a full HTML document for local preview and GitHub Pages.
const DESCRIPTION = 'A free guitar course and a room full of practice tools: learn the neck and the number system, decode your songs, jam with a backing band in any key, and train your ear. No sign-up.';
// Where the site is served. Link previews need absolute URLs, so the share image is addressed from here.
const SITE = 'https://brendansudol.github.io/guitar-woodshed/';
const SHARE_ALT = 'Guitar Woodshed. Learn the system, not the song. Below, a guitar neck with a scale marked in colored dots.';
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%2315202b'/%3E%3Cpath d='M5 9h3l2.2 10L12.6 9h2.8l2.4 10L20 9h3l-3.6 14h-3L14 13.6 11.6 23h-3z' fill='%23ff5a3d'/%3E%3C/svg%3E";

module.exports = function wrap(fragment) {
  const m = /<title>([\s\S]*?)<\/title>\s*/.exec(fragment);
  const title = m ? m[1].trim() : 'Guitar Woodshed';
  const body = m ? fragment.replace(m[0], '') : fragment;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${DESCRIPTION}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}">
<meta property="og:site_name" content="${title}">
<meta property="og:title" content="${title}: learn the system, not the song">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:image" content="${SITE}share.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${SHARE_ALT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}share.png">
<meta name="twitter:image:alt" content="${SHARE_ALT}">
<link rel="icon" href="${ICON}">
<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;
};
