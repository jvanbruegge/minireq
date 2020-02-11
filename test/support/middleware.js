const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'data.json'), {
    encoding: 'utf-8'
});

module.exports = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/api/reset') {
        req.app.db.setState(JSON.parse(data));
        res.sendStatus(200);
    } else if (req.method === 'GET' && req.path === '/document/html') {
        const html =
            '<!DOCTYPE html><html><head></head><body><div></div></body></html>';
        res.send(html);
    } else if (req.method === 'GET' && req.path === '/streaming') {
        let i = 1;

        const id = setInterval(() => {
            if (i > 10) {
                res.end();
                clearInterval(id);
            } else {
                res.write(`Chunk ${i++}\n`);
            }
        }, 10);
    } else next();
};
