/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable, using } from "../../lepton";

import './utils';

import { AstNode } from "./AstNode";
import { BranchNode, Branch } from "./BranchNode";
import { ElementNode } from "./ElementNode";
import { TextNode } from "./TextNode";
import { LoopNode } from "./LoopNode";
import { ILogger, LogManager } from "../../common/logging";

/* ================================================================================================================= */

const exclusiveAttributes: Set<string> = new Set([ 't-if', 't-not-if', 't-for' ]);

/* ================================================================================================================= */

// Parser states.
interface IParserState
{
    add(child: AstNode): void;
}


abstract class ParserState<T extends AstNode> implements IParserState
{
    public node: T;

    public add(child: AstNode): void
    {
        this.node.add(child);
    }
}

/* ================================================================================================================= */

class GenericState<T extends AstNode> extends ParserState<T>
{
}

/* ================================================================================================================= */

class IfState extends ParserState<BranchNode>
{
    public branch: Branch;

    public add(child: AstNode): void
    {
        super.add(child);
        this.branch.children.push(child);
    }

    public addBranch(condition: string): void
    {
        if (this.branch.condition == '')
        {
            if (condition == '')
                throw new Error("Cannot have multiple unconditional else clauses on a 'T-IF' tag.");
            else
                throw new Error("Conditional branch must come before an unconditional branch in a 'T-IF' tag.");
        }

        this.branch = this.node.addBranch(condition);
    }
}

/* ================================================================================================================= */

class ForState extends ParserState<LoopNode>
{
}

/* ================================================================================================================= */

export class Parser
{
    private log: ILogger = LogManager.getLogger('paws.tau.vdom.parser');

    private m_state: IParserState;

    private asCurrent(state: IParserState): IDisposable
    {
        let prev = this.m_state;
        this.m_state = state;

        return { dispose: () => { this.m_state = prev; } };
    }

    public parse(root: Element): AstNode
    {
        return this.parseElement(root);
    }

    private parseChildren(node: Element): void
    {
        let children = Array.from(node.childNodes);

        for (let childNode of children)
            this.parseNode(childNode);
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
        {
            this.m_state.add(new TextNode(node.textContent));
        }
    }

    private parseElement(node: Element): AstNode
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

    private parseGenericTag(node: Element): AstNode
    {
        // Parse a generic DOM node; note that this could have an exclusive attribute.

        let attrs = Array.from(node.attributes.filter(a => exclusiveAttributes.has(a.name)));

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

        let production = new GenericState<ElementNode>();
        production.node = new ElementNode(node);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        })

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseIfBlock(type: string, node: Element, condition: string, negate: boolean): BranchNode
    {
        if (condition == '')
            throw new Error(`'t-if' ${type} requires a condition.`);

        // Parse this like an IF tag but using the current element as the root.
        let production = new IfState();

        production.node = new BranchNode(node);
        production.branch = production.node.addBranch(condition, negate);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        });

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseForBlock(type: string, node: Element, binding: string): LoopNode
    {
        if (binding == '')
        {
            if (type == 'tag')
                throw new Error("'t-for' tag requires 'each' attribute.");
            else
                throw new Error("'t-for' attribute requires a binding.");
        }

        let production = new ForState();
        production.node = new LoopNode(node, binding);

        using (this.asCurrent(production), () =>
        {
            this.parseChildren(node);
        });

        this.parseAttributes(production.node);

        return production.node;
    }

    private parseIfTag(node: Element): BranchNode
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

    private parseForTag(node: Element): LoopNode
    {
        let binding = node.getAttribute('each') || '';

        return this.parseForBlock('tag', node, binding);
    }

    private parseAttributes(vnode: ElementNode): void
    {
        let normalAttributes = vnode.container.attributes.filter(a => a.name.startsWith('t-') && !exclusiveAttributes.has(a.name));

        for (let attr of normalAttributes)
        {
        }
    }
}

/* ================================================================================================================= */
