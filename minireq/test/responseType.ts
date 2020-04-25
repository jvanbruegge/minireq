import * as assert from 'assert';
import { makeRequest } from '../src/index';
import { url } from '../../test/helpers';

const request = makeRequest();

describe('responseType tests (browser-only)', () => {
    it('should return HTML documents with `document` responseType', () => {
        const { promise } = request({
            method: 'GET',
            url: url('/document/html'),
            responseType: 'document'
        });

        const structure = {
            tag: 'HTML',
            children: [
                { tag: 'HEAD', children: [] },
                { tag: 'BODY', children: [{ tag: 'DIV', children: [] }] }
            ]
        };

        return promise.then(({ status, data }) => {
            assert.strictEqual(status, 200);
            assert.strictEqual(data instanceof Document, true);

            const buildStructure = (node: Element): any => {
                return {
                    tag: node.tagName,
                    children: [].slice.call(node.children).map(buildStructure)
                };
            };

            assert.deepStrictEqual(buildStructure(data.children[0]), structure);
        });
    });
});
