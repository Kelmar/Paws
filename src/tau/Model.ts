import "reflect-metadata";

const OBSERVABLES : symbol = Symbol("observables");

interface ObjectMapping
{
    [key: string]: any
}

/**
 * Interface for classes that handles object change events.
 * 
 * Proxy handlers handle change events on proxied object properties.
 */
export interface IProxyHandler
{
    /**
     * Called when an observable property on an object changes.
     *
     * @param name The name of the property that has been changed.
     * @param value The new value for the property.
     * @param oldValue The old value of the property.
     */
    setValue(name: string, value: any, oldValue: any): void;
}

/**
 * Defines a property as being observable.
 *
 * Observable properites raise change events when proxied.
 *
 * @param target The class that contains the observable value.
 * @param key The name of the observable value.
 */
export function observable(target: any, key: string | symbol)
{
    let obsMeta = Reflect.getMetadata(OBSERVABLES, target);

    if (obsMeta == null)
    {
        obsMeta = [];
        Reflect.defineMetadata(OBSERVABLES, obsMeta, target);
    }

    obsMeta.push(key);
}

/**
 * Proxies an object.
 *
 * Proxied objects that have their properies marked as observable will have their changes
 * sent to the handler object.
 *
 * @param item The object to proxy.
 * @param handler The handler that will recieve events when properties on item change.
 */
export function Proxy<T>(item: T, handler: IProxyHandler): T
{
    if (item == null)
        return null;

    let proxied: T = Object.create(Object.getPrototypeOf(item));
    let mapping: ObjectMapping = item;

    let inHandler: boolean = false;

    function setValue(name: string, value: any): void
    {
        let old = mapping[name];

        if (value != old)
        {
            mapping[name] = value;

            if (!inHandler && handler != null)
            {
                inHandler = true;

                try
                {
                    handler.setValue(name, value, old);
                }
                finally
                {
                    inHandler = false;
                }
            }
        }
    }

    function buildProxyProperty(name: string, mapping: ObjectMapping)
    {
        let type = Reflect.getMetadata("design:type", item, name);

        if (type.name == "Function")
            return;

        Object.defineProperty(proxied, name,
        {
            set: val => setValue(name, val),
            get: () => mapping[name]
        });
    }

    (function ()
    {
        let obsMeta = Reflect.getMetadata(OBSERVABLES, item) || [];

        for (let i = 0; i < obsMeta.length; ++i)
        {
            let key = obsMeta[i];
            buildProxyProperty(key, mapping);
        }

        if (mapping["dispose"] instanceof Function)
        {
            let superDispose = mapping["dispose"];

            mapping["dispose"] = () =>
            {
                // Prevent event spam while disposing.
                handler = null;

                // Call the super's dispose() before we clear out our backing object, this way the dispose() method can find the objects it needs to collect.
                superDispose();

                // Clear out backing object to remove references.
                mapping = null;
                proxied = null;

                superDispose = null;
            }

            // Force proxied object's dispose to call the actual dispose method.
            let proxyMap: ObjectMapping = proxied;
            proxyMap["dispose"] = mapping["dispose"];
            proxyMap = null;
        }
    })();

    return proxied;
}

