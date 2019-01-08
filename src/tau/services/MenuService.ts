/* ================================================================================================================= */
/* ================================================================================================================= */

import { IContainer, Lifetime } from "lepton-di";

/* ================================================================================================================= */

export interface IMenuService
{
}

export const IMenuService: unique symbol = Symbol('tau:service:menu');

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
                reg.to(NativeMenuService);
            else
                reg.to(CustomMenuService);
        }
        else
            reg.to(CustomMenuService); // Running as web app.

        reg.with(Lifetime.Singleton);
    }
}

/* ================================================================================================================= */
