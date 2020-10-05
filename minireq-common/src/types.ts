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

export type ResponseType = 'raw_text' | 'binary' | 'parsed';

export type ResultMapping<T> = {
    binary: ArrayBuffer;
    raw_text: string;
    parsed: T;
};

export type RequestFn<T = any> = RequestFunction<T, ResponseType>;

export type RequestFunction<T = any, Type extends ResponseType = 'parsed'> = (
    options: RequestOpts<METHOD, Type>
) => Result<ResultMapping<T>[Type]>;

export type RequestOptions = RequestOpts<METHOD, ResponseType>;

export type Progress = {
    lengthComputable: boolean;
    loaded: number;
    total: number;
};

export type RequestOpts<Method, Type extends ResponseType> = {
    method: Method;
    url: string;
    headers?: {
        [name: string]: string;
    };
    /**
     * Either a premade query string or an object of key: value pairs
     */
    query?: string | Record<string, string | number | boolean>;
    /**
     * If this is an object, the contentType will be used to serialize it
     */
    send?:
        | string
        | Blob
        | Record<string, any>
        | BufferSource
        | FormData
        | URLSearchParams
        | ReadableStream;
    accept?: string;
    /**
     * @default 'application/json'
     */
    contentType?: string;
    /**
     * Credentials for HTTP basic auth
     */
    auth?: {
        user: string;
        password: string;
    };
    attach?: {
        [field: string]: Blob | File;
    };
    /**
     * A callback for listening to **download** progress events
     */
    progress?: (x: Progress) => void;
    /**
     * A callback for listening to **upload** progress events
     */
    uploadProgress?: (x: Progress) => void;
    agent?: {
        key: string;
        cert: string;
    };
    /**
     * Usually 'parsed' or 'arraybuffer' for binary data
     * @default 'parsed'
     */
    responseType?: Type;
    /**
     * Timeout in milliseconds
     */
    timeout?: number;
    onTimeout?: (x: Progress) => void;
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
    parse?: (data: string) => any;
    convert?: (obj: any) => string;
};
