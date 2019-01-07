/* ================================================================================================================= */
/* ================================================================================================================= */

import { BranchNode, Branch } from './BranchNode';
import { ClassAttributeNode } from './ClassAttributeNode';
import { ElementNode } from './ElementNode';
import { LoopNode } from './LoopNode';
import { GenericAttributeNode } from './GenericAttributeNode';
import { TextAttributeNode } from './TextAttributeNode';
import { HtmlAttributeNode } from './HtmlAttributeNode';
import { TextNode } from './TextNode';

/* ================================================================================================================= */

export abstract class Visitor
{
    public abstract visitBranchNode(node: BranchNode): void;
    public abstract visitLoopNode(node: LoopNode): void;
    public abstract visitClassAttributeNode(node: ClassAttributeNode): void;
    public abstract visitTextAttributeNode(node: TextAttributeNode): void;
    public abstract visitHtmlAttributeNode(node: HtmlAttributeNode): void;
    public abstract visitGenericAttributeNode(node: GenericAttributeNode): void;
    public abstract visitElementNode(node: ElementNode): void;
    public abstract visitTextNode(node: TextNode): void;
}

/* ================================================================================================================= */
