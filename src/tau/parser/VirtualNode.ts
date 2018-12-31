/* ================================================================================================================= */
/* ================================================================================================================= */

import { Dynamic, ModelEvent } from '../models';
import { IDisposable, LinkedList } from '../../lepton';
import { Subscription } from 'rxjs';

/* ================================================================================================================= */

export type NodeCollection = VirtualNode[] | IterableIterator<VirtualNode>;

/* ================================================================================================================= */

export interface BindingUpdater
{
    (name: PropertyKey): void;
}

/* ================================================================================================================= */

class Dispatcher
{
    private readonly m_sets: Map<PropertyKey, Set<BindingUpdater>> = new Map();

    private getSet(name: PropertyKey, create: boolean): Set<BindingUpdater>
    {
        let rval = this.m_sets.get(name);

        if (rval == null && create)
        {
            rval = new Set<BindingUpdater>();
            this.m_sets.set(name, rval);
        }

        return rval;
    }

    public clear(): void
    {
        for (let [{}, set] of this.m_sets)
            set.clear();

        this.m_sets.clear();
    }

    public add(name: PropertyKey, callback: BindingUpdater): void
    {
        let set = this.getSet(name, true);
        set.add(callback);
    }

    public erase(name: PropertyKey, callback: BindingUpdater): void
    {
        let set = this.getSet(name, false);

        if (set)
        {
            set.delete(callback);

            if (set.size == 0)
                this.m_sets.delete(name);
        }
    }

    public emit(name: PropertyKey): void
    {
        let set = this.getSet(name, false);

        if (set)
        {
            for (let cb of set)
                cb(name);
        }
    }

    public broadcast(): void
    {
        for (let [name, set] of this.m_sets)
        {
            for (let cb of set)
                cb(name);
        }
    }
}

/* ================================================================================================================= */

/**
 * Represents a virtual DOM node.
 */
export class VirtualNode implements IDisposable
{
    public readonly element: Node;

    private readonly m_children: VirtualNode[] = [];

    private readonly m_boundProperties: Dispatcher = new Dispatcher();

    private m_parent: VirtualNode = null;
    private m_subscription: Subscription;
    private m_model: Dynamic;

    public constructor (element: Node)
    {
        this.element = element;
        element.childNodes
    }

    public dispose(): void
    {
        this.forEach(c => c.dispose());
        this.m_children.splice(0, this.m_children.length);

        if (this.m_subscription)
        {
            this.m_subscription.unsubscribe();
            this.m_subscription = null;
        }
    }

    public get model(): Dynamic
    {
        if (this.ownModel)
            return this.m_model;

        if (this.parent != null)
            return this.parent.model;

        return null;
    }

    public set model(newModel: Dynamic)
    {
        if (this.m_subscription)
            this.m_subscription.unsubscribe();

        this.m_model = newModel;

        this.m_subscription = this.ownModel ? this.m_model.observable.subscribe(e => this.update(e)) : null;

        this.update(null);
    }

    public get ownModel(): boolean
    {
        return this.m_model != null;
    }

    public get parent(): VirtualNode
    {
        return this.m_parent;
    }

    // Creates a deep copy of this node
    public clone(): VirtualNode
    {
        let cloneEl = this.element != null ? this.element.cloneNode(false) : null;
        let rval = new VirtualNode(cloneEl);

        this.forEach(c => {
            let childClone = c.clone();
            rval.addChild(childClone);

            if (childClone.element != null && cloneEl != null)
                cloneEl.appendChild(childClone.element);
        });

        return rval;
    }

    public addBinding(binding: string, updater: BindingUpdater): void
    {
        this.m_boundProperties.add(binding, updater);
    }

    public addChild(child: VirtualNode): void
    {
        if (child.m_parent != null)
            child.m_parent.removeChild(child);

        this.m_children.push(child);
        child.m_parent = this;
    }

    public addRange(children: NodeCollection): void
    {
        for (let c of children)
        {
            this.m_children.push(c);
            c.m_parent = this;
        }
    }

    public removeChild(child: VirtualNode): void
    {
        let idx = this.m_children.indexOf(child);

        if (idx != -1)
        {
            this.m_children.splice(idx, 1);
            child.m_parent = null;
        }
    }

    public forEach(cb: (child: VirtualNode) => void): void
    {
        for (let c of this.m_children)
            cb(c);
    }

    protected moveChildren(sourceNode: VirtualNode): void
    {
        if (sourceNode == null || sourceNode == this)
            return;

        this.m_children.push(...sourceNode.m_children);
        sourceNode.m_children.splice(0, sourceNode.m_children.length);

        this.forEach(c => c.m_parent = this);
    }

    protected clearElement(element?: Node)
    {
        element = element || this.element;

        if (element != null)
        {
            while (element.firstChild != null)
                element.removeChild(element.firstChild);
        }
    }

    protected modelChanged(): void
    {
    }

    private sendChildUpdates(event: ModelEvent)
    {
        this.m_children.forEach(c => c.updateChild(event));
    }

    private updateChild(event: ModelEvent): void
    {
        // See if we're interested in this event or not.
        if (event == null)
            this.m_boundProperties.broadcast();
        else if (event.property)
            this.m_boundProperties.emit(event.property);

        this.sendChildUpdates(event);
    }

    private update(event: ModelEvent): void
    {
        this.sendChildUpdates(event);
        this.modelChanged();
    }
}

/* ================================================================================================================= */
