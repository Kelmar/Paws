/* ================================================================================================================= */
/* ================================================================================================================= */

import { Dynamic } from '../models';
import { VirtualNode } from './VirtualNode'
import { INodeBehavior, VirtualElement } from "./VirtualElement";

/* ================================================================================================================= */
/**
 * A single branch of our branching behavior with it's condition
 */
export class Branch
{
    /**
     * List of children that apply to this branch.
     */
    public readonly children: VirtualNode[] = [];

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
    public match(model: Dynamic): boolean
    {
        if (!this.condition)
            return true; // Default always matches.

        let res = !!(model[this.condition]);
        return this.invert ? !res : res;
    }
}

/* ================================================================================================================= */
/**
 * A node behavior that applies a branch based on a boolean condition.
 */
export class BranchingBehavior implements INodeBehavior
{
    private readonly m_branches: Branch[] = [];
    private m_currentBranch: Branch = null;

    constructor()
    {
    }

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

    // INodeBehavior methods

    public initPhase(): void 
    {
    }
    
    public readPhase(node: VirtualElement): boolean 
    {
        let model: Dynamic = node.model;
        let branch: Branch = this.m_branches.find(b => b.match(model));

        if (branch != this.m_currentBranch)
        {
            this.m_currentBranch = branch;
            return true;
        }

        return false;
    }

    public *filterPhase(): IterableIterator<VirtualNode> 
    {
        if (!this.m_currentBranch)
            return;
        
        for (let child of this.m_currentBranch.children)
            yield child;
    }

    layoutPhase(): void 
    {
    }

    modifyPhase(): void 
    {
    }

    clanupPhase(): void 
    {
    }
}

/* ================================================================================================================= */
