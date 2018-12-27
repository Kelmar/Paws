/* ================================================================================================================= */
/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "../interfaces";
import { BindingTargetBase } from "../BindingTarget";

/* ================================================================================================================= */
/**
 * Handles bindings to a generic attribute.
 */
export class AttributeBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);
    }

    protected applyValue(model: any, found: boolean, resolved: any): void
    {
        if (!found || (!resolved && resolved !== 0))
        {
            // Remove attribute on any falsy result, except zero
            this.item.removeAttribute(this.name);
        }
        else if (typeof resolved == "boolean")
            this.item.setAttribute(this.name, this.name); // E.g.: checked="checked"
        else
            this.item.setAttribute(this.name, resolved.toString());
    }
}

/* ================================================================================================================= */
