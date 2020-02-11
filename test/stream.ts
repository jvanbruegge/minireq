import * as assert from 'assert';
import { url } from './helpers';

import { makeRequest } from '../src/index';

describe('abort tests', () => {
    const request = makeRequest();

    let response = '';
    for (let i = 1; i <= 10; i++) {
        response += `Chunk ${i}\n`;
    }

    it('should be able to receive streaming responses', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/streaming')
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.strictEqual(data, response);
        });
    });

    it('should not send data after aborting request', done => {
        const { promise, abort } = request({
            method: 'GET',
            url: url('/streaming')
        });

        setTimeout(abort, 25);

        promise.then(() => assert.fail('should not deliver data'));

        setTimeout(done, 110);
    });

    it('should allow to monitor progress', () => {
        let progressed = false;

        const { promise } = request({
            method: 'GET',
            url: url('/streaming'),
            progress: ev => {
                progressed = ev.loaded > 0;
            }
        });

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.strictEqual(progressed, true);
            assert.strictEqual(data, response);
        });
    });

    it('should provide progress when aborting later', done => {
        let progressed = false;

        const { promise, abort } = request({
            method: 'GET',
            url: url('/streaming'),
            progress: ev => {
                progressed = ev.loaded > 0;
            }
        });

        promise.then(() => assert.fail('should not deliver data'));

        setTimeout(abort, 50);

        setTimeout(done, 110);
    });
});
