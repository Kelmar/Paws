/* ================================================================================================================= */
/* ================================================================================================================= */

import { VirtualNode, NodeCollection } from "./VirtualNode";

/* ================================================================================================================= */

class BranchCondition
{
    public readonly children: VirtualNode[] = [];

    constructor (readonly condition: string)
    {
    }
}

/* ================================================================================================================= */

export class IfNode extends VirtualNode
{
    private m_branches: BranchCondition[] = [];
    private m_lastBranch: BranchCondition = null;

    private constructor (element: Element)
    {
        super(element);
    }

    public static parseElement(element: Element): IfNode
    {
        let rval: IfNode;

        let ifCondition: BranchCondition;

        if (element.tagName.toUpperCase() == 'T-IF')
        {
            // <T-IF> style
            ifCondition = new BranchCondition(IfNode.parseIsNotConditions(element));
        }
        else
        {
            // On tag style (e.g.: <div t-if="true"></div>)
            ifCondition = new BranchCondition(element.getAttribute('t-if'));
        }

        rval = new IfNode(element);
        rval.m_branches.push(ifCondition);

        return rval;
    }

    private static parseIsNotConditions(element: Element)
    {
        for (let attr of element.attributes)
        {
            switch (attr.name)
            {
            case 'is':
                return attr.value;

            case 'not':
                return '!!(' + attr.value + ')';
            }
        }

        throw new Error('T-IF has no conditions');
    }

    public clone(): VirtualNode
    {
        let el: Element = this.element != null ? this.element.cloneNode(false) as Element : null;
        let rval: IfNode = new IfNode(el);

        for (let branch of this.m_branches)
        {
            rval.m_branches.push(new BranchCondition(branch.condition));

            for (let c of branch.children)
                rval.addChild(c.clone());
        }

        return rval;
    }

    public addChild(child: VirtualNode): void
    {
        super.addChild(child);

        // Add child to last added branch.
        this.m_branches[this.m_branches.length - 1].children.push(child);
    }

    public addBranch(elseNode: ElseNode): void
    {
        let lastAdded = this.m_branches[this.m_branches.length - 1];

        if (lastAdded.condition == '')
        {
            if (elseNode.condition == '')
                throw new Error('Multiple unconditional T-ELSE clauses in a single T-IF');
            else
                throw new Error('Condtional T-ELSE clause must proceed unconditional T-ELSE.');
        }

        // Else nodes don't have an actual tag in the real DOM.
        elseNode.element.parentNode.removeChild(elseNode.element);

        let rval = new BranchCondition(elseNode.condition);
        this.m_branches.push(rval);

        elseNode.forEach(c => rval.children.push(c));

        this.moveChildren(elseNode);
    }

    private getMatchingCondition(): BranchCondition
    {
        for (var branch of this.m_branches)
        {
            if (!branch.condition)
                return branch; // Unconditional else branch is always last.

            let result: boolean = !!((this.model as any)[branch.condition]);

            if (result)
                return branch;
        }

        return null;
    }

    protected modelUpdated(name: PropertyKey | string, value?: any): void
    {
        let condition = this.getMatchingCondition();

        if (condition == null)
            return;

        if (condition != this.m_lastBranch)
        {
            this.clearElement();

            this.m_lastBranch = condition;

            for (let child of condition.children)
                this.element.appendChild(child.element);
        }
    }
}

/* ================================================================================================================= */

export class ElseNode extends VirtualNode
{
    public readonly condition: string;

    constructor(element: Element)
    {
        super(element);

        this.condition = element.getAttribute('if') || '';
    }
}

/* ================================================================================================================= */
