/* ================================================================================================================= */
/* ================================================================================================================= */

import { remote, BrowserWindow } from 'electron';

import { fromEvent, Subscription } from "rxjs";

import { IDisposable } from "lepton-di";

import './DomEvents';
import { EventType } from './DomEvents';

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
        g_init = new ext[options.initClass]();

    let subs: Subscription[] = [];

    function continueLoad()
    {
        for (let sub of subs)
            sub.unsubscribe();

        subs = null;

        console.log(`Loading ${options.windowClass}`);
        g_self = new ext[options.windowClass]();
    }

    subs.push(fromEvent(document, EventType.ContentLoaded).subscribe(continueLoad));
    subs.push(fromEvent(window, EventType.Load).subscribe(continueLoad));
}

/* ================================================================================================================= */

export abstract class Window implements IDisposable
{
    private readonly m_browserWin: BrowserWindow;

    private m_subs: Subscription[] = [];
    private m_frame: WindowFrame

    protected constructor(frameOptions?: FrameOptions)
    {
        this.m_browserWin = remote.getCurrentWindow();

        this.m_frame = new WindowFrame(frameOptions);
        this.m_frame.isMaximized = this.m_browserWin.isMaximized();
        this.m_subs.push(this.m_frame.windowEvent$.subscribe(e => this.handleTitleBarEvent(e)));

        this.listen(window, EventType.Close, () => this.closed());
        this.listen(this.m_browserWin, 'maximize', () => this.maximized());
        this.listen(this.m_browserWin, 'unmaximize', () => this.restored());
    }

    public dispose(): void
    {
        for (let sub of this.m_subs)
            sub.unsubscribe();

        this.m_subs = null;

        this.m_frame.dispose();
        this.m_frame = null;

        if (g_init != null)
        {
            if (typeof g_init['dispose'] === 'function')
                g_init['dispose']();

            g_init = null;
        }

        g_self = null;
    }

    public get title(): string
    {
        return this.m_frame.title;
    }

    public set title(value :string)
    {
        this.m_frame.title = value;
    }

    private listen(source: any, type: EventType | string, cb: () => void): void
    {
        let sub = fromEvent(source, type).subscribe(cb);
        this.m_subs.push(sub);
    }

    private handleTitleBarEvent(event: string): void
    {
        switch (event)
        {
        case 'close':
            this.m_browserWin.close();
            break;

        case 'maximize':
            this.m_browserWin.maximize();
            break;

        case 'restore':
            this.m_browserWin.restore();
            break;

        case 'minimize':
            this.m_browserWin.minimize();
            break;
        }
    }

    private closed(): void
    {
        this.dispose();
    }

    private restored(): void
    {
        this.m_frame.isMaximized = false;
    }

    private maximized(): void
    {
        this.m_frame.isMaximized = true;
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
