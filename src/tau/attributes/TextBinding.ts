/* ================================================================================================================= */
/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "../interfaces";
import { BindingTargetBase } from "../BindingTarget";

/* ================================================================================================================= */

export class TextBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);
    }

    protected applyValue(model: any, found: boolean, resolved: any): void
    {
        if (!found || resolved === undefined || resolved === null)
            this.item.innerHTML = '';
        else
        {
            this.item.innerHTML = resolved.toString()
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#039')
            ;
        }
    }
}

/* ================================================================================================================= */
