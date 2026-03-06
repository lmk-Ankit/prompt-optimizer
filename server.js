require('dotenv').config();
const http = require('http');
let handler;
import('./api/optimize.js').then(m => handler = m.default);

const server = http.createServer(async (req, res) => {
    if (req.url === '/api/optimize' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // Mock Vercel Request (Edge Runtime uses Web API Request, not Node.js IncomingMessage)
                const mockReq = {
                    method: 'POST',
                    headers: req.headers,
                    json: async () => JSON.parse(body || '{}')
                };

                // The handler returns a Web API Response object in Vercel Edge Runtime
                const response = await handler(mockReq);

                // Read the response properties
                res.statusCode = response.status || 200;

                // Copy headers
                response.headers.forEach((val, key) => {
                    res.setHeader(key, val);
                });

                // Write body
                const respText = await response.text();
                res.end(respText);
            } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message, stack: err.stack }));
            }
        });
    } else {
        // Serve frontend files
        const fs = require('fs');
        const path = require('path');
        let filePath = '.' + req.url;
        if (filePath === './') filePath = './index.html';

        try {
            const extname = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css'
            }[extname] || 'text/plain';

            const content = fs.readFileSync(filePath);
            res.setHeader('Content-Type', contentType);
            res.end(content);
        } catch (err) {
            res.statusCode = 404;
            res.end('Not found');
        }
    }
});

server.listen(3000, () => {
    console.log('Server running closely matching Vercel on http://localhost:3000');
});
