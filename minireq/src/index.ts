import {
    METHOD,
    Serializer,
    RequestOpts,
    RequestOptions,
    ResponseType,
    Result,
    ResultMapping,
    makeQueryString,
    defaultSerializers,
    defaults,
} from '@minireq/common';

export {
    GET,
    HEAD,
    POST,
    PUT,
    DELETE,
    CONNECT,
    OPTIONS,
    TRACE,
    PATCH,
    METHOD,
    ResponseType,
    ResultMapping,
    RequestFn,
    RequestFunction,
    RequestOptions,
    Progress,
    RequestOpts,
    Response,
    Result,
    Serializer,
} from '@minireq/common';

export function makeRequest(
    serializers: Record<string, Serializer> = defaultSerializers,
    defaultOptions: Partial<RequestOptions> = {}
): <T = any, Type extends ResponseType = 'parsed'>(
    options: RequestOpts<METHOD, Type>
) => Result<ResultMapping<T>[Type]> {
    return function request<T = any, Type extends ResponseType = 'parsed'>(
        options: RequestOpts<METHOD, Type>
    ): Result<ResultMapping<T>[Type]> {
        const opts = { ...defaults, ...defaultOptions, ...options };
        const url = opts.url + makeQueryString(opts.query);

        // Because fuck JavaScript Promises and their garbage error handing regarding throw
        let resolve: any;
        let reject: any;

        const request = new XMLHttpRequest();

        const abort = () => {
            request.abort();
        };

        if (opts.timeout) request.timeout = opts.timeout;
        if (opts.onTimeout) {
            request.addEventListener('timeout', opts.onTimeout);
        }

        request.addEventListener('load', () => {
            let response: any = request.response;
            if (opts.responseType === 'parsed') {
                const mimeType = request
                    .getResponseHeader('Content-Type')
                    ?.split(';')[0];
                if (mimeType && serializers[mimeType]?.parse) {
                    response = serializers[mimeType].parse!(response);
                }
            }

            resolve({
                status: request.status,
                data: response,
            });
        });
        request.addEventListener('error', reject);

        if (opts.progress) {
            request.onprogress = opts.progress;
        }
        if (opts.uploadProgress) {
            request.upload.onprogress = opts.uploadProgress;
        }

        request.open(opts.method, url, true);

        request.responseType =
            opts.responseType === 'binary' ? 'arraybuffer' : 'text';

        if (opts.headers) {
            for (const key in opts.headers) {
                request.setRequestHeader(key, opts.headers[key]);
            }
        }
        if (opts.contentType) {
            request.setRequestHeader('Content-Type', opts.contentType);
        }
        if (opts.accept) {
            request.setRequestHeader('Accept', opts.accept);
        }

        if (opts.auth) {
            request.setRequestHeader(
                'Authorization',
                `Basic ${btoa(opts.auth.user + ':' + opts.auth.password)}`
            );
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
            } else if (serializers[opts.contentType!]?.convert) {
                request.send(
                    serializers[opts.contentType!].convert!(opts.send)
                );
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
            abort,
        };
    };
}
