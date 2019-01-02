/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable, using, LinkedList } from "../../lepton";
import { ILogger, LogManager } from "../../common/logging";

import './utils';

import "./astree";
import * as ast from "./astree";

/* ================================================================================================================= */

const exclusiveAttributes: Set<string> = new Set([ 't-if', 't-not-if', 't-for' ]);

/* ================================================================================================================= */

// Parser states.
interface IParserState
{
    add(child: ast.AstNode): void;
}

/* ================================================================================================================= */

abstract class ParserState<T extends ast.AstNode> implements IParserState
{
    public node: T;

    public add(child: ast.AstNode): void
    {
        this.node.add(child);
    }
}

/* ================================================================================================================= */

class GenericState<T extends ast.ElementNode> extends ParserState<T>
{
    public unprocessed: LinkedList<Attr> = new LinkedList();

    constructor(node: T, attributes: NamedNodeMap)
    {
        super();
        this.node = node;

        for (let a of attributes)
            this.unprocessed.push(a);
    }

    public processedAttribute(name: string)
    {
        this.unprocessed.delete(x => x.name == name);
    }
}

/* ================================================================================================================= */

class IfState extends GenericState<ast.BranchNode>
{
    public branch: ast.Branch;

    constructor(node: ast.BranchNode, attributes: NamedNodeMap)
    {
        super(node, attributes);
    }

    public add(child: ast.AstNode): void
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

    public parse(root: Element): ast.AstNode
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
            this.m_state.add(new ast.TextNode(node.textContent));
        }
    }

    private parseElement(node: Element): ast.AstNode
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

    private parseGenericTag(node: Element): ast.AstNode
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

        let elNode = new ast.ElementNode(node.tagName);
        let state = new GenericState<ast.ElementNode>(elNode, node.attributes);

        using (this.asCurrent(state), () =>
        {
            this.parseAttributes();
            this.parseChildren(node);
        });

        return state.node;
    }

    private parseIfBlock(type: string, node: Element, condition: string, negate: boolean): ast.BranchNode
    {
        if (condition == '')
            throw new Error(`'t-if' ${type} requires a condition.`);

        // Parse this like an IF tag but using the current element as the root.

        let branchNode = new ast.BranchNode(node.tagName);
        let state = new IfState(branchNode, node.attributes);

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

    private parseForBlock(type: string, node: Element, binding: string): ast.LoopNode
    {
        if (binding == '')
        {
            if (type == 'tag')
                throw new Error("'t-for' tag requires 'each' attribute.");
            else
                throw new Error("'t-for' attribute requires a binding.");
        }

        let loopNode = new ast.LoopNode(node.tagName, binding);
        let state = new GenericState(loopNode, node.attributes);

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

    private parseIfTag(node: Element): ast.BranchNode
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

    private parseForTag(node: Element): ast.LoopNode
    {
        let binding = node.getAttribute('each') || '';

        return this.parseForBlock('tag', node, binding);
    }

    private parseAttributes(): void
    {
        if (!(this.m_state instanceof GenericState))
            throw new Error("LOGIC ERROR: Not in GenericState to add attributes!");

        this.m_state.unprocessed.forEach((attr: Attr) => this.m_state.add(this.parseAttribute(attr)));
    }

    private parseAttribute(attr: Attr): ast.AttributeNode
    {
        let isDynamic = attr.name.startsWith('t-');
        let name = isDynamic ? attr.name.substr(2) : attr.name;

        if (isDynamic)
        {
            if (name.startsWith('class'))
                return new ast.ClassAttributeNode(name, attr.value);

            if (name == 'html')
                return new ast.HtmlAttributeNode(attr.value);

            if (name == 'text')
                return new ast.TextAttributeNode(attr.value);
        }

        return new ast.GenericAttributeNode(name, attr.value, !isDynamic);
    }
}

/* ================================================================================================================= */
