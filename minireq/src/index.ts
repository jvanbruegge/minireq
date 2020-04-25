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
    serializeSend
} from 'minireq-common';

export function makeRequest(
    serializers: Record<string, Serializer> = defaultSerializers,
    defaultOptions: Partial<RequestOptions> = {}
): <T = any, Type extends ResponseType = 'text'>(
    options: RequestOpts<METHOD, Type>
) => Result<ResultMapping<T>[Type]> {
    return function request<T = any, Type extends ResponseType = 'text'>(
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
            request.send(serializeSend(opts, serializers));
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
