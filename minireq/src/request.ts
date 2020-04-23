import {
    METHOD,
    Serializer,
    RequestOpts,
    RequestOptions,
    ResponseType,
    Result,
    ResultMapping
} from './types';

export const defaultSerializers = {
    'application/json': { parse: JSON.parse, convert: JSON.stringify }
};

const defaults = {
    contentType: 'application/json',
    responseType: 'text' as 'text',
    accept: '*/*'
};

export function makeRequest(
    serializers: Record<string, Serializer> = defaultSerializers,
    defaultOptions: Partial<RequestOptions> = {}
): <T = any, Type extends ResponseType = 'text'>(
    options: RequestOpts<METHOD, Type>
) => Result<ResultMapping<T>[Type]> {
    return function request<T = any, Type extends ResponseType = 'text'>(
        options: RequestOpts<METHOD, Type>
    ): Result<ResultMapping<T>[Type]> {
        let abort: any;

        const opts = { ...defaults, ...defaultOptions, ...options };
        const url = opts.url + (opts.query ? makeQueryString(opts.query) : '');

        // Because fuck JavaScript Promises and their garbage error handing regarding throw
        let resolve: any;
        let reject: any;

        const request = new XMLHttpRequest();

        abort = () => {
            request.abort();
        };

        if (opts.timeout) request.timeout = opts.timeout;
        if (opts.onTimeout) {
            request.addEventListener('timeout', opts.onTimeout);
        }

        request.addEventListener('load', () => {
            let response: any = request.response;
            if (request.responseType === 'text') {
                const mimeType = request
                    .getResponseHeader('Content-Type')
                    ?.split(';')[0];
                if (mimeType && serializers[mimeType]?.parse) {
                    response = serializers[mimeType].parse!(response);
                }
            }

            resolve({
                status: request.status,
                data: response
            });
        });
        request.addEventListener('error', reject);

        request.open(opts.method, url, true);

        request.responseType = opts.responseType;

        if (opts.headers) {
            for (const key in opts.headers) {
                request.setRequestHeader(key, opts.headers[key]);
            }
        }
        request.setRequestHeader('Content-Type', opts.contentType);
        request.setRequestHeader('Accept', opts.accept);

        if (opts.auth) {
            request.setRequestHeader(
                'Authorization',
                `Basic ${btoa(opts.auth.user + ':' + opts.auth.password)}`
            );
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
            } else if (serializers[opts.contentType]?.convert) {
                request.send(serializers[opts.contentType].convert!(opts.send));
            } else {
                throw new Error(
                    `Could not find a serializer for content type ${opts.contentType}`
                );
            }
        } else {
            request.send();
        }

        return {
            promise: new Promise<any>((res, rej) => {
                resolve = res;
                reject = rej;
            }),
            abort
        };
    };
}

function makeQueryString(query: Record<string, any> | string): string {
    if (typeof query === 'string') {
        if (query.charAt(0) === '?') return query;
        else return '?' + query;
    }

    let str = '?';

    for (const key in query) {
        str += key + '=' + query[key] + '&';
    }

    if (str === '?') {
        throw new Error('An empty object is not valid as query parameter');
    }

    return str;
}
