# minireq

[![jvanbruegge](https://circleci.com/gh/jvanbruegge/minireq.svg?style=shield)](https://app.circleci.com/github/jvanbruegge/minireq/pipelines) [![codecov](https://codecov.io/gh/jvanbruegge/minireq/branch/master/graph/badge.svg)](https://codecov.io/gh/jvanbruegge/minireq) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A minimal request library built on XMLHTTPRequest for the browser.

## Why not fetch, axios or superagent

`fetch` is too bare bones and also does not support features like progress indication. `axios` and `superagent` are neither minimal nor are they written with ES modules with makes them awkward to bundle.

Also I want a request library with better types than currently available.

## Example

```ts
import { makeRequest } from 'minireq';

const request = makeRequest();

const { promise, abort } = request({
    method: 'GET',
    url: '/api/users'
});

promise.then(({ status, data }) => {
    if (status === 200) {
        console.log(data.name);
    }
});
```

## API

### `makeRequest(serializers, defaultOptions): request`

`serializers` is a record of mime type to a combo of parsing and conversion function. If this argument is missing a default serializer is used:

```ts
const defaultSerializers = {
    'application/json': { parse: JSON.parse, convert: JSON.stringify }
};
```

`defaultOptions` is a normal `RequestOptions` object that can be used to set custom default values for any field.

### `request(requestOptions): Result`

All possible options are:

```
{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'CONNECT' | 'TRACE';
    url: string;
    headers?: {
        [name: string]: string;
    };
    query?: string | Record<string, string>;
    send?:                        # If this is an object it will be serialized
        | string                  # depending on the contentType field.
        | Blob                    # for an undefined content type it will default to json
        | Record<string, any>     # else it will try to use the correct serializer or error
        | BufferSource
        | FormData
        | URLSearchParams
        | ReadableStream;
    accept?: string;              # Defaults to */*
    contentType?: string;
    auth?: {
        user: string;
        password?: string;
    };
    attach?: {
        [field: string]: Blob | File;
    };
    progress?: (x: ProgressEvent) => void; # Callback to receive progress events
    agent?: {
        key: string;
        cert: string;
    };
    redirects?: boolean | number;
    responseType?: 'text' | 'arraybuffer' | 'blob' | 'document' | 'json'; # Defaults to text
};
```

### Result

```ts
{
    abort: () => void; // Call this function to abort the request
    promise: Promise<Response>;
}
```

### Response

The response is parsed using the serializers and the `Content-Type` header. If no serializer is found, the raw string is returned. For `responseType` other than `text` and `document` the corresponding type is returned (`ArrayBuffer` for `arraybuffer`, `Blob` for `blob` and parsed JSON for `json`);
