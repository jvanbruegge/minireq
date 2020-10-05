import * as express from 'express';
import * as cors from 'cors';

const app = express();
const port = 3000;

const data = require('./data.json');

app.use(express.json());
app.use(cors());

app.get('/', (_: any, res: any) => {
    res.sendStatus(200);
});

app.get('/users', (req: any, res: any) => {
    let users = data.users;

    if (req.query.id) {
        users = users.filter((x: any) => x.id == req.query.id);
    }
    if (req.query.age) {
        users = users.filter((x: any) => x.age == req.query.age);
    }
    if (req.query.name) {
        users = users.filter((x: any) => x.name == req.query.name);
    }

    if (
        req.header('Accept') === 'application/json' ||
        req.header('Accept') === '*/*'
    ) {
        res.json(users);
    } else if (req.header('Accept') === 'application/ndjson') {
        res.set('Content-Type', 'application/ndjson');
        res.status(200).send(
            users.map((x: any) => JSON.stringify(x)).join('\n')
        );
    } else res.sendStatus(415);
});

app.get('/document/html', (_: any, res: any) => {
    res.send(
        '<!DOCTYPE html><html><head></head><body><div></div></body></html>'
    );
});

app.get('/streaming', (_: any, res: any) => {
    let i = 1;
    const id = setInterval(() => {
        if (i > 10) {
            res.end();
            clearInterval(id);
        } else {
            res.write(`Chunk ${i++}\n`);
        }
    }, 10);
});

app.get('/headers', (req: any, res: any) => {
    if (req.header('X-Auth-Token') === 'superSecretToken') {
        res.set('Content-Type', 'text/plain');
        res.status(200).send(req.header('X-Echo'));
    } else {
        res.sendStatus(401);
    }
});

app.get('/secret', (req: any, res: any) => {
    if (req.header('Authorization') === 'Basic YWRtaW46YWRtaW4=') {
        res.sendStatus(200);
    } else res.sendStatus(401);
});

app.post('/users', (req: any, res: any) => {
    res.status(201).json({
        ...req.body,
        id: 4,
    });
});

app.listen(port, () => console.log(`Support server listening on port ${port}`));
