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

        if (process.platform != "win32")
            reg.to(NativeMenuService);
        else
            reg.to(CustomMenuService);

        reg.with(Lifetime.Singleton);
    }
}

/* ================================================================================================================= */
