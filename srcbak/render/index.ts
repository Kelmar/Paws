
/* ================================================================================================================= */

export abstract class ElementBehavior
{
    /**
     * Bit flags indicating which passes to call this behavior on.
     */
    public abstract readonly passFilter: RenderPass;

    /**
     * Dispatches calls from the VirtualEvent.render() call to the correct method.
     *
     * @param context The current rendering context
     */
    public render(context: RenderContext)
    {
        switch (context.pass)
        {
        case RenderPass.ReadDom  : this.readDom  (context); break;
        case RenderPass.ReadModel: this.readModel(context); break;
        case RenderPass.Filter   : this.filter   (context); break;
        case RenderPass.Layout   : this.layout   (context); break;
        case RenderPass.Modify   : this.modify   (context); break;
        }
    }

    public readDom(context: RenderContext): void
    {
    }

    public readModel(context: RenderContext): void
    {
    }

    public filter(context: RenderContext): void
    {
    }

    public layout(context: RenderContext): void
    {
    }

    public modify(context: RenderContext): void
    {
    }
}

/* ================================================================================================================= */

export class RenderContext
{
    private m_dirty: boolean = false;

    public readonly pass: RenderPass;

    public readonly node: VirtualNode;

    public readonly model: Dynamic;

    constructor(pass: RenderPass, node: VirtualNode, model: Dynamic)
    {
        this.pass = pass;
        this.node = node;
        this.model = model;
    }

    public get dirty(): boolean
    {
        return this.m_dirty;
    }

    public set dirty(value: boolean)
    {
        this.m_dirty = this.m_dirty || value;
    }
}

/* ================================================================================================================= */
/**
 * The current pass of the rendering engine.
 * 
 * This is a set of bit flags to allow a behavior to indicate which passes it is interested in being called on.
 */
export enum RenderPass
{
    /**
     * Reading the DOM to update the model values.
     *
     * In this pass, updates to models will not fire events.
     */
    ReadDom = 0x00000001,

    /**
     * Reading the model to determine if changes need to be made to the DOM.
     */
    ReadModel = 0x00000002,

    /**
     * Filtering VirtualNode children for inclusion/exclusion from the DOM.
     */
    Filter = 0x00000004,

    /**
     * Updating the DOM structure with new nodes.
     */
    Layout = 0x00000008,

    /**
     * Modifing the DOM with new values.  This is for minor updates where the fundamental structure of the DOM
     * will not be updated.  This includes things like attribute, style, and class changes.
     */
    Modify = 0x00000010,
}

/* ================================================================================================================= */
