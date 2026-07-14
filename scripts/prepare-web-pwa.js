const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const indexPath = path.join(distDir, 'index.html');

function copyPublicAssets() {
  if (!fs.existsSync(publicDir) || !fs.existsSync(distDir)) {
    return;
  }

  copyDirectory(publicDir, distDir);
}

function copyDirectory(fromDir, toDir) {
  fs.mkdirSync(toDir, { recursive: true });

  for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(fromPath, toPath);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

function injectBeforeHeadClose(html, markup) {
  return html.includes(markup) ? html : html.replace('</head>', `${markup}\n</head>`);
}

function injectBeforeBodyClose(html, markup) {
  return html.includes(markup) ? html : html.replace('</body>', `${markup}\n</body>`);
}

function patchIndexHtml() {
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html n\u00e3o encontrado. Rode npm run export:web antes.');
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace('<html lang="en">', '<html lang="pt-BR">');
  html = html.replace(/<title>.*?<\/title>/, '<title>GlicoA&#237;</title>');
  html = html.replace(/<script src=("[^"]+") defer><\/script>/g, '<script type="module" src=$1></script>');
  html = injectBeforeHeadClose(html, '<meta name="theme-color" content="#B80F0A">');
  html = injectBeforeHeadClose(html, '<meta name="apple-mobile-web-app-capable" content="yes">');
  html = injectBeforeHeadClose(html, '<meta name="apple-mobile-web-app-title" content="GlicoA&#237;">');
  html = injectBeforeHeadClose(html, '<meta name="apple-mobile-web-app-status-bar-style" content="default">');
  html = injectBeforeHeadClose(html, '<meta name="description" content="Acompanhe suas medições de glicose com leveza e clareza. Registre, visualize e entenda sua evolução.">');
  html = injectBeforeHeadClose(html, '<meta property="og:title" content="GlicoAí">');
  html = injectBeforeHeadClose(html, '<meta property="og:description" content="Acompanhe suas medições de glicose com leveza e clareza.">');
  html = injectBeforeHeadClose(html, '<meta property="og:type" content="website">');
  html = injectBeforeHeadClose(html, '<link rel="manifest" href="/manifest.webmanifest">');
  html = injectBeforeHeadClose(html, '<link rel="apple-touch-icon" href="/icons/icon.png">');
  html = injectBeforeHeadClose(
    html,
    '<style id="glicoai-web-shell">body{background:#F7F7F8;}#root{min-height:100%;background:#F7F7F8;}*{box-sizing:border-box;}@media(prefers-color-scheme:dark){body,#root{background:#000;}}</style>'
  );
  html = injectBeforeBodyClose(
    html,
    "<script>if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/service-worker.js').catch(function(){});});}</script>"
  );

  fs.writeFileSync(indexPath, html, 'utf8');
}

copyPublicAssets();
patchIndexHtml();

