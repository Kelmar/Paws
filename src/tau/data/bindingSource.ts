/* ================================================================================================================= */
/* ================================================================================================================= */


/* ================================================================================================================= */

const TAU_BINDINGS_PROPERTY: unique symbol = Symbol('tau:data:bindings');

/* ================================================================================================================= */

class TargetBinding
{
    constructor (public readonly target: any, public readonly property: string)
    {
    }

    public updateTo(value: any): void
    {
        this.target[this.property] = value;
    }

    public hash(): number
    {
        return this.target.hash() << 24 ^ this.property.hash();
    }
}

/* ================================================================================================================= */

export class BindingSource
{
    // Going from source property to a target/property
    private m_sourceBindings: Map<string, TargetBinding[]> = new Map();

    // Reverse of above, go from target/property to a source property.
    private m_targetBindings: Map<TargetBinding, string> = new Map();

    private m_dataSource: any;

    constructor()
    {
    }

    public get dataSource(): any
    {
        return this.m_dataSource;
    }

    public set dataSource(value: any)
    {
        this.m_dataSource = value;
        this.updateAllBindings();
    }

    public setBinding(target: any, targetProperty: string, sourceProperty?: string): void
    {
        let targetBinding = this.removeBindingFor(target, targetProperty);

        if (sourceProperty != null && sourceProperty != '')
        {
            let propertyBindings = this.m_sourceBindings.get(sourceProperty) || [];
            propertyBindings.push(targetBinding);

            this.m_sourceBindings.set(sourceProperty, propertyBindings);
        }
    }

    private removeBindingFor(target: any, property: string): TargetBinding
    {
        let targetBinding = new TargetBinding(target, property);
        let name = this.m_targetBindings.get(targetBinding);

        if (name != null)
        {
            let bindings = this.m_sourceBindings.get(name);
            let idx = bindings.indexOf(targetBinding);
            bindings = bindings.splice(idx, 1);
            this.m_sourceBindings.set(name, bindings);
        }

        return targetBinding;
    }

    private updateAllBindings()
    {
        let data = this.m_dataSource || {};

        for (let [name, bindings] of this.m_sourceBindings)
        {
            let value = data[name] || '';

            for (let binding of bindings)
                binding.updateTo(value);
        }
    }

    private propertyUpdated(propertyName: string)
    {
        let newValue = (this.m_dataSource || {})[propertyName] || '';
        let bindings = this.m_sourceBindings.get(propertyName) || [];

        for (let binding of bindings)
            binding.updateTo(newValue);
    }
}

/* ================================================================================================================= */
