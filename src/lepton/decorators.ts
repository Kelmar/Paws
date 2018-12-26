/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { INJECTION_METADATA } from "./consts";

/* ================================================================================================================= */

export class InjectionMetadata
{
    public readonly parameters: Map<number, symbol> = new Map<number, symbol>();
    public readonly properties: Map<string, symbol> = new Map<string, symbol>();
}

/* ================================================================================================================= */

export function inject(token: symbol): (target: any, key: string, index?: number) => void
{
    return (target: any, key: string, index?: number): void =>
    {
        let metadata: InjectionMetadata = Reflect.getOwnMetadata(INJECTION_METADATA, target);

        if (metadata == null)
            metadata = new InjectionMetadata();

        if (index !== undefined)
            metadata.parameters.set(index, token);
        else
            metadata.properties.set(key, token);

        Reflect.defineMetadata(INJECTION_METADATA, metadata, target);
    };
}

/* ================================================================================================================= */
