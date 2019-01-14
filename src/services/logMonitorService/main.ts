/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import { IDisposable } from "lepton-di";

import { promiseWrap } from "../../tau/common";
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
            next: e  => this.processEvent(source, e),
            complete: () =>
            {
                this.processEvent(source, { type: LogEventType.Closed, source: source.name.href });
                source = null;
            },
            error: e  =>
            {
                this.processEvent(source, { type: LogEventType.Error, source: source.name.href, message: e });
                source = null;
            }
        });
    }

    @endpoint
    public open(sourceName: string): Promise<void>
    {
        return promiseWrap(() => this.openUnguarded(sourceName));
    }

    private openUnguarded(sourceName: string): void
    {
        let resolved: URL = new URL(sourceName);

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
    }

    private processEvent(source: ILogSource, logEvent: LogEvent): void
    {
        if (!source)
            return;

        if (logEvent.message)
        {
            // Perform some voodoo on the message.
            try
            {
                let obj = JSON.parse(logEvent.message);

                if (obj)
                    logEvent.message = obj;
            }
            catch
            {
                // Ignore errors
            }
        }

        this.m_subject.next(logEvent);
    }

    @event
    public get event$(): Observable<LogEvent>
    {
        return this.m_subject;
    }
}

/* ================================================================================================================= */
