/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import { ILogSource, EventType, Event } from "./common";

import { ILogTarget, LogMessage } from "../../tau/common/logging";

/* ================================================================================================================= */

const INTERNAL_SOURCE: URL = new URL("self:internal");

function eventOf(type: EventType, message?: any): Event
{
    return { type: type, source: INTERNAL_SOURCE, message: message };
}

/* ================================================================================================================= */
/**
 * Generates log events from our own internal logger.
 */
export default class InternalLogSource implements ILogSource, ILogTarget
{
    private m_subject: Subject<Event>;

    constructor()
    {
        this.m_subject = new Subject<Event>();
    }

    public get event$(): Observable<Event>
    {
        return this.m_subject;
    }

    public write(message: LogMessage): void
    {
        this.m_subject.next(eventOf(EventType.NewLine, message))
    }
}

/* ================================================================================================================= */
