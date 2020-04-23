import * as assert from 'assert';
import { db, url } from './helpers';

import { makeRequest } from '../src/index';

describe('queryString', () => {
    const request = makeRequest();

    it('should accept a premade queryString with ?', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users'),
            query: '?id=1'
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, [db.users[0]]);
        });
    });

    it('should accept a premade queryString without ?', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users'),
            query: 'age=40'
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, [db.users[0]]);
        });
    });

    it('should throw when passed an empty object as queryString', () => {
        assert.throws(() =>
            request({
                method: 'GET',
                url: url('/users'),
                query: {}
            })
        );
    });

    it('should be able to create a queryString from an object', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/users'),
            query: {
                name: 'Agnes',
                age: 18
            }
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, [db.users[1]]);
        });
    });
});
