/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import { IDisposable } from "lepton-di";

import { endpoint, event, service, ServiceTarget } from "../../tau/services";

import { ILogMonitor, LogEvent, LogEventType } from "./common";

import { ILogSource, UdpSource } from "./sources";
import FileSource from "./sources/fileSource";

/* ================================================================================================================= */

@service(ILogMonitor, ServiceTarget.Main)
export class MainLogMonitor implements ILogMonitor, IDisposable
{
    private m_subject: Subject<LogEvent>;

    private m_sources: Map<URL, ILogSource> = new Map();

    constructor ()
    {
        this.m_subject = new Subject();
    }

    public dispose()
    {
        if (this.m_subject)
        {
            this.m_subject.complete();
            this.m_subject = null;
        }
    }

    private connectSource(source: ILogSource): void
    {
        source.event$.subscribe({
            next    : e  => this.m_subject.next(e),
            complete: () => this.m_subject.next({ type: LogEventType.Closed, source: source.name.href }),
            error   : e  => this.m_subject.next({ type: LogEventType.Error, source: source.name.href, message: e })
        });
    }

    @endpoint
    public open(sourceName: string): Promise<void>
    {
        let resolved: URL;

        try
        {
            resolved = new URL(sourceName);
        }
        catch (e)
        {
            return Promise.reject(e);
        }

        let source = this.m_sources.get(resolved);

        if (!source)
        {
            switch (resolved.protocol.replace(/:$/, ''))
            {
            case "file":
                source = new FileSource(resolved);
                break;

            case "udp4":
            case "udp6":
                source = new UdpSource(resolved);
                break;

            default:
                throw new Error(`Unknown protocol for URL: ${sourceName}`);
            }

            this.m_sources.set(resolved, source);
            this.connectSource(source);
        }

        return Promise.resolve();
    }

    @event
    public get event$(): Observable<LogEvent>
    {
        return this.m_subject;
    }
}

/* ================================================================================================================= */
