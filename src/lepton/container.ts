/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { INJECTION_METADATA } from "./consts";
import { InjectionMetadata } from "./decorators";
import { Type, IRegistrationSyntax, IContainer } from "./interfaces";

/* ================================================================================================================= */

class ReflectionInfo
{
    public type: Function;

    protected constructor (readonly target: symbol)
    {
    }
}

/* ================================================================================================================= */

export class RegistrationSyntax extends ReflectionInfo implements IRegistrationSyntax
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
}

/* ================================================================================================================= */

export class Container implements IContainer
{
    private m_maps: Map<symbol, ReflectionInfo>;

    constructor()
    {
        this.m_maps = new Map<symbol, ReflectionInfo>();
    }

    public dispose()
    {
        this.m_maps = new Map<symbol, ReflectionInfo>();
    }
    
    public register<T>(name: symbol): IRegistrationSyntax
    {
        let lookup: ReflectionInfo = this.m_maps.get(name);

        if (lookup != null)
        {
            let nameStr: string = name.toString();
            throw new Error(`'${nameStr}' is an already registered type.`);
        }

        var rval = new RegistrationSyntax(name);
        this.m_maps.set(name, rval);

        return rval;
    }

    /**
     * Injects values into an existing object.
     * 
     * The object will not be added to the managed container.
     * 
     * @param target The object to have its properties injected.
     */
    public buildUp<T>(target: T): T
    {
        let prototype = Object.getPrototypeOf(target);
        let propMetadata: InjectionMetadata = Reflect.getMetadata(INJECTION_METADATA, prototype);

        if (propMetadata != null)
        {
            propMetadata.properties.forEach((typeName, index) => 
            {
                (target as any)[index] = this.resolve(this.m_maps.get(typeName).type as any);
            });
        }

        return target;
    }

    /**
     * Builds a new object of type target.
     * 
     * @param type The type to build.
     */
    public resolve<T>(type: Type<T>): T
    {
        let params = Reflect.getOwnMetadata("design:paramtypes", type) || [];

        let ctorMetadata: InjectionMetadata = Reflect.getOwnMetadata(INJECTION_METADATA, type);

        if (ctorMetadata != null)
            ctorMetadata.parameters.forEach((typeName, index) => params[index] = this.m_maps.get(typeName).type);

        let args = params.map((p: any) => this.resolve(p));

        let rval: T = new type(...args);

        return this.buildUp(rval);
    }
}

/* ================================================================================================================= */
