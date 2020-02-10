import * as assert from 'assert';

const db = require('./support/data.json');

import { makeRequest } from '../src/index';

const url = (path: string) => 'http://localhost:3000' + path;

describe('simple tests', () => {
    const request = makeRequest();

    it('should be able to make a simple REST request', done => {
        const { promise } = request({
            method: 'GET',
            url: url('/users')
        });

        promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);
            done();
        });
    });
});
