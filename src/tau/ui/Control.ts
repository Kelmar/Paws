/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, fromEvent } from "rxjs";

import { IDisposable } from "lepton-di";

import { LinkedList } from "../common";

import { EventType } from './DomEvents';

/* ================================================================================================================= */

export interface ControlOptions
{
    element?: HTMLElement;
    tagName?: string;
    id?: string;
}

const DEFAULT_CONTROL_OPTIONS: ControlOptions = {
    tagName: 'DIV'
}

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

    protected constructor(options?: ControlOptions)
    {
        options = {...DEFAULT_CONTROL_OPTIONS, ...options};

        this.m_element = (options.element != null) ? options.element : document.createElement(options.tagName);

        tagElement(this.m_element, this);

        if (options.id)
            this.m_element.setAttribute('id', options.id);
    }

    public dispose(): void
    {
        if (this.m_element)
        {
            if (this.m_element.parentElement != null && this.m_element.isConnected)
            {
                // Pull ourselves out of the DOM as early as we can to keep things speedy.
                this.m_element.parentElement.removeChild(this.m_element);
            }

            this.forEach(c => c.dispose());

            tagElement(this.m_element, null);
            this.m_element = null;
        }

        this.m_children.clear();
    }

    // Computed properties

    protected get element(): HTMLElement
    {
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

    protected observe(type: EventType): Observable<Event>
    {
        return fromEvent(this.m_element, type);
    }

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

            if (child.m_element.parentElement !== this.m_element)
            {
                if (child.m_element.parentElement != null)
                    child.m_element.parentElement.removeChild(child.m_element);

                this.m_element.appendChild(child.m_element);
            }
        }
        else if (child.m_parent !== this)
        {
            throw new Error('Child belongs to another parent!');
        }

        child.update();
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

    public addClass(className: string): void
    {
        this.m_element.classList.add(className);
    }

    public removeClass(className: string): void
    {
        this.m_element.classList.remove(className);
    }

    protected update()
    {
    }
}

/* ================================================================================================================= */
