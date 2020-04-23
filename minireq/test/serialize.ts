import * as assert from 'assert';
import { url, db } from './helpers';

import { makeRequest, defaultSerializers } from '../src/index';

describe('serialization', () => {
    it('should be able to handle a serialize-only serializer', () => {
        const serializer = {
            convert: JSON.stringify
        };

        const request = makeRequest({
            'application/json': serializer
        });

        const { promise } = request({
            method: 'GET',
            url: url('/users')
        });

        const newUser = {
            name: 'Hans',
            age: 65,
            children: []
        };

        return promise
            .then(({ status, data }) => {
                assert.strictEqual(status, 200);
                assert.strictEqual(data, JSON.stringify(db.users));

                return request({
                    method: 'POST',
                    url: url('/users'),
                    send: newUser
                }).promise;
            })
            .then(({ status, data }) => {
                assert.strictEqual(status, 201);
                assert.deepStrictEqual(
                    data,
                    JSON.stringify({ ...newUser, id: 4 })
                );
            });
    });

    it('should be able to handle a deserialize-only serializer', () => {
        const serializer = {
            parse: JSON.parse
        };

        const request = makeRequest({
            'application/json': serializer
        });

        const { promise } = request({
            method: 'GET',
            url: url('/users')
        });

        const newUser = {
            name: 'Hans',
            age: 65,
            children: []
        };

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);

            assert.throws(() =>
                request({
                    method: 'POST',
                    url: url('/users'),
                    send: newUser
                })
            );
        });
    });

    it('should allow to add a serializer for a new mime type', () => {
        let usedNdJson = false;

        const serializers = {
            ...defaultSerializers,
            'application/ndjson': {
                parse: (s: string) => {
                    usedNdJson = true;
                    return s.split('\n').map(x => JSON.parse(x));
                }
            }
        };

        const request = makeRequest(serializers, {
            accept: 'application/ndjson'
        });

        const { promise } = request({
            method: 'GET',
            url: url('/users')
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.deepStrictEqual(data, db.users);
            assert.strictEqual(usedNdJson, true);
        });
    });
});
