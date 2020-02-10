import * as assert from 'assert';

import { makeRequest } from '../src/index';

describe('simple tests', () => {
    it('makeRequest should return a function', () => {
        assert.strictEqual(typeof makeRequest(), 'function');
    });
});
