/* ================================================================================================================= */
/* ================================================================================================================= */

import { Subscription, Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { IDisposable } from "lepton-di";

import { } from "../common";

import { ModelEvent, ModelEventType } from "./common";
import { Dynamic, makeDynamic } from "./dynamic";

/* ================================================================================================================= */

class PropertyBinding implements IDisposable
{
    public sourceProperty: string;

    private readonly m_targetSubscription: Subscription = null;
    private readonly m_sourceSubscription: Subscription;

    /**
     * Flag for preventing recursion durring updates.
     */
    private m_updating: boolean = false;

    constructor (
        public readonly target: any,
        public readonly source: BindingSource,
        public readonly targetProperty: string)
    {
        this.m_sourceSubscription = source.change$
            .pipe(filter<ModelEvent>(x => x.type != ModelEventType.Changed || x.property == this.sourceProperty))
            .subscribe({
                next: () => this.update()
            });

        // Check to see if there is an observable with the same name on the target
        let obsProp = targetProperty + '$';

        let ob$ = this.target[obsProp];

        if (ob$ && ob$ instanceof Observable)
        {
            this.m_targetSubscription = ob$.subscribe({
                next: value => this.targetUpdated(value)
            });
        }
    }

    public dispose()
    {
        if (this.m_targetSubscription != null)
            this.m_targetSubscription.unsubscribe();

        this.m_sourceSubscription.unsubscribe();
    }

    /**
     * Calls a callback provided we are not in an update phase.
     *
     * Also sets the guard flag so that subsequent calls to this function will not execute.
     *
     * @param callback The callback to execute
     */
    private guarded(callback: Function): void
    {
        if (this.m_updating)
            return;

        this.m_updating = true;

        try
        {
            callback();
        }
        finally
        {
            this.m_updating = false;
        }
    }

    /**
     * Updates a target with the bound source property
     */
    public update(): void
    {
        let newValue = this.source.read(this.sourceProperty);
        this.guarded(() => { this.target[this.targetProperty] = newValue; });
    }

    /**
     * Updates a source with the given value.
     *
     * This is the handler for a two-way binding.  (E.g. an input field updated with a new value.)
     *
     * @param value The value to update to.
     */
    private targetUpdated(value: any): void
    {
        if (!this.sourceProperty)
            return; // Not bound to a source property, no need to update.

        this.guarded(() => { this.source.dataSource[this.sourceProperty] = value; });
    }
}

/* ================================================================================================================= */

class TargetBindings implements IDisposable
{
    private readonly m_byProperty: Map<string, PropertyBinding> = new Map();

    constructor (public readonly target: any, public readonly source: BindingSource)
    {
    }

    public dispose(): void
    {
        for (let [{}, pb] of this.m_byProperty)
            pb.dispose();
    }

    /**
     * Returns the number of active bindings for the target.
     */
    public get count(): number
    {
        return this.m_byProperty.reduce((a, _, v) => a + (v.sourceProperty ? 1 : 0), 0);
    }

    public set(targetProperty: string, sourceProperty?: string): void
    {
        let pb = this.m_byProperty.get(targetProperty);

        if (pb == null)
        {
            pb = new PropertyBinding(this.target, this.source, targetProperty);
            this.m_byProperty.set(targetProperty, pb);
        }

        pb.sourceProperty = sourceProperty;
    }

    public update()
    {
        for (let [{}, binding] of this.m_byProperty)
            binding.update();
    }
}

/* ================================================================================================================= */
/**
 * Handles binding of a data source to multiple target objects.
 */
export class BindingSource implements IDisposable
{
    private readonly m_bindings: Map<any, TargetBindings> = new Map();
    private readonly m_subject: Subject<ModelEvent>;

    private m_dataSource: Dynamic = null;

    private m_subscription: Subscription = null;

    constructor()
    {
        this.m_subject = new Subject();
    }

    public dispose(): void
    {
        this.m_subject.complete();

        if (this.m_subscription)
            this.m_subscription.unsubscribe();

        for (let [{}, bindings] of this.m_bindings)
            bindings.dispose();

        this.m_bindings.clear();

        this.m_dataSource = null;
        this.m_subscription = null;
    }

    public get change$(): Observable<ModelEvent>
    {
        return this.m_subject;
    }

    public get dataSource(): any
    {
        return this.m_dataSource;
    }

    public set dataSource(value: any)
    {
        if (this.m_subscription)
        {
            this.m_subscription.unsubscribe();
            this.m_subscription = null;
        }

        this.m_dataSource = makeDynamic(value);

        if (this.m_dataSource)
        {
            this.m_subscription = this.m_dataSource.change$.subscribe({
                next: event => this.handleEvent(event)
            });
        }

        this.updateAll();
    }

    /**
     * Reads a property from the currently bound data source object.
     *
     * @param property The property to read.
     */
    public read(property: string): any
    {
        if (!this.m_dataSource || !property)
            return '';

        return (this.m_dataSource as any)[property] || '';
    }

    /**
     * Establishes (or removes) a binding on a target object.
     *
     * If the sourceProperty is not provided, then an existing binding for the target object will be removed.
     * 
     * If the target object also defines a property that is an observable of the same name ending with a '$', then a two
     * way binding will be established.  Where by events from the target's observable will be sent to the source
     * property.
     *
     * @param target The target object to which changes will be sent.
     * @param targetProperty The property changes will be sent.
     * @param sourceProperty The source property where changes will be read.
     */
    public setBinding(target: any, targetProperty: string, sourceProperty?: string): void
    {
        let bindings = this.m_bindings.get(target);

        if (!bindings)
        {
            if (!sourceProperty)
                return; // Nothing to do.

            bindings = new TargetBindings(target, this);
            this.m_bindings.set(target, bindings);
        }

        bindings.set(targetProperty, sourceProperty);

        if (bindings.count == 0)
        {
            // Remove from list

            this.m_bindings.delete(target);
            bindings.dispose();
        }
    }

    private handleEvent(event: ModelEvent): void
    {
        if (event.type == ModelEventType.Ping)
            this.updateAll();
        else
            this.m_subject.next(event);
    }

    public updateAll(): void
    {
        for (let [{}, bindings] of this.m_bindings)
            bindings.update();
    }
}

/* ================================================================================================================= */
