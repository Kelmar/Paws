/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, fromEvent } from "rxjs";

import { IDisposable } from "lepton-di";

import { LinkedList } from "../common";

import 'DomUtils';
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
/**
 * Base class for all controls visible in a window.
 */
export abstract class Control implements IDisposable
{
    // Private properites

    private readonly m_children: LinkedList<Control> = new LinkedList();
    private readonly m_element: HTMLElement;

    private m_parent: Control;

    // Constructor/Destructor

    protected constructor(options?: ControlOptions)
    {
        options = {...DEFAULT_CONTROL_OPTIONS, ...options};

        this.m_element = options.element ? options.element : document.createElement(options.tagName);

        tagElement(this.m_element, this);

        if (options.id)
            this.m_element.setAttribute('id', options.id);
    }

    public dispose(): void
    {
        if (this.m_element && this.m_element.isConnected)
        {
            /*
             * We remove oursleves from the DOM as soon as possible so we don't have to worry about
             * children getting pulled out of the DOM and creating a cascading set of DOM updates.
             */
            this.m_element.detach();
        }

        this.forEach(c => c.dispose());

        if (this.m_element)
            tagElement(this.m_element, null);

        this.m_children.clear();
    }

    // Computed properties

    protected get element(): HTMLElement
    {
        return this.m_element;
    }

    public get focused(): boolean
    {
        return document.activeElement === this.m_element;
    }

    public set focused(value: boolean)
    {
        if (value)
            this.m_element.focus();
        else
            this.m_element.blur();
    }

    public get enabled(): boolean
    {
        if (this.m_element.hasAttribute('aria-disabled'))
            return this.m_element.getAttribute('aria-disabled') !== 'true';

        return true;
    }

    public set enabled(value: boolean)
    {
        this.m_element.setAttribute('aria-disabled', (!value).toString());
    }

    /**
     * Sets the aria label for the control.
     * 
     * @description The aria label is used by assistive technologies (e.g. screen readers) when
     * the immediate function of a control cannot be determined just from the text (or lack there of)
     * in the control.   For example, the close button on a form might be labeled with an 'X', but the
     * aria label would say 'close' so a screen reader can inform the user of the button's function.
     */
    public get ariaLabel(): string
    {
        return this.m_element.getAttribute('aria-label');
    }

    public set ariaLabel(value: string)
    {
        this.m_element.setAttribute('aria-label', value);
    }

    public get tooltip(): string
    {
        return this.m_element.title;
    }

    public set tooltip(value: string)
    {
        this.m_element.title = value;
    }

    // Implementation

    protected observe(type: EventType): Observable<Event>
    {
        return fromEvent(this.m_element, type);
    }

    /**
     * Executes a callback function on each child contained within this control.
     *
     * @param cb The callback function to execute.
     */
    protected forEach(cb: (c: Control) => void): void
    {
        for (let c of this.m_children)
            cb(c);
    }

    public add(...children: Control[]): void
    {
        if (children.some(c => c.m_parent && c.m_parent !== this))
            throw new Error('Child belongs to another parent');

        for (let child of children)
        {
            if (child.m_parent == null)
            {
                child.m_parent = this;
                this.m_children.push(child);

                if (child.m_element.parentElement !== this.m_element)
                {
                    child.m_element.detach();
                    this.m_element.appendChild(child.m_element);
                }
            }

            child.update();
        }
    }

    public remove(child: Control): void
    {
        if (child.m_parent == null)
            return;

        if (child.m_parent !== this)
            throw new Error('Child belongs to another parent!');

        this.m_children.delete(child);
        child.m_parent = null;

        if (child.m_element)
            child.m_element.detach();
    }

    public addClass(...names: string[]): void
    {
        this.m_element.classList.add(...names);
    }

    public removeClass(...names: string[]): void
    {
        this.m_element.classList.remove(...names);
    }

    protected updateChildren()
    {
        this.forEach(c => c.update());
    }

    protected update()
    {
    }
}

/* ================================================================================================================= */
