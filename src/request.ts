import {
    METHOD,
    Serializer,
    RequestOptions,
    ResponseType,
    Result,
    ResultMapping
} from './types';

export const defaultSerializers = {
    'application/json': { parse: JSON.parse, convert: JSON.stringify }
};

export function makeRequest(
    serializers: Record<string, Serializer> = defaultSerializers,
    defaultOptions: Partial<RequestOptions<METHOD, ResponseType>> = {}
) {
    return function request<T = any, Type extends ResponseType = 'text'>(
        options: RequestOptions<METHOD, Type>
    ): Result<ResultMapping<T>[Type]> {
        let abort = () => {};

        const opts = { ...defaultOptions, ...options };

        const promise = new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            const url =
                opts.url + (opts.query ? makeQueryString(opts.query) : '');

            abort = () => {
                request.abort();
            };

            request.addEventListener('load', () => {
                let response: any = request.response;
                if (
                    request.responseType === 'text' ||
                    request.responseType === 'document'
                ) {
                    const mimeType = request
                        .getResponseHeader('Content-Type')
                        ?.split(';')[0];
                    if (mimeType && serializers[mimeType]) {
                        response = serializers[mimeType].parse(response);
                    }
                }

                resolve({
                    status: request.status,
                    data: response
                });
            });
            request.addEventListener('error', reject);

            request.open(
                opts.method,
                url,
                true,
                opts.auth?.user,
                opts.auth?.password
            );

            request.responseType = opts.responseType ?? 'text';

            if (opts.headers) {
                for (const key in opts.headers) {
                    request.setRequestHeader(key, opts.headers[key]);
                }
            }

            if (opts.progress) {
                request.addEventListener('progress', opts.progress);
            }

            if (opts.send) {
                if (
                    typeof opts.send === 'string' ||
                    opts.send instanceof Blob ||
                    opts.send instanceof ArrayBuffer ||
                    opts.send instanceof Int8Array ||
                    opts.send instanceof Uint8Array ||
                    opts.send instanceof Uint8ClampedArray ||
                    opts.send instanceof Int16Array ||
                    opts.send instanceof Uint16Array ||
                    opts.send instanceof Int32Array ||
                    opts.send instanceof Uint32Array ||
                    opts.send instanceof Float32Array ||
                    opts.send instanceof Float64Array ||
                    opts.send instanceof DataView ||
                    opts.send instanceof FormData ||
                    opts.send instanceof URLSearchParams
                ) {
                    request.send(opts.send);
                } else {
                    if (opts.contentType && serializers[opts.contentType]) {
                        request.send(
                            serializers[opts.contentType].convert(opts.send)
                        );
                    } else if (!opts.contentType) {
                        request.send(JSON.stringify(opts.send));
                    } else {
                        throw new Error(
                            `Could not find a serializer for content type ${opts.contentType}`
                        );
                    }
                }
            } else {
                request.send();
            }
        });

        return { promise: promise as any, abort };
    };
}

function makeQueryString(query: Record<string, any> | string): string {
    if (typeof query === 'string') return query;

    let str = '?';

    for (const key in query) {
        str += key + '=' + query[key] + '&';
    }

    if (str.slice(-1) === '&') {
        str = str.slice(0, -1);
    }

    return str;
}
