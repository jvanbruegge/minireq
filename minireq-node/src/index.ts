import {
    METHOD,
    Serializer,
    RequestOpts,
    RequestOptions,
    ResponseType,
    Result,
    ResultMapping,
    makeQueryString,
    serializeSend,
    defaultSerializers,
    defaults
} from 'minireq-common';
import * as http from 'http';
import * as https from 'https';

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

        if (opts.responseType === 'blob') {
            throw new Error(
                'Node.js does not support Blobs, use arraybuffer instead'
            );
        }

        let resolve: any;
        let reject: any;

        const h = /^http:\/\//.test(opts.url) ? http : https;

        const headers = {
            'Content-Type': opts.contentType,
            Accept: opts.accept,
            ...opts.headers
        } as Record<string, string>;

        if (opts.auth) {
            headers.Authorization = `Basic ${btoa(
                opts.auth.user + ':' + opts.auth.password
            )}`;
        }

        let data: any = '';
        const req = h.request(
            url,
            {
                method: opts.method,
                timeout: opts.timeout,
                headers
            },
            res => {
                if (opts.responseType !== 'arraybuffer') {
                    res.setEncoding('utf-8');
                }
                res.on('data', chunk => {
                    if (typeof chunk === 'string') {
                        data += chunk;
                    } else {
                        if (data === '') {
                            data = [];
                        } else {
                            data.push(chunk);
                        }
                    }
                });

                res.on('end', () => {
                    let response: any = Array.isArray(data)
                        ? Buffer.concat(data)
                        : data;
                    if (
                        typeof response === 'string' &&
                        opts.responseType === 'text'
                    ) {
                        const mimeType = (res.headers[
                            'Content-Type'
                        ] as string)?.split(';')[0];
                        if (mimeType && serializers[mimeType]?.parse) {
                            response = serializers[mimeType].parse!(response);
                        }
                    }

                    resolve({
                        status: res.statusCode,
                        data: response
                    });
                });
            }
        );

        req.on('error', reject);

        if (opts.send) {
            req.write(serializeSend(opts, serializers));
        }
        req.end();

        return {
            promise: new Promise<any>((res, rej) => {
                resolve = res;
                reject = rej;
            }),
            abort: () => req.abort()
        };
    };
}
