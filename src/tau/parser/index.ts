/* ================================================================================================================= */
/* ================================================================================================================= */

import { LogManager } from "../../common/logging";

export * from './VirtualNode';

import { VirtualNode } from './VirtualNode';
import { IfNode, ElseNode } from "./IfNode";
import { ForNode } from "./ForNode";

/* ================================================================================================================= */
/* 
 * Else appears in it's parent tag and can be nested with other else tags.
 * We need to pull this part of the tree out and add it to to the master IF.
 *
 * For example, given:
 * <div t-if="condition">
 *   True part
 * <else />
 *   False part
 * <div>
 *
 * The browser will return the DOM as: 
 * <div>
 *   True part
 *   <else>False part</else>
 * </div>
 *
 * Or given:
 * <div t-if="condition">
 *   Condition 1 part
 * <else if="otherCondition" />
 *   Condition 2 part
 * <else />
 *   Default part
 * </div>
 *
 * The browser yeilds
 * <div>
 *   Condition 1 part
 *   <else if>
 *     Condition 2 part
 *     <else>Default part</else>
 *   </else>
 * </div>
 */

/* ================================================================================================================= */

export class BindingParser2
{
    private readonly log = LogManager.getLogger('paws.tau.bindingParser2');

    public parse(root: Element): VirtualNode
    {
        if (!root)
            throw new Error('Root element node is required.');

        // Root node must be an element, otherwise this whole thing doesn't work.
        return this.parseItem(root);
    }

    private parseItem(item: Node): VirtualNode
    {
        if (item instanceof Comment)
            return null; // Ignore comments

        if (item instanceof Element)
            return this.parseElement(item);

        if (item instanceof Text)
            return new VirtualNode(item);

        throw new Error("Unknown node type: " + item.nodeName);
    }

    private parseElement(item: Element): VirtualNode
    {
        let tagName = item.tagName.toUpperCase();

        if (tagName == 'T-IF' || item.hasAttribute('t-if'))
            return this.parseIfTag(item);

        if (tagName == 'T-ELSE')
            return this.parseElseTag(item);

        if (tagName == 'T-FOR' || item.hasAttribute('t-for'))
            return this.parseForTag(item);

        /*
        if (tagName == 'T-WITH' || item.hasAttribute('t-with'))
            return this.parseWithTag(item);
        */

        // Generic tag
        let rval = new VirtualNode(item);
        rval.addRange(this.parseChildren(item));
        return rval;
    }

    private parseIfTag(item: Element): VirtualNode
    {
        let rval = IfNode.parseElement(item);

        for (var c of this.parseChildren(item))
        {
            if (c instanceof ElseNode)
            {
                rval.addBranch(c);
                c.dispose();
            }
            else
                rval.addChild(c);
        }

        return rval;
    }

    private parseElseTag(item: Element): VirtualNode
    {
        let rval = new ElseNode(item);
        rval.addRange(this.parseChildren(item));
        return rval;
    }

    private parseForTag(item: Element): VirtualNode
    {
        let rval = ForNode.parseElement(item, this.parseChildren(item));
        return rval;
    }

    private parseWithTag(item: Element): VirtualNode
    {
        let rval = new VirtualNode(item);
        rval.addRange(this.parseChildren(item))
        return rval;
    }

    private *parseChildren(parent: Element): IterableIterator<VirtualNode>
    {
        // Clone list of children, our calls will be modifying the parent's structure.
        let children: Node[] = [];
        parent.childNodes.forEach(x => children.push(x));

        for (let child of children)
            yield this.parseItem(child);
    }
}

/* ================================================================================================================= */
