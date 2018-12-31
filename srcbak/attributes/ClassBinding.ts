/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "../interfaces";
import { BindingTargetBase } from "../BindingTarget";

/* ================================================================================================================= */
/**
 * Handles binding to a class attribute.
 * 
 * When using this binder, it is possible to bind to the class attribute as a whole or a single class.
 * 
 * To bind to the class attribute as a whole:
 * tau-class="myComputedClass"
 * 
 * To bind to a single class value:
 * tau-class-fault="isError"
 */
export class ClassBindingTarget extends BindingTargetBase implements IBindingTarget
{
    private readonly m_className: string;
    private readonly m_handler: (found: boolean, value: any) => void;

    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);

        // Allows for writing: <div tau-class-fault="inError">Invalid</div>
        // Or: <div tau-class="myComputedClass">A lepton with an electric charge and 1/2 spin.</div>
        let parts = name.split('-', 2);

        if (parts.length > 1)
        {
            this.m_className = parts[1];
            this.m_handler = (f, v) => this.applySingle(f, v);
        }
        else
        {
            this.m_className = null;
            this.m_handler = (f, v) => this.applyAll(f, v);
        }
    }

    private applySingle(found: boolean, res: any): void
    {
        if (!found || !res)
            this.item.classList.remove(this.m_className);
        else
            this.item.classList.add(this.m_className);
    }

    private applyAll(found: boolean, res: any)
    {
        if (!found || !res)
            this.item.removeAttribute('class');
        else
            this.item.setAttribute('class', res);
    }

    protected applyValue(model: any, found: boolean, resolved: any): void
    {
        this.m_handler(found, resolved);
    }
}

/* ================================================================================================================= */
