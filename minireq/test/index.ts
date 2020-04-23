import * as assert from 'assert';
import { db, url } from './helpers';

import { makeRequest } from '../src/index';

describe('simple tests', () => {
    const request = makeRequest();

    it('should be able to make a simple GET request', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users'),
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);
        });
    });

    it('should allow to make a simple POST request', () => {
        const user = {
            name: 'Ingo',
            age: 9,
            children: [],
        };

        const { promise } = request({
            method: 'POST',
            url: url('/users'),
            send: user,
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 201);
            assert.deepStrictEqual(data, { ...user, id: 4 });
        });
    });

    it('should have a clean slate again', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users'),
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);
        });
    });
});
