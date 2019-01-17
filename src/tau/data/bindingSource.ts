/* ================================================================================================================= */
/* ================================================================================================================= */

import { Subscription, Observable } from "rxjs";

import { IDisposable } from "lepton-di";

import { Dynamic, makeDynamic, ModelEvent, ModelEventType } from "./dynamic";

/* ================================================================================================================= */

class TargetBindings implements IDisposable
{
    // One to many, a source property can be bound to multiple targets.
    private readonly m_sourceToTarget: Map<string, Set<string>> = new Map();

    // One to one, a target cannot be bound to multiple source properties.
    private readonly m_targetToSource: Map<string, string> = new Map();

    private readonly m_subscriptions: Map<string, Subscription> = new Map();

    private readonly m_targetUpdate: Set<string> = new Set();

    constructor(public readonly target: any)
    {
    }

    public dispose()
    {
        for (let [_, sub] of this.m_subscriptions)
            sub.unsubscribe();

        this.m_subscriptions.clear();
    }

    public setBinding(targetProperty: string, sourceProperty: string): void
    {
        let oldSource = this.m_targetToSource.get(targetProperty);

        if (oldSource != null)
        {
            let sets = this.m_sourceToTarget.get(oldSource);
            sets.delete(targetProperty);

            if (sourceProperty == null)
            {
                this.m_targetToSource.delete(targetProperty);

                let sub = this.m_subscriptions.get(targetProperty);
                this.m_subscriptions.delete(targetProperty);

                if (sub != null)
                    sub.unsubscribe();

                return;
            }
        }
        else if (sourceProperty != null)
        {
            // Check to see if there is an observable with the same name.
            let obsProp = targetProperty + '$';

            let ob$ = this.target[obsProp];

            if (ob$ != null && ob$ instanceof Observable)
            {
                let sub = ob$.subscribe({
                    next: () => this.targetUpdated(targetProperty)
                });

                this.m_subscriptions.set(targetProperty, sub);
            }
        }

        this.m_targetToSource.set(targetProperty, sourceProperty);

        let sets = this.m_sourceToTarget.get(sourceProperty) || new Set();
        sets.add(targetProperty);
        this.m_sourceToTarget.set(sourceProperty, sets);
    }

    private guardedUpdate(targetProperty: string, value: any): void
    {
        if (this.m_targetUpdate.has(targetProperty))
            return;
        
        this.m_targetUpdate.add(targetProperty);

        try
        {
            this.target[targetProperty] = value;
        }
        finally
        {
            this.m_targetUpdate.delete(targetProperty);
        }
    }

    private targetUpdated(targetProperty: string): void
    {
        if (this.m_targetUpdate.has(targetProperty))
            return;

        // Prevent some event spam by blocking updates to this property.
        this.m_targetUpdate.add(targetProperty);

        try
        {
            // Update the source with the new value.
        }
        finally
        {
            this.m_targetUpdate.delete(targetProperty);
        }
    }

    public update(sourceProperty: string, value: any): void
    {
        let sets = this.m_sourceToTarget.get(sourceProperty);

        if (sets == null)
            return;

        for (let targetProperty of sets)
            this.guardedUpdate(targetProperty, value);
    }

    public updateAll(source: any): void
    {
        for (let [sourceProperty, sets] of this.m_sourceToTarget)
        {
            let value = source[sourceProperty];

            for (let targetProperty of sets)
                this.guardedUpdate(targetProperty, value);
        }
    }

    public isEmpty(): boolean
    {
        return this.m_targetToSource.size == 0;
    }
}

/* ================================================================================================================= */

export class BindingSource implements IDisposable
{
    private readonly m_bindings: Map<any, TargetBindings> = new Map();

    private m_dataSource: Dynamic = null;

    private m_subscription: Subscription = null;

    constructor()
    {
    }

    public dispose(): void
    {
        if (this.m_subscription)
            this.m_subscription.unsubscribe();

        for (let [_, bindings] of this.m_bindings)
            bindings.dispose();

        this.m_bindings.clear();

        this.m_dataSource = null;
        this.m_subscription = null;
    }

    public get dataSource(): any
    {
        return this.m_dataSource;
    }

    public set dataSource(value: any)
    {
        if (this.m_subscription)
            this.m_subscription.unsubscribe();

        this.m_dataSource = makeDynamic(value);

        if (this.m_dataSource)
        {
            this.m_subscription = this.m_dataSource.change$.subscribe({
                next: event => this.modelChanged(event)
            });
        }

        this.updateAllBindings();
    }

    public setBinding(target: any, targetProperty: string, sourceProperty?: string): void
    {
        let bindings = this.m_bindings.get(target) || new TargetBindings(target);

        bindings.setBinding(targetProperty, sourceProperty);

        if (bindings.isEmpty())
            this.m_bindings.delete(target);
        else
            this.m_bindings.set(target, bindings);
    }

    private updateAllBindings(): void
    {
        for (let [_, bindings] of this.m_bindings)
            bindings.updateAll(this.m_dataSource);
    }

    private modelChanged(event: ModelEvent): void
    {
        switch (event.type)
        {
        case ModelEventType.Ping:
            this.updateAllBindings();
            break;

        case ModelEventType.Changed:
        case ModelEventType.Deleted:
            this.propertyUpdated(event.property);
            break;
        }
    }

    private propertyUpdated(propertyName: string): void
    {
        let newValue = this.m_dataSource ? this.m_dataSource[propertyName] : '';

        for (let [_, bindings] of this.m_bindings)
            bindings.update(propertyName, newValue);
    }
}

/* ================================================================================================================= */
