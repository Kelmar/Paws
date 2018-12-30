/* ================================================================================================================= */
/* ================================================================================================================= */

import { VirtualNode, NodeCollection } from "./VirtualNode";

/* ================================================================================================================= */
/**
 * Handles a for loop tag
 */
export class ForNode extends VirtualNode
{
    private m_childTemplates: NodeCollection;
    private parentEl: Element;

    private constructor(element: Element, readonly each: string)
    {
        super(element);
    }

    public static parseElement(element: Element, children: NodeCollection): ForNode
    {
        let el: Element = element.tagName.toUpperCase() == 'T-FOR' ? null : element;
        let rval: ForNode;

        if (el == null)
        {
            // FORMAT: <t-for each="items">
            rval = new ForNode(el, element.getAttribute('each'));
            rval.parentEl = element.parentElement;
            element.parentNode.removeChild(element);
        }
        else
        {
            // FORMAT: <div t-for="items"></div>
            rval = new ForNode(el, element.getAttribute('t-for'));
            rval.parentEl = element;
        }

        rval.m_childTemplates = [];

        for (let c of children)
        {
            if (c.element && c.element.parentNode != null)
                c.element.parentNode.removeChild(c.element);

            rval.m_childTemplates.push(c);
        }

        return rval;
    }

    public clone(): VirtualNode
    {
        let el: Element = this.element != null ? this.element.cloneNode(false) as Element : null;
        let rval: ForNode = new ForNode(el, this.each);

        rval.m_childTemplates = [];

        for (let c of this.m_childTemplates)
            rval.m_childTemplates.push(c.clone());

        return rval;
    }

    private updateItem($index: number, $item: any, $first: boolean, $last: boolean, $even: boolean, $odd: boolean): void
    {
        for (let c of this.m_childTemplates)
        {
            let clone = c.clone();
            clone.model = $item;

            this.addChild(clone);

            if (clone.element != null)
                this.parentEl.appendChild(clone.element);
        }
    }

    protected modelUpdated(name: PropertyKey | string, value?: any): void
    {
        if (name != this.each)
            return; // List wasn't updated.

        // Update on model changed event, or the list itself changed.
        this.clearElement();

        let items = (this.model as any)[this.each];

        for (var $index = 0; $index < items.length; ++$index)
        {
            this.updateItem($index, items[$index], $index == 0, $index == items.length - 1, ($index & 2) == 0, ($index & 2) != 0);
        }
    }
}

/* ================================================================================================================= */
