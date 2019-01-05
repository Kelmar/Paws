/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable } from "lepton-di";

import * as domUtils from "./DomUtils";

import { Control } from "./Control";

/* ================================================================================================================= */

export class WindowContainer extends Control
{
    constructor()
    {
        super();
        this.create(); // Force early creation.
    }

    protected build(): HTMLElement
    {
        return domUtils.findOrCreateTag('BODY');
    }
}

/* ================================================================================================================= */

let g_self: Window = null;

function readOptions(): WindowOptions
{
    let str = window.location.hash.replace(/^#/, '');
    str = decodeURIComponent(str);
    return JSON.parse(str);
}

function bootstrapMain()
{
    const options = readOptions();

    const ext: any = require(options.fileName);

    let ev: IDisposable[] = [];

    function continueLoad()
    {
        for (let e of ev)
            e.dispose();

        ev = null;

        console.log(`Loading ${options.className}`);
        g_self = new ext[options.className];
    }

    ev.push(document.listen('DOMContentLoaded', continueLoad));
    ev.push(window.listen('load', continueLoad));
}

/* ================================================================================================================= */

export abstract class Window implements IDisposable
{
    private m_body: WindowContainer

    protected constructor()
    {
        window.listen("close", () => this.closed());

        this.m_body = new WindowContainer();
    }

    public dispose(): void
    {
        this.m_body.dispose();
    }

    public get title(): string
    {
        return document.title;
    }

    public set title(value :string)
    {
        document.title = value;
    }

    private closed(): void
    {
        this.dispose();
    }

    public add(child: Control): void
    {
        this.m_body.add(child);
    }

    public remove(child: Control): void
    {
        this.m_body.remove(child);
    }

    public static bootstrap(): void
    {
        bootstrapMain();
    }
}

/* ================================================================================================================= */

export interface WindowOptions
{
    className: string;
    fileName: string;
}

/* ================================================================================================================= */
