const http = require('http');

const PROXY_PORT = 3001;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  const headers = { ...req.headers, host: `127.0.0.1:${TARGET_PORT}` };
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxying to Next.js on port 3000 failed: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Port 3001 proxy running -> forwards to http://127.0.0.1:${TARGET_PORT}`);
});
