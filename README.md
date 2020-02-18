# minireq

![build](https://github.com/jvanbruegge/minireq/workflows/Continous%20Integration/badge.svg) ![docs](https://github.com/jvanbruegge/minireq/workflows/Documentation/badge.svg) [![codecov](https://codecov.io/gh/jvanbruegge/minireq/branch/master/graph/badge.svg)](https://codecov.io/gh/jvanbruegge/minireq) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A minimal request library built on XMLHTTPRequest for the browser.

Documentation on [Github Pages](https://jvanbruegge.github.io/minireq/)

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

// Abort on user click
document.querySelector('button.abortRequest').addEventListener('click', () => {
    abort();
});

promise.then(({ status, data }) => {
    if (status === 200) {
        console.log(data.name);
    }
});
```

Making a post request, with a timeout on 500ms

```ts
import { makeRequest } from 'minireq';

const request = makeRequest();

const { promise } = request({
    method: 'POST',
    url: '/api/users',
    send: {
        name: 'Peter',
        age: 50,
        children: []
    },
    timeout: 500
});

promise.then(({ status, data }) => {
    if (status === 201) {
        console.log(data.id);
    }
});
```

Using a custom content type

```ts
import { makeRequest, defaultSerializers } from 'minireq';

const serializer = {
    parse: (data: string) => data.split('\n').map(x => JSON.parse(x)),
    convert: (data: any) => {
        if (!Array.isArray(data)) {
            return [JSON.stringify(data)];
        } else {
            return data.map(x => JSON.stringify(x)).join('\n');
        }
    }
};

const { request } = makeRequest({
    ...defaultSerializers,
    'application/ndjson': serializer
});

const { promise, abort } = request({
    method: 'GET',
    url: '/api/users',
    accept: 'application/ndjson'
});

const { status, data } = await promise;

if (status === 200) {
    console.log(data.length);
}
```
