/* ================================================================================================================= */
/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "./interfaces";

/* ================================================================================================================= */

export abstract class BindingTargetBase implements IBindingTarget
{
    protected constructor(readonly dataBinding: IDataBinding)
    {
    }

    /**
     * Resolves a data bound value in the supplied model.
     *
     * @param model The model to resolve the value from.
     *
     * @returns A tuple, the first value is a boolean indicating if the value was found.  The second is the value itself.
     */
    protected resolve(model: any): [boolean, any]
    {
        return this.dataBinding.resolve(model);
    }

    /**
     * Applies a data bound value to the binding target.
     *
     * @param model The data model that holds the resolved value.
     * @param found Set if the data bound value was found or not.
     * @param resolved The value that was found.
     */
    protected abstract applyValue(model: any, found: boolean, resolved: any): void;

    /**
     * Applies data binding from the given model.
     *
     * @param model The model to pull data binding values from.
     */
    public apply(model: any): void
    {
        let [found, res] = this.resolve(model);
        this.applyValue(model, found, res);
    }
}

/* ================================================================================================================= */
