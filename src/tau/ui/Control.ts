/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable } from "lepton-di";

import { LinkedList } from "../common";

/* ================================================================================================================= */

const CONTROL_TAG: unique symbol = Symbol('tau:control');

/**
 * Tags an HTMLElement with a control.
 *
 * Mostly for debugging.
 *
 * @param element The element to get
 * @param control The control to tag the element with.
 */
function tagElement(element: HTMLElement, control: Control): void
{
    (element as any)[CONTROL_TAG] = control;
}

/* ================================================================================================================= */

export abstract class Control implements IDisposable
{
    // Private properites

    private m_element: HTMLElement;
    private m_children: LinkedList<Control> = new LinkedList();
    private m_parent: Control;

    // Constructor/Destructor

    protected constructor()
    {
    }

    public dispose(): void
    {
        this.destroy();
        this.m_children.clear();
    }

    // Computed properties

    protected get element(): HTMLElement
    {
        this.create();
        return this.m_element;
    }

    public get focused(): boolean
    {
        return document.activeElement === this.element;
    }

    public set focused(value: boolean)
    {
        if (value)
            this.element.focus();
        else
            this.element.blur();
    }

    public get enabled(): boolean
    {
        return this.element.getAttribute('aria-disabled') !== 'true';
    }

    public set enabled(value: boolean)
    {
        this.element.setAttribute('aria-disabled', (!value).toString());
    }

    public get ariaLabel(): string
    {
        return this.element.getAttribute('aria-label');
    }

    public set ariaLabel(value: string)
    {
        this.element.setAttribute('aria-label', value);
    }

    public get tooltip(): string
    {
        return this.element.title;
    }

    public set tooltip(value: string)
    {
        this.element.title = value;
    }

    // Implementation

    protected forEach(cb: (c: Control) => void): void
    {
        for (let c of this.m_children)
            cb(c);
    }

    public add(child: Control): void
    {
        if (child.m_parent == null)
        {
            child.m_parent = this;
            this.m_children.push(child);
        }
        else if (child.m_parent !== this)
        {
            throw new Error('Child belongs to another parent!');
        }

        child.updateParentElement();
    }

    public remove(child: Control): void
    {
        if (child.m_parent == null)
            return;

        if (child.m_parent !== this)
            throw new Error('Child belongs to another parent!');

        this.m_children.delete(child);
        child.m_parent = null;

        if (this.m_element && child.m_element)
            this.m_element.removeChild(child.m_element);
    }

    private updateParentElement()
    {
        if (this.m_parent.m_element == null)
            return;

        this.create();

        if (this.m_element.parentElement != null && this.m_element.parentElement !== this.m_parent.m_element)
            this.m_element.parentElement.removeChild(this.m_element);

        if (this.m_element.parentElement == null)
            this.m_parent.m_element.appendChild(this.m_element);
    }

    protected render()
    {
    }

    protected build(): HTMLElement
    {
        return document.createElement('DIV');
    }

    protected create(): void
    {
        if (this.m_element)
            return;

        this.m_element = this.build();
        tagElement(this.m_element, this);

        this.render();

        this.forEach(c => c.updateParentElement());
    }

    private destroy(): void
    {
        if (this.m_element)
        {
            this.forEach(c => c.destroy());

            tagElement(this.m_element, null);
            this.m_element = null;
        }
    }
}

/* ================================================================================================================= */
