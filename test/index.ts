import * as assert from 'assert';
import { db, url } from './helpers';

import { makeRequest } from '../src/index';

describe('simple tests', () => {
    const request = makeRequest();

    it('should be able to make a simple REST request', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users')
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);
        });
    });
});
