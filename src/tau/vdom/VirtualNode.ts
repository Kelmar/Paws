/* ================================================================================================================= */
/* ================================================================================================================= */

import { LinkedList, IDisposable } from "../../lepton";
import { Dynamic, ModelEvent } from "../models";
import { Subscription } from "rxjs";

/* ================================================================================================================= */

export interface INodeBehavior
{
    /**
     * Called at the start of the VirtualNode's update sequence.
     */
    initPhase(): void;

    /**
     * Called when the VirtualNode is in the read phase.
     * 
     * In this phase the DOM is read and the model values will be updated.  (E.g. input values)
     * Durring this phase, change events on the model will be ignored.
     * 
     * @returns True if this behavior has updates.  False if it does not.
     */
    readPhase(node: VirtualNode): boolean;

    /**
     * Called when the VirtualNode is in the filter phase.
     * 
     * In this phase, child nodes are filtered, those that aren't listed after the filter is applied
     * will be removed from the DOM in the layout phase.
     */
    filterPhase(): IterableIterator<VirtualNode>;

    /**
     * Called when the VirtualNode is in the layout phase.
     * 
     * Durring this phase the DOM tree is adjusted based on the state of the model. (if branches, and for loops)
     */
    layoutPhase(): void;

    /**
     * Called when the VirutlaNode is in the modify phase.
     * 
     * In this phase values about the DOM are updated that reflect their bound model values.  This phase does
     * not update the DOM in significant ways.  (E.g. attribute, style, and class changes.)
     */
    modifyPhase(): void;

    /**
     * Called at the end of the VirtualNode's update.
     */
    clanupPhase(): void;
}

/* ================================================================================================================= */

export class VirtualNode implements IDisposable
{
    private m_children: LinkedList<VirtualNode> = new LinkedList();
    private m_behaviors: INodeBehavior[] = [];
    private m_parent: VirtualNode;

    private m_updating: boolean = false;

    private m_sub: Subscription = null;
    private m_model: Dynamic = null;

    public constructor(readonly container: Element)
    {
    }

    public dispose()
    {
        this.forEach(node => node.dispose());
        this.m_children.clear();
    }

    public get parent(): VirtualNode
    {
        return this.m_parent;
    }

    public get model(): Dynamic
    {
        if (this.ownModel)
            return this.m_model;

        if (this.parent != null)
            return this.parent.m_model;

        return null;
    }

    public set model(value: Dynamic)
    {
        if (this.m_sub)
            this.m_sub.unsubscribe();

        this.m_model = value;

        this.m_sub = this.ownModel ? this.m_model.observable.subscribe(e => this.modelUpdated(e)) : null;
        this.modelUpdated(null)
    }

    public get ownModel(): boolean
    {
        return this.m_model != null;
    }

    public addBehavior(behavior: INodeBehavior): void
    {
        this.m_behaviors.push(behavior);
    }

    public add(node: VirtualNode): void
    {
        if (node != null && node != this)
        {
            node.m_parent = this;
            this.m_children.push(node);
        }
    }

    public remove(node: VirtualNode): void
    {
        if (node != null && node.m_parent == this)
        {
            node.m_parent = null;
            this.m_children.delete(node);
        }
    }

    public clone(): VirtualNode
    {
        let rval = new VirtualNode(this.container.cloneNode(false) as Element);

        this.forEach(n => rval.add(n.clone()));

        return rval;
    }

    public forEach(callback: (node: VirtualNode) => void): void
    {
        for (let node of this.m_children)
            callback(node);
    }

    private modelUpdated(event: ModelEvent): void
    {
        if (!this.m_updating)
            this.update();
    }

    public update()
    {
        this.m_updating = true;

        function callBehavior(method: string)
        {
            for (let behavior of this.m_behaviors)
            {
                let b: any = behavior;
                b[method]();
            }
        }

        try
        {
            callBehavior("initPhase"   );
            callBehavior("readPhase"   );
            callBehavior("filterPhase" );
            callBehavior("layoutPhase" );
            callBehavior("modifyPhase" );
            callBehavior("cleanupPhase");
        }
        finally
        {
            this.m_updating = false;
        }
    }
}

/* ================================================================================================================= */
