export * from './types';

export const defaultSerializers = {
    'application/json': { parse: JSON.parse, convert: JSON.stringify }
};

export const defaults = {
    contentType: 'application/json',
    responseType: 'text' as 'text',
    accept: '*/*'
};

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
