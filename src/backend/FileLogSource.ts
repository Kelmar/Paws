/* ================================================================================================================= */

import * as fs from 'fs';

import { pipeline } from 'stream';

const es = require('event-stream');
const chokidar = require('chokidar');

import { Observable, Observer } from "rxjs";

import * as LogSource from './LogSource';

/* ================================================================================================================= */
/**
 * Internal processing state of a file log source.
 */
class FileWatchState
{
    public sourceUrl: URL;
    public lastRead : number;
    public stream   : fs.ReadStream;

    /**
     * We use a timeout to prevent locks on the filehandle from other processes.
     * 
     * This is particuarly useful when we fully expect the file to get written to by some other program.
     */
    public timer    : any;

    constructor (readonly options: FileLogSourceOptions, readonly observer: Observer<LogSource.Event>)
    {
        this.sourceUrl = new URL("file://" + options.filename);
        this.lastRead = 0;

        this.stream = null;
        this.timer  = null;
    }

    public sendEvent(type: LogSource.EventType, message?: any)
    {
        this.observer.next({ type: type, source: this.sourceUrl, message: message });
    }
}

/* ================================================================================================================= */
/**
 * Monitors a file for changes and generates events when new lines are added to the file.
 */
export default class FileLogSource implements LogSource.ILogSource
{
    public open(options: FileLogSourceOptions): Observable<LogSource.Event>
    {
        let defaultOptions = new FileLogSourceOptions();

        return Observable.create((observer: Observer<LogSource.Event>) =>
        {
            options = Object.assign(defaultOptions, options);
            options.filename = options.filename || "";

            if (options.filename.trim() == "")
            {
                throw new Error("No file name supplied for FileLogSource.open()");
            }

            let state = new FileWatchState(options, observer);

            let watcher = chokidar.watch(state.options.filename);

            watcher.on('add'   , () => this.handleAdd   (state));
            watcher.on('change', () => this.handleChange(state));
            watcher.on('unlink', () => this.handleUnlink(state));
        });
    }

    private updateTask(state: FileWatchState)
    {
        state.stream = fs.createReadStream(state.options.filename, { start: state.lastRead, encoding: state.options.encoding });
  
        state.stream.on('error', (e: any) => state.sendEvent(LogSource.EventType.Error, e.toString()));
        state.stream.on('data', (chunk: Buffer) => state.lastRead += chunk.length);

        pipeline(
            state.stream,
            es.split(),
            es.mapSync((line: string) => state.sendEvent(LogSource.EventType.NewLine, line)),
            es.wait(() =>
            {
                state.stream = null;
                state.timer = null;
            })
        );
    }

    private dumpUpdate(state: FileWatchState)
    {
        if (state.timer == null)
        {
            // TODO: Should we randomize the timeout value at all?

            state.timer = setTimeout(() => this.updateTask(state), 100);
        }
    }

    private handleAdd(state: FileWatchState)
    {
        if (state.lastRead > 0)
        {
            state.lastRead = 0;
            state.sendEvent(LogSource.EventType.Truncated);
        }
        else
        {
            state.sendEvent(LogSource.EventType.Opened);
        }

        this.dumpUpdate(state);
    }

    private handleChange(state: FileWatchState)
    {
        this.dumpUpdate(state);
    }

    private handleUnlink(state: FileWatchState)
    {
        state.sendEvent(LogSource.EventType.Closed);
    }
}

/* ================================================================================================================= */
/**
 * Options for the FileLogSource
 */
export class FileLogSourceOptions
{
    /**
     * The file name to watch.
     * 
     * This is required.
     */
    public filename: string;

    /**
     * The character encoding for the file.
     * 
     * Optional, defaults to "utf8"
     */
    public encoding: string = "utf8";
}

/* ================================================================================================================= */
