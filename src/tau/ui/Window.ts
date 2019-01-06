/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable } from "lepton-di";

import { Control } from "./Control";
import { WindowFrame, FrameOptions } from "./WindowFrame";

/* ================================================================================================================= */

export interface WindowOptions
{
    fileName: string;
    initClass?: string;
    windowClass: string;
}

/* ================================================================================================================= */

let g_self: Window = null;
let g_init: any = null;

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

    if (options.initClass)
        g_init = new ext[options.initClass];

    let ev: IDisposable[] = [];

    function continueLoad()
    {
        for (let e of ev)
            e.dispose();

        ev = null;

        console.log(`Loading ${options.windowClass}`);
        g_self = new ext[options.windowClass];
    }

    ev.push(document.listen('DOMContentLoaded', continueLoad));
    ev.push(window.listen('load', continueLoad));
}

/* ================================================================================================================= */

export abstract class Window implements IDisposable
{
    private m_frame: WindowFrame

    protected constructor(frameOptions?: FrameOptions)
    {
        window.listen("close", () => this.closed());

        this.m_frame = new WindowFrame(frameOptions);
    }

    public dispose(): void
    {
        this.m_frame.dispose();

        this.m_frame = null;
        g_self = null;

        if (typeof g_init['dispose'] === 'function')
            g_init['dispose']();

        g_init = null;
    }

    public get title(): string
    {
        return this.m_frame.title;
    }

    public set title(value :string)
    {
        this.m_frame.title = value;
    }

    private closed(): void
    {
        this.dispose();
    }

    public add(child: Control): void
    {
        this.m_frame.add(child);
    }

    public remove(child: Control): void
    {
        this.m_frame.remove(child);
    }

    public static bootstrap(): void
    {
        bootstrapMain();
    }
}

/* ================================================================================================================= */
