import * as assert from 'assert';
import { url } from './helpers';

import { RequestFn } from 'minireq-common';

export function makeHeaderTests(request: RequestFn) {
    describe('header tests', () => {
        it('should be able to send headers on a request', () => {
            const echo = 'This is my message';

            const { promise } = request({
                method: 'GET',
                url: url('/headers'),
                headers: {
                    'X-Auth-Token': 'superSecretToken',
                    'X-Echo': echo
                }
            });

            return promise.then(({ status, data }) => {
                assert.strictEqual(status, 200);
                assert.strictEqual(data, echo);
            });
        });

        it('should be able to use authentication', () => {
            const { promise } = request({
                method: 'GET',
                url: url('/secret'),
                auth: {
                    user: 'admin',
                    password: 'admin'
                }
            });

            return promise.then(({ status }) => {
                assert.strictEqual(status, 200);
            });
        });
    });
}
