/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { Type, IRegistrationSyntax, IContainer, IScope } from "./interfaces";

import { Scope } from './scope';
import { Lifetime } from "./lifecycle";

import RegistrationInfo from './RegistrationInfo';

/* ================================================================================================================= */

class RegistrationSyntax extends RegistrationInfo implements IRegistrationSyntax
{
    constructor(readonly target: symbol)
    {
        super(target);
    }

    to<T>(type: Type<T>): IRegistrationSyntax
    {
        this.type = type;
        return this;
    }

    with(lifetime: Lifetime): IRegistrationSyntax
    {
        this.lifetime = lifetime;
        return this;
    }
}

/* ================================================================================================================= */

export class Container implements IContainer
{
    private m_maps: Map<symbol, RegistrationInfo>;
    private m_singletonScope: Scope;

    constructor()
    {
        this.m_maps = new Map<symbol, RegistrationInfo>();
        this.m_singletonScope = new Scope(this, Lifetime.Singleton);
    }

    public dispose(): void
    {
        this.m_singletonScope.dispose();
        this.m_maps = null;
    }

    public register(name: symbol): IRegistrationSyntax
    {
        let reg: RegistrationInfo = this.getRegistration(name);

        if (reg != null)
        {
            let nameStr: string = name.toString();
            throw new Error(`'${nameStr}' is an already registered type.`);
        }

        var rval = new RegistrationSyntax(name);
        this.m_maps.set(name, rval);

        return rval;
    }

    public isRegistered(name: symbol): boolean
    {
        return this.m_maps.has(name);
    }

    public beginScope(): IScope
    {
        return new Scope(this, Lifetime.Scoped, this.m_singletonScope);
    }

    // TODO: Hide the items below, they are internal to Lepton

    public getRegistration(name: symbol): RegistrationInfo
    {
        return this.m_maps.get(name);
    }
}

/* ================================================================================================================= */
