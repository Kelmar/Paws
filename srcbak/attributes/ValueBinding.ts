/* ================================================================================================================= */
/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "../interfaces";
import { BindingTargetBase } from "../BindingTarget";

/* ================================================================================================================= */
/**
 * Handles bindings to a generic attribute.
 */
export class ValueBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);

        (item as HTMLElement).onchange = (e: Event) => this.handleChange(e, name, dataBinding);
    }

    private handleChange(e: Event, name: string, dataBinding: IDataBinding): void
    {
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
