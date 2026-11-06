// Builds one redirect page + one QR code per PDF page (8 pages).
// Each QR points to a GitHub Pages URL that redirects to TARGET.
// To change the destination later, edit TARGET (or the per-page file) and push: the printed QR never changes.
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const TARGET = "https://www.falabella.com/falabella-cl";
const PAGES = 8;
const BASE = "https://matias-240.github.io/pdf-qr-falabella";
const out = __dirname;

async function main() {
  const links = [];
  for (let i = 1; i <= PAGES; i++) {
    const id = `p${i}`;
    const dir = path.join(out, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0; url=${TARGET}">
<link rel="canonical" href="${TARGET}">
<title>Redirigiendo a Falabella</title>
</head>
<body>
<p>Redirigiendo a <a href="${TARGET}">Falabella Chile</a>...</p>
<script>location.replace("${TARGET}");</script>
</body>
</html>
`);
    const url = `${BASE}/${id}/`;
    await QRCode.toFile(path.join(out, `qr-${id}.png`), url, {
      errorCorrectionLevel: "M",
      margin: 4,
      scale: 10,
    });
    links.push({ page: i, redirect: url, target: TARGET });
  }

  fs.writeFileSync(
    path.join(out, "index.html"),
`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QR dinamicos - Falabella</title>
<style>
body{font-family:system-ui,sans-serif;margin:16px;background:#fff;color:#111}
h1{font-size:1.4rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.card{border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center}
.card img{width:100%;max-width:220px}
.card small{display:block;word-break:break-all;color:#555}
</style>
</head>
<body>
<h1>QR dinamicos (pagina 1 a ${PAGES}) &rarr; ${TARGET}</h1>
<div class="grid">
${links.map(l => `<div class="card"><img src="qr-p${l.page}.png" alt="QR pagina ${l.page}"><p><strong>Pagina ${l.page}</strong></p><small>${l.redirect}</small></div>`).join("\n")}
</div>
</body>
</html>
`);
  console.log(JSON.stringify(links, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
