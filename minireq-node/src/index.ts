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

        const h = /^http:\/\//.test(opts.url) ? http : https;

        const headers = {
            'Content-Type': opts.contentType,
            Accept: opts.accept,
            ...opts.headers
        } as Record<string, string>;

        if (opts.auth) {
            const base64 = Buffer.from(
                opts.auth.user + ':' + opts.auth.password
            ).toString('base64');
            headers.Authorization = `Basic ${base64}`;
        }

        let data: any = '';
        const req = h.request(url, {
            method: opts.method,
            timeout: opts.timeout,
            headers
        });

        const promise = new Promise<any>((resolve, reject) => {
            req.on('response', res => {
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
                            'content-type'
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
            });

            req.on('error', reject);
        });

        if (opts.send) {
            if (typeof opts.send === 'string') {
                //TODO: Add rest of possible types
                req.write(opts.send);
            } else if (serializers[opts.contentType!]?.convert) {
                req.write(serializers[opts.contentType!].convert!(opts.send));
            } else {
                req.abort();
                throw new Error(
                    `Could not find a serializer for content type ${opts.contentType}`
                );
            }
        }
        req.end();

        return {
            promise,
            abort: () => req.abort()
        };
    };
}
