/* ================================================================================================================= */

import { Observable } from "rxjs";

/* ================================================================================================================= */

interface StringDictionary
{
    [key: string]: any;
}

/* ================================================================================================================= */
/**
 * Describes the type of event that was received from a LogSource.
 */
export enum EventType
{
    /**
     * The log is being watched for changes.
     */
    Opened,

    /**
     * The log was closed.
     * 
     * This is usually due to the file being deleted or the log file being rotated.
     */
    Closed,

    /**
     * Internal error from the ILogSource object itself.
     */
    Error,

    /**
     * A new log line has been added to the log.
     * 
     * Message will contain the new line.
     */
    NewLine,

    /**
     * The log has been truncated.
     */
    Truncated
}

/* ================================================================================================================= */
/**
 * The details of an event from a LogSource
 */
export class Event
{
    /**
     * Programatic details of the event type.
     * 
     * Opened, closed, etc.
     */
    public type: EventType;

    /**
     * The identifier for the source in URL form.
     */
    public source: URL;

    /**
     * The log message.
     * 
     * Only valid for NewLine types
     */
    public message: any;
}

/* ================================================================================================================= */
/**
 * Generates events from a source.
 */
export interface ILogSource
{
    open(options: any): Observable<Event>;
}

/* ================================================================================================================= */
