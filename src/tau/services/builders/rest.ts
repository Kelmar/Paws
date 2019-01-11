/* ================================================================================================================= */
/* ================================================================================================================= */

const https = require('https');

import {ServiceBuilder, FunctionDefinition, void_return, arg } from './base';

/* ================================================================================================================= */

export class RestServiceBuilder<T> extends ServiceBuilder<T>
{
    constructor (public readonly baseUrl: string)
    {
        super();
    }

    protected buildFunction(fn: FunctionDefinition<T>): Function
    {
        let extras = {...{ verb: 'GET', path: fn.name }, ...fn.extras};
        let baseFnUrl = this.baseUrl + extras.path;

        class Request
        {
            public uri: string = baseFnUrl;

            public uriArgs: string[] = [];
            public bodyArgs: string[] = [];
        }

        interface reader
        {
            (req: Request, value: any): void;
        }

        let readers: reader[] = [];

        for (let i = 0; i < fn.arguments.length; ++i)
        {
            let extra = {...{ as: 'URI', encode: null }, ...fn.arguments[i].extra};
            let name = fn.arguments[i].name;

            if (extra.as == 'URI')
            {
                let encodeFn: (x: any) => string = extra.encode || encodeURI;
                readers.push((req: Request, v: any) => {
                    req.uri = req.uri.replace('{' + name + '}', encodeFn(v));
                });
            }
            else
            {
                let encodeFn: (x: any) => string = extra.encode || JSON.stringify;
                readers.push((req: Request, v: any) => req.bodyArgs.push(encodeFn(v)));
            }
        }

        return async (...args: any): Promise<any> =>
        {
            let state = new Request();

            for (let i = 0; i < fn.arguments.length; ++i)
            {
                if (i >= args.length)
                    break;

                let value = args[i];
                readers[i](state, value);
            }

            if (state.uriArgs.length > 0)
                state.uri += "?" + state.uriArgs.join('&');

            let promise = new Promise<any>((resolve, reject) => {
                let req = https.request(state.uri, (response: any) =>
                {
                    if (response.statusCode < 200 || response.statusCode >= 300)
                        reject(new Error('statusCode=' + response.statusCode));

                    const buf: Buffer[] = [];

                    response.on('data', (chunk: Buffer) => {
                        buf.push(chunk)
                    });
    
                    response.on('end', () =>
                    {
                        if (fn.returnFn === void_return)
                        {
                            resolve();
                            return;
                        }

                        try
                        {
                            let body = Buffer.concat(buf).toString();
                            resolve(fn.returnFn(body));
                        }
                        catch (e)
                        {
                            reject(e);
                        }
                    });
                });

                req.on('error', (err: any) => reject(err));
                req.end();
            });

            return (await promise);
        };

    }
}

/* ================================================================================================================= */
/**
 * Defines a parameter that is a subsitution in the URI.
 *
 * @param name The name of the URI parameters.
 */
export function uri<T>(name: string): T
{
    return arg<T>(name);
}

/**
 * Defines a parameter as being the body data of a request.
 *
 * @param name The name of the parameter
 */
export function body<T>(name: string): T
{
    return arg<T>(name, { as: 'BODY' });
}

/* ================================================================================================================= */
/**
 * Defines a new RESTful service.
 *
 * @param baseUrl The base URL for the RESTful service.
 */
export function rest<T>(baseUrl: string): ServiceBuilder<T>
{
    return new RestServiceBuilder<T>(baseUrl);
}

/* ================================================================================================================= */
/**

// Test model class

class Todo
{
    constructor (
        public readonly userId: number,
        public readonly id: number,
        public readonly title: string,
        public readonly completed: boolean
    )
    {}
}

// Sample rest service:

export interface ITodoRepo
{
    get(id: number): Promise<Todo>;
    add(t: Todo): Promise<void>;
    update(t: Todo): Promise<void>;
}

let builder = rest<ITodoRepo>('https://jsonplaceholder.typicode.com/');

builder
    .setup(x => x.get(uri('id')))
    .define({ path: 'todos/{id}' })
    .returns<Todo>();

builder
    .setup(x => x.add(body('todo')))
    .define({ path: 'todos' });

builder
    .setup(x => x.update(body('todo')))
    .define({ verb: 'PUT', path: 'todos' });

let todoRepo = builder.build();

todoRepo.get(1)
    .then(todo =>
    {
        console.log('result:', todo);
    });

*/

/* ================================================================================================================= */
