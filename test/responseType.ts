import * as assert from 'assert';
import { url } from './helpers';

import { RequestFn } from 'minireq-common';

export function makeResponseTypeTests(request: RequestFn) {
    describe('responseType tests', () => {
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
                        children: [].slice
                            .call(node.children)
                            .map(buildStructure)
                    };
                };

                assert.deepStrictEqual(
                    buildStructure(data.children[0]),
                    structure
                );
            });
        });
    });
}
