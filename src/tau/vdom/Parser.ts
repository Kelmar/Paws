/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable, using } from "../../lepton";

import { VirtualNode } from "./VirtualNode";
import { BranchingBehavior, Branch } from "./BranchingBehavior";
import { VirtualElement } from "./VirtualElement";
import { VirtualText } from "./VirtualText";

/* ================================================================================================================= */

const exclusiveAttributes: Set<string> = new Set([ 't-if', 't-not-if', 't-for' ]);

/* ================================================================================================================= */

// Parser states.

abstract class ParserState
{
    public node: VirtualElement;

    public add(child: VirtualNode): void
    {
        this.node.add(child);
    }
}

/* ================================================================================================================= */

class GenericState extends ParserState
{
}

/* ================================================================================================================= */

class IfState extends ParserState
{
    public ifBehavior: BranchingBehavior;
    public currentBranch: Branch;

    public add(child: VirtualNode): void
    {
        super.add(child);
        this.currentBranch.children.push(child);
    }

    public addBranch(condition: string): void
    {
        if (this.currentBranch.condition == '')
        {
            if (condition == '')
                throw new Error("Cannot have multiple unconditional else clauses on a 'T-IF' tag.");
            else
                throw new Error("Conditional branch must come before an unconditional branch in a 'T-IF' tag.");
        }

        this.currentBranch = this.ifBehavior.addBranch(condition);
    }
}

/* ================================================================================================================= */

class ForState extends ParserState
{
}

/* ================================================================================================================= */

export class Parser
{
    private m_state: ParserState;

    private asCurrent(state: ParserState): IDisposable
    {
        let prev = this.m_state;
        this.m_state = state;

        return { dispose: () => { this.m_state = prev; } };
    }

    public parse(root: Element): VirtualNode
    {
        return this.parseElement(root);
    }

    private parseChildren(node: Element): void
    {
        let children = Array.from(node.childNodes);

        for (let childNode of children)
        {
            // Parent VirtualNode will re-add children as needed.
            node.removeChild(childNode);
            this.parseNode(childNode);
        }
    }

    private parseNode(node: Node): void
    {
        if (node instanceof Element)
        {
            let vChild = this.parseElement(node);

            if (vChild != null)
                this.m_state.add(vChild);
        }
        else if (node instanceof Text)
            this.m_state.add(new VirtualText(node));
    }

    private parseElement(node: Element): VirtualNode
    {
        let tagName = node.tagName.toLowerCase();

        switch (tagName)
        {
        case 't-if':
            return this.parseIfTag(node);

        case 't-else':
            this.parseElseTag(node);
            return null;

        case 't-for':
            return this.parseForTag(node);
        }

        return this.parseGenericTag(node);
    }

    private parseGenericTag(node: Element): VirtualNode
    {
        // Parse a generic DOM node; note that this could have an exclusive attribute.

        let attrs = Array.from(node.attributes.filter(k => exclusiveAttributes.has(k)));

        if (attrs.length > 1)
            throw new Error(`${attrs.join(', ')} are not valid on the same tag.`)

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

        let production = new GenericState();
        production.node = new VirtualElement(node);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        })

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseIfBlock(type: string, node: Element, condition: string, negate: boolean): VirtualNode
    {
        if (condition == '')
            throw new Error(`'t-if' ${type} requires a condition.`);

        // Parse this like an IF tag but using the current element as the root.
        let production = new IfState();

        production.node = new VirtualElement(node);
        production.ifBehavior = new BranchingBehavior();
        production.currentBranch = production.ifBehavior.addBranch(condition, negate);

        production.node.addBehavior(production.ifBehavior);

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
            throw new Error(`'t-for' ${type} requires 'each' attribute.`);

        let production = new ForState();
        production.node = new VirtualElement(node);

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

        if (!(this.m_state instanceof IfState))
            throw new Error("'t-else' can only be inside of a 't-if' tag.");

        this.m_state.addBranch(condition);

        this.parseChildren(node);
    }

    private parseForTag(node: Element): VirtualNode
    {
        let binding = node.getAttribute('each') || '';

        return this.parseForBlock('tag', node, binding);
    }

    private parseAttributes(vnode: VirtualElement): void
    {
        let normalAttributes = vnode.container.attributes.filter(x => x.startsWith('t-') && !exclusiveAttributes.has(x));

        for (let attr of normalAttributes)
        {
        }
    }
}

/* ================================================================================================================= */
