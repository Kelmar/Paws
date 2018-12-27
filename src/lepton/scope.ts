/* ================================================================================================================= */
/* ================================================================================================================= */

import { IScope } from "./interfaces";

import { InjectionMetadata } from "./decorators";
import { INJECTION_METADATA } from "./consts";
import { Container } from "./container";
import { Lifetime } from "./lifecycle";

import RegistrationInfo from './RegistrationInfo';

/* ================================================================================================================= */

export class Scope implements IScope
{
    private m_managed: Map<symbol, any>;

    constructor(readonly container: Container, readonly managedLifetime: Lifetime, readonly parent?: Scope)
    {
        this.m_managed = new Map<symbol, any>();
    }

    public dispose(): void
    {
        this.m_managed.forEach(item => this.disposeItem(item));
        this.m_managed = null;
    }

    private disposeItem(item: any): void
    {
        let disposal: Function = item["dispose"];

        if (typeof disposal === "function")
            disposal.apply(item);
    }

    private createNew<T>(regInfo: RegistrationInfo): T
    {
        let params = Reflect.getOwnMetadata("design:paramtypes", regInfo.type) || [];

        let ctorMetadata: InjectionMetadata = Reflect.getOwnMetadata(INJECTION_METADATA, regInfo.type);

        if (ctorMetadata != null)
            ctorMetadata.parameters.forEach((typeName, index) => params[index] = typeName);

        let args = params.map((p: any) => this.resolve(p));

        let rval: T = new regInfo.type(...args);

        return this.buildUp(rval);
    }

    private buildUpInner<T>(target: T): void
    {
        let prototype = Object.getPrototypeOf(target);
        let propMetadata: InjectionMetadata = Reflect.getMetadata(INJECTION_METADATA, prototype);

        if (propMetadata != null)
        {
            propMetadata.properties.forEach((typeName, index) => (target as any)[index] = this.resolve(typeName));
        }
    }

    private manage<T>(regInfo: RegistrationInfo, target: T): void
    {
        if (regInfo.lifetime == this.managedLifetime)
            this.m_managed.set(regInfo.name, target);
        else if (this.parent != null)
            this.parent.manage(regInfo, target);
    }

    private tryResolve<T>(name: symbol): T
    {
        let rval: T = this.m_managed.get(name);
        
        if (rval === null && this.parent !== null)
            rval = this.parent.tryResolve<T>(name);

        if (rval !== null)
            return rval;
    }

    public buildUp<T>(target: T): T
    {
        if (target == null)
            throw new Error("target is null");

        this.buildUpInner(target);

        return target;
    }

    public wireUp<T>(name: symbol, target: T): T
    {
        if (target == null)
            throw new Error("target is null");

        let regInfo: RegistrationInfo = this.container.getRegistration(name);

        if (regInfo == null)
        {
            let symStr = name.toString();
            throw new Error(`Symbol '${symStr}' not registered.`);
        }

        this.buildUp<T>(target);
        this.manage(regInfo, target);

        return target;
    }

    public resolve<T>(name: symbol): T
    {
        let regInfo: RegistrationInfo = this.container.getRegistration(name);

        if (regInfo == null)
        {
            let symStr = name.toString();
            throw new Error(`Symbol '${symStr}' not registered.`);
        }

        let rval: T = this.tryResolve(name);

        rval = this.createNew(regInfo);

        this.buildUp<T>(rval);
        this.manage(regInfo, rval);
        
        return rval;
    }

    public beginScope(): IScope
    {
        return new Scope(this.container, this.managedLifetime, this);
    }
}

/* ================================================================================================================= */
