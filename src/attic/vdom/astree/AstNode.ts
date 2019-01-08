/* ================================================================================================================= */
/* ================================================================================================================= */

import { LinkedList } from "../../common";
import { Visitor } from "./Visitor";

/* ================================================================================================================= */

export abstract class AstNode
{
    private m_children: LinkedList<AstNode> = new LinkedList();

    public add(node: AstNode): void
    {
        if (node != null && node != this)
            this.m_children.push(node);
    }

    public remove(node: AstNode): void
    {
        this.m_children.delete(node);
    }

    public forEach(callback: (node: AstNode) => void): void
    {
        for (let node of this.m_children)
            callback(node);
    }

    public abstract receive(visitor: Visitor): void;
}

/* ================================================================================================================= */
