/* ================================================================================================================= */
/* ================================================================================================================= */

import { LogManager, isObject } from "../common";

import { ModelEventType } from "./common";
import { DYNAMIC_TAG, DynamicBase, dynamicDispose  } from "./internal";
import { makeDynamic } from "./dynamic";

/* ================================================================================================================= */

let g_log = LogManager.getLogger("tau.dynamic");

/* ================================================================================================================= */

export class DynamicObject<T extends object> extends DynamicBase implements ProxyHandler<T>
{
    constructor(readonly target: T)
    {
        super();

        this.initObject();
    }

    public dispose(): void
    {
        for (var name in this.target)
            dynamicDispose(this.target[name]);

        super.dispose();
    }

    private initObject(): void
    {
        for (let name in this.target)
        {
            let value: any = this.target[name];

            if (isObject(value))
                (this.target as any)[name] = makeDynamic(value);
        }
    }

    public get({}, p: string, {}): any
    {
        if ((p as any as Symbol) == DYNAMIC_TAG)
            return this;

        switch (p)
        {
        case "change$":
            return this.change$;

        case "notify":
            return () => this.notify();

        default:
            return (this.target as any)[p];
        }
    }

    public set({}, p: string, value: any, {}): boolean
    {
        if ((p as any as symbol) == DYNAMIC_TAG)
        {
            g_log.error("Attempt to set property {name} denied.", { name: p });
            return false;
        }

        switch (p)
        {
        case "change$":
        case "notify":
            g_log.error("Attempt to set property {name} denied.", { name: p });
            return false; // Don't allow these to be set.

        default:
            let a: any = this.target;
            let oldVal: any = a[p];

            value = isObject(value) ? makeDynamic(value) : value;

            if (oldVal !== value)
            {
                a[p] = value;

                dynamicDispose(oldVal);
                this.raise(ModelEventType.Changed, p, a[p]);
            }

            return true;
        }
    }

    public deleteProperty({}, p: string): boolean
    {
        let a: any = this.target;
        let oldVal: any = a[p];

        if (oldVal !== undefined)
        {
            a[p] = undefined;
            delete a[p];

            dynamicDispose(oldVal);
            this.raise(ModelEventType.Changed, p);
        }

        return true;
    }
}

/* ================================================================================================================= */
