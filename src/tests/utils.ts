
export interface Type<T>
{
    new(...args: any[]): T;
}

export function isTypeOf<T>(obj: any, type: Type<T>): boolean
{
    if (obj == null)
        return false;

    let objProto = Object.getPrototypeOf(obj);

    return Object.is(objProto, type.prototype);
}