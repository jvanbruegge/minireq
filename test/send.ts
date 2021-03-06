import * as assert from 'assert';
import { url } from './helpers';

import { RequestFn } from '@minireq/common';

export function makeSendTests(request: RequestFn) {
    describe('send tests', () => {
        it('should send strings without serializing first', () => {
            const str = JSON.stringify({
                name: 'Hans',
                age: 99,
                children: [],
            });

            const { promise } = request({
                method: 'POST',
                url: url('/users'),
                send: str,
            });

            return promise.then(({ status, data }) => {
                assert.strictEqual(status, 201);
                assert.deepStrictEqual(data, { ...JSON.parse(str), id: 4 });
            });
        });

        it('should throw error if passed an object without serializer', () => {
            assert.throws(() =>
                request({
                    method: 'POST',
                    url: url('/users'),
                    send: {
                        foo: 'bar',
                    },
                    contentType: 'application/xml',
                })
            );
        });
    });
}
