import { RequestOptions, Serializer } from './types';
export * from './types';

export const defaultSerializers = {
    'application/json': { parse: JSON.parse, convert: JSON.stringify }
};

export const defaults = {
    contentType: 'application/json',
    responseType: 'text' as 'text',
    accept: '*/*'
};

export function serializeSend(
    opts: RequestOptions,
    serializers: Record<string, Serializer>
): any {
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
        return opts.send;
    } else if (serializers[opts.contentType!]?.convert) {
        return serializers[opts.contentType!].convert!(opts.send);
    } else {
        throw new Error(
            `Could not find a serializer for content type ${opts.contentType}`
        );
    }
}

export function makeQueryString(
    query: Record<string, any> | string | undefined
): string {
    if (!query) {
        return '';
    }
    if (typeof query === 'string') {
        if (query.charAt(0) === '?') {
            return query;
        } else {
            return '?' + query;
        }
    }

    let str = '?';

    for (const key of Object.keys(query)) {
        str +=
            encodeURIComponent(key) +
            '=' +
            encodeURIComponent(query[key]) +
            '&';
    }

    if (str === '?') {
        throw new Error('An empty object is not valid as query parameter');
    }

    return str;
}
