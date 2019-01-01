/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable, using } from "../../lepton";

import { VirtualNode } from "./VirtualNode";
import { BranchingBehavior, Branch } from "./BranchingBehavior";

/* ================================================================================================================= */

abstract class Production
{
    public node: VirtualNode
}

class RootProduction extends Production
{
}

class IfProduction extends Production
{
    public ifBehavior: BranchingBehavior;
    public currentBranch: Branch;
}

class ForProduction extends Production
{
}

const exclusiveAttributes: Set<string> = new Set([ 't-if', 't-not-if', 't-for' ]);

/* ================================================================================================================= */

export class Parser
{
    private m_current: Production;

    public parse(root: Element): VirtualNode
    {
        return this.parseElement(root);
    }

    private parseChildren(node: Element): void
    {
        for (let c of node.childNodes)
        {
            if (c instanceof Element)
            {
                let vChild = this.parseElement(c);

                if (vChild != null)
                    this.m_current.node.add(vChild);
            }
        }
    }

    private asCurrent(item: Production): IDisposable
    {
        let prev = this.m_current;
        this.m_current = item;

        return { dispose: () => { this.m_current = prev; } };
    }

    private parseElement(node: Element): VirtualNode
    {
        let tagName = node.tagName.toUpperCase();

        switch (tagName)
        {
        case 'T-IF':
            return this.parseIfTag(node);

        case 'T-ELSE':
            this.parseElseTag(node);
            return null;

        case 'T-FOR':
            return this.parseForTag(node);
        }

        return this.parseGenericTag(node);
    }

    private parseGenericTag(node: Element): VirtualNode
    {
        // Parse a generic DOM node; note that this could have a t-if, t-if-not, or t-for attributes.

        let attrs = Array.from(node.attributes.filter(k => exclusiveAttributes.has(k)));

        if (attrs.length > 1)
        {
            throw new Error(`${attrs.join(', ')} are not valid on the same tag.`)
        }

        if (attrs.length == 1)
        {
            let [attr] = attrs;
            let negate: boolean = attr.name.toLowerCase() == 't-if-not';

            switch (attr.name.toLowerCase())
            {
            case 't-if-not':
            case 't-if':
                return this.parseIfBlock('attribute', node, attr.value, negate);

            case 't-for':
                return this.parseForBlock('attribute', node, attr.value);
            }
        }

        let rval = new VirtualNode(node);
        this.parseAttributes(rval);
        return rval;
    }

    private parseIfBlock(type: string, node: Element, condition: string, negate: boolean): VirtualNode
    {
        if (condition == '')
            throw new Error(`'t-if' ${type} requires a condition.`);

        // Parse this like an IF tag but using the current element as the root.
        let production = new IfProduction();

        production.node = new VirtualNode(node);
        production.ifBehavior = new BranchingBehavior();
        production.currentBranch = production.ifBehavior.addBranch(condition, negate);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        });

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseForBlock(type: string, node: Element, binding: string): VirtualNode
    {
        if (binding == '')
            throw new Error(`'T-FOR' ${type} requires 'each' attribute.`);

        let production = new ForProduction();
        production.node = new VirtualNode(node);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        });

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseIfTag(node: Element): VirtualNode
    {
        let condition = node.getAttribute('is') || '';
        let negate: boolean = false;

        if (condition == '')
        {
            condition = node.getAttribute('not') || '';
            negate = true;
        }

        return this.parseIfBlock('tag', node, condition, negate);
    }

    private parseElseTag(node: Element): void
    {
        // Else tag does not create a virtual node, it adds a new branch to the current condition.

        let condition = node.getAttribute('if') || '';

        if (!(this.m_current instanceof IfProduction))
            throw new Error("'T-ELSE' can only be inside of 'T-IF' tag.");

        if (this.m_current.currentBranch.condition == '')
        {
            if (condition == '')
                throw new Error("Cannot have multiple unconditional else clauses on a 'T-IF' tag.");
            else
                throw new Error("Conditional branch must come before an unconditional branch in a 'T-IF' tag.");
        }

        this.m_current.currentBranch = this.m_current.ifBehavior.addBranch(condition);

        this.parseChildren(node);
    }

    private parseForTag(node: Element): VirtualNode
    {
        let binding = node.getAttribute('each') || '';

        return this.parseForBlock('tag', node, binding);
    }

    private parseAttributes(vnode: VirtualNode): void
    {
        let normalAttributes = vnode.container.attributes.filter(x => x.startsWith('t-') && !exclusiveAttributes.has(x));

        for (let attr of normalAttributes)
        {
        }
    }
}

/* ================================================================================================================= */
