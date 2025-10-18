// app/server.js
require('dotenv').config(); // loads variables from .env for local/dev

const http = require('http');

const {
  PORT = 3000,
  SECRET_MESSAGE = 'shh',
  USERNAME = 'admin',
  PASSWORD = 'supersecret',
} = process.env;

function unauthorized(res, message = 'Unauthorized') {
  res.writeHead(401, {
    'Content-Type': 'text/plain',
    'WWW-Authenticate': 'Basic realm="Restricted Area"',
  });
  res.end(message);
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  if (idx < 0) return null;
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

const server = http.createServer((req, res) => {
  // 1) Public route
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Hello, world!');
  }

  // 2) Protected route with Basic Auth
  if (req.method === 'GET' && req.url === '/secret') {
    const creds = parseBasicAuth(req.headers['authorization']);
    if (!creds) return unauthorized(res);

    if (creds.user !== USERNAME || creds.pass !== PASSWORD) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden: invalid credentials');
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(SECRET_MESSAGE);
  }

  // 3) Fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
