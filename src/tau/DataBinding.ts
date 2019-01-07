import { LogManager, ILogger } from "../common/logging";
import { IDataBinding } from "./interfaces";

/* ================================================================================================================= */

const IDENT_PATTERN: RegExp = /^[A-Z|_][\w|_|]*$/i;

/* ================================================================================================================= */

/**
 * No operation data bind.
 *
 * This always returns a true value for the found boolean and an empty string for the value.
 */
export class NoopDataBinding implements IDataBinding
{
    private constructor() 
    { 
        // Private to make singleton.
        Object.freeze(this);
    }

    public static readonly instance = new NoopDataBinding();

    public resolve(model: any): [boolean, any]
    {
        return [true, ''];
    }
}

/* ================================================================================================================= */

/**
 * Binds to a dot notated path set of names for the model.
 *
 * This allows for resolving of nested values.  E.g.: 'widget.cog.sprocket.name'
 */
export class PathDataBinding implements IDataBinding
{
    constructor(readonly path: string[])
    {
        if (path.length == 0)
            throw new Error('Logic error, PathDataBinding got a path of zero length!');
    }

    public resolve(model: any): [boolean, any]
    {
        let mapping: {[key: string]: any} = model;
        let res: any;

        for (let segment of this.path)
        {
            res = mapping[segment];
            mapping = res;

            if (res === undefined)
                return [false, undefined];

            if (res === null)
            {
                // We treat a "null" as found, the property is set, but has no value.
                return [true, null];
            }
        }

        return [true, res];
    }
}

/* ================================================================================================================= */

export function parseDataBinding(binding: string): IDataBinding
{
    // We don't handle anything more complex than simple dot notated identifiers.
    let parts = binding
        .split('.')
        .map(x => x.trim())
        .filter(x => x != '');

    if (parts.length == 0)
        return NoopDataBinding.instance;

    for (let i = 0; i < parts.length; ++i)
    {
        if (!IDENT_PATTERN.test(parts[i]))
        {
            let log: ILogger = LogManager.getLogger('paws.tau.dataBinding.parseDataBinding');
            log.warn(`Ignoring invalid data binding expresion: ${binding}`);

            return NoopDataBinding.instance;
        }
    }

    return new PathDataBinding(parts);
}

/* ================================================================================================================= */
