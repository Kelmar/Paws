/* ================================================================================================================= */
/* ================================================================================================================= */

export interface GenericFunction { (...args: any[]): any; }

export const void_return = function(value: string): void { }

export class ArgumentDefinition
{
    constructor (public readonly name: string, public readonly extra?: any)
    {
    }
}

export class FunctionDefinition<T>
{
    public readonly arguments: ArgumentDefinition[] = [];

    public extras: any;

    public returnFn: (result: string) => any = void_return;

    constructor (public readonly name: string, private readonly parent: ServiceBuilder<T>)
    {
    }

    /**
     * Defines extra parameters for the concrete builder.
     *
     * @param value Extra parameters to send to the concrete builder.
     * @example
     * builder.setup(x => x.send())
     *      .define({ verb: 'post' });
     */
    public define(value: any): FunctionDefinition<T>
    {
        this.extras = value;
        return this;
    }

    /**
     * Defines the return type and optional conversion function for service returns.
     *
     * @param fn Conversion function to use.
     * @example
     * builder.setup(x => x.fetch(arg('id'))).returns<Widget>();
     * builder.setup(x => x.fetch(arg('id'))).returns<Widget>(XML.parse); // With convert function.
     */
    public returns<R>(fn?: (x: string) => R): FunctionDefinition<T>
    {
        this.returnFn = fn || JSON.parse;
        return this;
    }
}

/**
 * Base class for defining a service via a declaritive syntax.
 */
export abstract class ServiceBuilder<T>
{
    private readonly m_base: {};
    private readonly m_proxy: any;

    private readonly m_functions: FunctionDefinition<T>[] = [];

    protected constructor ()
    {
        this.m_base = {};

        // We use the proxy to catch calls to the dummy object setup() passes back.

        let handler = {
            get: (obj: T, prop: string) => {
                let fn = new FunctionDefinition<T>(prop, this);
                this.m_functions.push(fn);

                return (...args: ArgumentDefinition[]): any => {
                    fn.arguments.push(...args);
                }
            }
        };
        
        this.m_proxy = new Proxy(this.m_base, handler);
    }

    /**
     * Declares a service from a proxied callback object.
     *
     * @param fn The callback which receives a proxy object.
     * @example
     * builder.setup(x => x.greet());
     */
    public setup(fn: (proxy: T) => any): FunctionDefinition<T>
    {
        fn(this.m_proxy);

        return this.m_functions[this.m_functions.length - 1];
    }

    /**
     * Builds a specific function for the new service object.
     *
     * @param fn The function definition info to build with.
     */
    protected abstract buildFunction(fn: FunctionDefinition<T>): GenericFunction;
    
    /**
     * Builds a new service object from the defined methods.
     */
    public build(): T
    {
        let rval = {} as any;

        for (let f of this.m_functions)
            rval[f.name] = this.buildFunction(f);

        return rval as T;
    }
}

/* ================================================================================================================= */
/**
 * Defines an argument for a function.
 *
 * @param name The name of the argument
 * @param extra Extra parameter data for the argument.
 * 
 * @example
 * builder.setup(x => x.get(arg('id')));
 * builder.setup(x => x.send(arg('widget', { as: 'body' }))); // With extra arguments
 */
export function arg<T>(name: string, extra?: any): T
{
    var rval: any = new ArgumentDefinition(name, extra);
    return (rval as T);
}

/* ================================================================================================================= */
