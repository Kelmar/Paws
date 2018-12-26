/* ================================================================================================================= */
/* ================================================================================================================= */

import IDisposable from "../common/lifecycle";

import { Lifetime } from "./consts";

/* ================================================================================================================= */

export interface Type<T>
{
    new(...args: any[]): T;
}

export interface IRegistrationSyntax
{
    to<T>(type: Type<T>): IRegistrationSyntax;
}

export interface IResolver
{
    resolve<T>(): T;
}

export interface IContainer extends IDisposable
{
    register<T>(type: any, lifetime?: Lifetime): void;
}

export interface IScope extends IResolver, IDisposable
{
}

/* ================================================================================================================= */
