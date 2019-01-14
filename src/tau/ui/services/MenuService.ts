/* ================================================================================================================= */
/* ================================================================================================================= */

import { IContainer, Lifetime } from "lepton-di";

/* ================================================================================================================= */

export const IMenuService: unique symbol = Symbol("tau:service:menu");

export interface IMenuService
{
}

/* ================================================================================================================= */

class NativeMenuService implements IMenuService
{
}

/* ================================================================================================================= */

class CustomMenuService implements IMenuService
{
}

/* ================================================================================================================= */

export module menuService
{
    export function configure(container: IContainer)
    {
        let reg = container.register(IMenuService);

        if (process && process.versions.electron)
        {
            if (process.platform != "win32")
                reg.toClass(NativeMenuService);
            else
                reg.toClass(CustomMenuService);
        }
        else
            reg.toClass(CustomMenuService); // Running as web app.

        reg.with(Lifetime.Singleton);
    }
}

/* ================================================================================================================= */
