const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const server = http.createServer(async (req, res) => {
  try {
    // Extract pathname, ignoring query strings
    const pathname = url.parse(req.url).pathname;

    // Serve HTML files from 'demo' directory
    if (pathname === '/' || pathname.endsWith('.html')) {
      const filePath = pathname === '/' ? 'index.html' : pathname.slice(1);
      const fullPath = path.join(__dirname, 'demo', filePath);
      const html = await fs.readFile(fullPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    }
    // Serve JSON files from 'calendars' directory under '/calendars'
    else if (pathname.startsWith('/calendars/') && pathname.endsWith('.json')) {
      const filePath = path.join(__dirname, 'calendars', pathname.slice(11));
      const json = await fs.readFile(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(json);
    }
    // Handle 404 for other routes
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
