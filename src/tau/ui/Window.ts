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
}

/* ================================================================================================================= */
