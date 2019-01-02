/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable, using, LinkedList } from "../../lepton";

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

/* ================================================================================================================= */

abstract class ParserState<T extends AstNode> implements IParserState
{
    public node: T;

    public add(child: AstNode): void
    {
        this.node.add(child);
    }
}

/* ================================================================================================================= */

class GenericState<T extends ElementNode> extends ParserState<T>
{
    public unprocessed: LinkedList<Attr> = new LinkedList();

    constructor(node: T)
    {
        super();
        this.node = node;

        for (let a of this.node.container.attributes)
            this.unprocessed.push(a);
    }

    public processedAttribute(name: string)
    {
        this.unprocessed.delete(x => x.name == name);
    }

    public addAttribute(name: string, value: string, isStatic: boolean)
    {
        this.node.addAttribute(name, value, isStatic);
    }
}

/* ================================================================================================================= */

class IfState extends GenericState<BranchNode>
{
    public branch: Branch;

    constructor(node: BranchNode)
    {
        super(node);
    }

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

        let state = new GenericState<ElementNode>(new ElementNode(node));

        using (this.asCurrent(state), () =>
        {
            this.parseAttributes();
            this.parseChildren(node);
        });

        return state.node;
    }

    private parseIfBlock(type: string, node: Element, condition: string, negate: boolean): BranchNode
    {
        if (condition == '')
            throw new Error(`'t-if' ${type} requires a condition.`);

        // Parse this like an IF tag but using the current element as the root.
        let state = new IfState(new BranchNode(node));
        state.branch = state.node.addBranch(condition, negate);

        if (type == 'tag')
            state.processedAttribute(negate ? 'not' : 'is');
        else
            state.processedAttribute('t-if');

        using (this.asCurrent(state), () =>
        {
            this.parseAttributes();
            this.parseChildren(node);
        });

        return state.node;
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

        let state = new GenericState(new LoopNode(node, binding));

        if (type == 'tag')
            state.processedAttribute('each');
        else
            state.processedAttribute('t-for');

        using (this.asCurrent(state), () =>
        {
            this.parseAttributes();
            this.parseChildren(node);
        });

        return state.node;
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

    private parseAttributes(): void
    {
        if (!(this.m_state instanceof GenericState))
            throw new Error("LOGIC ERROR: Not in GenericState to add attributes!");

        let state = this.m_state;

        this.m_state.unprocessed.forEach((attr: Attr) => {
            let isStatic = !attr.name.startsWith('t-');
            let name = isStatic ? attr.name : attr.name.substr(2);

            state.addAttribute(name, attr.value, isStatic);
        });
    }
}

/* ================================================================================================================= */
