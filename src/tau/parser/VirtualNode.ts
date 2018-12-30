/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from '../models';
import { IDisposable } from '../../lepton';

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

    private m_parent: VirtualNode = null;
    private m_subscription: IDisposable;
    private m_model: Observable;

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
            this.m_subscription.dispose();
            this.m_subscription = null;
        }
    }

    public get model(): Observable
    {
        if (this.m_model != null)
            return this.m_model;

        if (this.parent != null)
            return this.parent.model;

        return null;
    }

    public set model(newModel: Observable)
    {
        if (this.m_subscription)
        {
            this.m_subscription.dispose();
            this.m_subscription = null;
        }

        this.m_model = newModel;

        if (this.m_model != null)
            this.m_subscription = this.m_model.subscribe(({}, name, value) => this.update(name, value));

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
     * Called when the model has changed.
     *
     * @param source The VirtualNode that the model was updated for.
     * @param name The name of the model property that changed.  NULL if the whole model has changed.
     * @param value The new value.
     */
    protected modelUpdated(name: PropertyKey | string, value?: any): void
    {
        // Stub function
    }

    protected update(name: PropertyKey | string, value?: any): void
    {
        this.modelUpdated(name, value);

        /*
        let bindingsToApply = (name != null) ? this.m_bindings.filter(x => x.name == name) : this.m_bindings;

        for (let binding of bindingsToApply)
            binding.apply(this.element, value);
        */

        this.forEach(c => {
            if (c.element && c.element.isConnected)
                c.update(name, value)
        });
    }
}

/* ================================================================================================================= */
