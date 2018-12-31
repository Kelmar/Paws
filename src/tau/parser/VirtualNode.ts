/* ================================================================================================================= */
/* ================================================================================================================= */

import { Dynamic, ModelEvent } from '../models';
import { IDisposable } from '../../lepton';
import { Subscription } from 'rxjs';

/* ================================================================================================================= */

export type NodeCollection = VirtualNode[] | IterableIterator<VirtualNode>;

/* ================================================================================================================= */

/**
 * Represents a virtual DOM node.
 */
export class VirtualNode implements IDisposable
{
    public readonly element: Node;

    private readonly m_children: VirtualNode[] = [];

    private readonly m_boundProperties: Set<PropertyKey> = new Set();

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
        if (this.m_model != null)
            return this.m_model;

        if (this.parent != null)
            return this.parent.model;

        return null;
    }

    public set model(newModel: Dynamic)
    {
        if (this.m_subscription)
        {
            this.m_subscription.unsubscribe();
            this.m_subscription = null;
        }

        this.m_model = newModel;

        if (this.m_model != null)
            this.m_subscription = this.m_model.observable.subscribe(e => this.update(e));

        this.update(null);
    }

    public get parent(): VirtualNode
    {
        return this.m_parent;
    }

    // Creates a deep copy of this node
    public clone(): VirtualNode
    {
        // BUG: Not creating the right kind of VirtualNode here.
        let rval = new VirtualNode(this.element != null ? this.element.cloneNode(false) : null);

        this.forEach(c => {
            rval.addChild(c.clone());
        });

        return rval;
    }

    protected addBinding(binding: string): void
    {
        this.m_boundProperties.add(binding);
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

    /**
     * Called when the parent's model has changed and this model is bound to the change.
     */
    protected parentModelUpdated(event: ModelEvent): void
    {
        // Stub function.
    }

    /**
     * Called when the model has changed.
     */
    protected modelUpdated(event: ModelEvent): void
    {
        // Stub function
    }

    private update(event: ModelEvent): void
    {
        this.modelUpdated(event);

        let childUpdates = this.m_children.filter(x => x.element && x.element.isConnected);

        if (event != null && event.property != null)
            childUpdates = childUpdates.filter(x => x.m_boundProperties.size == 0 || x.m_boundProperties.has(event.property));

        childUpdates.forEach(c => c.parentModelUpdated(event));
    }
}

/* ================================================================================================================= */
