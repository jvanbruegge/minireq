export type GET = 'GET';
export type HEAD = 'HEAD';
export type POST = 'POST';
export type PUT = 'PUT';
export type DELETE = 'DELETE';
export type CONNECT = 'CONNECT';
export type OPTIONS = 'OPTIONS';
export type TRACE = 'OPTIONS';
export type PATCH = 'PATCH';

export type METHOD =
    | GET
    | HEAD
    | POST
    | PUT
    | DELETE
    | CONNECT
    | OPTIONS
    | TRACE
    | PATCH;

export type ResponseType =
    | 'text'
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json';

export type ResultMapping<T> = {
    arraybuffer: ArrayBuffer;
    blob: Blob;
    document: Document;
    json: T;
    text: T;
};

export type RequestOptions<Method, Type extends ResponseType> = {
    method: Method;
    url: string;
    headers?: {
        [name: string]: string;
    };
    query?: string | Record<string, string | number | boolean>;
    send?:
        | string
        | Blob
        | Record<string, any>
        | BufferSource
        | FormData
        | URLSearchParams
        | ReadableStream;
    accept?: string;
    contentType?: string;
    auth?: {
        user: string;
        password: string;
    };
    attach?: {
        [field: string]: Blob | File;
    };
    progress?: (x: ProgressEvent) => void;
    agent?: {
        key: string;
        cert: string;
    };
    redirects?: boolean | number;
    responseType?: Type;
};

export type Response<T> = {
    data: T;
    status: number;
};

export type Result<T> = {
    promise: Promise<Response<T>>;
    abort: () => void;
};

export type Serializer = {
    parse: (data: string) => any;
    convert: (obj: any) => string;
};
