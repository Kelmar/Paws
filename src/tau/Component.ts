/* ================================================================================================================= */
/* ================================================================================================================= */

import { Proxy, IProxyHandler, observable } from './Model';
import { ITemplate } from './interfaces';

/* ================================================================================================================= */

export class Component<TModel> implements IProxyHandler
{
    private m_proxy: TModel;

    constructor (readonly template: ITemplate, model: new() => TModel)
    {
        this.m_proxy = Proxy(new model(), this);
    }

    public get model(): TModel { return this.m_proxy; }

    public setValue(name: string, newValue: any, oldValue: any): void
    {
        this.template.apply(this.m_proxy);
    }
}

/* ================================================================================================================= */
/**
 * This is a test model.
 * 
 * @todo Remove this.
 */
export class Widget
{
    @observable
    public id: number;

    @observable
    public name: string;
}

/* ================================================================================================================= */
