/* ================================================================================================================= */
/* ================================================================================================================= */

/* ================================================================================================================= */

export interface ITemplate
{
    apply(model: any): void;
}

/* ================================================================================================================= */

/**
 * A target that receives data binding events.
 */
export interface IBindingTarget
{
    /**
     * Applies a model to the binding target.
     *
     * @param model The model to apply values from.
     */
    apply(model: any): void;
}

/* ================================================================================================================= */

/**
 * Represents a binding to a value within a model.
 */
export interface IDataBinding
{
    /**
     * Resolve the data binding to the given model's value.
     *
     * @param model The model to resolve to.
     *
     * @returns A tuple, the boolean indicates if the value was found, the any is the value resolved (if available)
     */
    resolve(model: any): [boolean, any];
}

/* ================================================================================================================= */
