/* ================================================================================================================= */
/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { ElementNode } from "./ElementNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */
/**
 * A single branch of our branching node with it's condition
 */
export class Branch
{
    /**
     * List of children that apply to this branch.
     */
    public readonly children: AstNode[] = [];

    /**
     * The condition that matches this branch.
     * 
     * An empty condition indicates a default condition.  (I.e. an 'else' with no condition)
     */
    public readonly condition: string;

    /**
     * Set if the condition should be inverted.  (For <T-IF not="someValue">)
     */
    public readonly invert: boolean;

    constructor (condition: string, invert?: boolean)
    {
        this.condition = condition;
        this.invert = this.invert || false;
    }

    /**
     * Checks to see if this branch matches the given model based on it's condition.
     *
     * @param model The model to check against.
     */
    public match(model: any): boolean
    {
        if (!this.condition)
            return true; // Default always matches.

        let res = !!(model[this.condition]);
        return this.invert ? !res : res;
    }
}

/* ================================================================================================================= */

export class BranchNode extends ElementNode
{
    private readonly m_branches: Branch[] = [];
    private m_currentBranch: Branch = null;

    public get currentBranch(): Branch
    {
        return this.m_currentBranch;
    }

    public addBranch(condition: string, invert?: boolean): Branch
    {
        let rval = new Branch(condition, invert);
        this.m_branches.push(rval);
        return rval;
    }

    protected compileBranch(codeGen: CodeGenerator, branch: Branch, endLabel: string)
    {
        let label: string = '';

        if (branch.condition != '')
        {
            label = codeGen.createLabel();
            codeGen.jump_false(branch.condition, label);
        }

        for (let child of branch.children)
            child.compile(codeGen);

        if (label != '')
        {
            codeGen.jump(endLabel);
            codeGen.emitLabel(label);
        }
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        let endLabel = codeGen.createLabel();

        for (let branch of this.m_branches)
            this.compileBranch(codeGen, branch, endLabel);

        codeGen.emitLabel(endLabel);
    }
}

/* ================================================================================================================= */