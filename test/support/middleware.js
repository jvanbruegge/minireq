const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'data.json'), {
    encoding: 'utf-8'
});

module.exports = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/api/reset') {
        req.app.db.setState(JSON.parse(data));
        res.sendStatus(200);
    } else next();
};
