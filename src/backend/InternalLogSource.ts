/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import * as LogSource from './logSource';

import { ILogTarget, LogMessage } from "../tau/common/logging";

/* ================================================================================================================= */

const INTERNAL_SOURCE: URL = new URL("self:internal");

function eventOf(type: LogSource.EventType, message?: any): LogSource.Event
{
    return { type: type, source: INTERNAL_SOURCE, message: message };
}

/* ================================================================================================================= */
/**
 * Generates log events from our own internal logger.
 */
export default class InternalLogSource implements LogSource.ILogSource, ILogTarget
{
    private m_subject: Subject<LogSource.Event>;

    constructor()
    {
        this.m_subject = new Subject<LogSource.Event>();
    }

    public open(options: any): Observable<LogSource.Event>
    {
        return this.m_subject;
    }

    public write(message: LogMessage): void
    {
        this.m_subject.next(eventOf(LogSource.EventType.NewLine, message))
    }
}

/* ================================================================================================================= */
