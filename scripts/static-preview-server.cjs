const http = require('http');
const fs = require('fs');
const path = require('path');

const rootArgument = process.argv[2] || 'dist';
const portArgument = Number(process.argv[3] || '8084');
const rootDirectory = path.resolve(process.cwd(), rootArgument);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveFilePath(urlPathname) {
  const cleanPath = decodeURIComponent((urlPathname || '/').split('?')[0]);
  const requestedPath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
  let filePath = path.join(rootDirectory, requestedPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(rootDirectory, 'index.html');
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  try {
    const filePath = resolveFilePath(request.url || '/');
    const extension = path.extname(filePath).toLowerCase();
    const stream = fs.createReadStream(filePath);

    response.statusCode = 200;
    response.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream');
    stream.pipe(response);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(String(error));
  }
});

server.listen(portArgument, '127.0.0.1', () => {
  console.log(`Static preview running at http://127.0.0.1:${portArgument}`);
  console.log(`Serving ${rootDirectory}`);
});
