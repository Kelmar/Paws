export enum Level
{
    All     = 0,
    Verbose = 1,
    Trace   = 2,
    Debug   = 3,
    Info    = 4,
    Warn    = 5,
    Warning = 5,
    Error   = 6,
    Fatal   = 7
}

export interface ILogger
{
    isEnabled(level: Level): boolean;

    write(level: Level, msg: any, ...args: any[]): void;

    verbose(msg: any, ...args: any[]): void;
    trace  (msg: any, ...args: any[]): void;
    debug  (msg: any, ...args: any[]): void;
    info   (msg: any, ...args: any[]): void;
    warn   (msg: any, ...args: any[]): void;
    error  (msg: any, ...args: any[]): void;
    fatal  (msg: any, ...args: any[]): void;
}

class ConsoleLogger implements ILogger
{
    isEnabled(level: Level): boolean { return true; }

    write(level: Level, msg: any, ...args: any[]): void
    {
        switch (level)
        {
        case Level.Verbose: console.trace('VERBOSE: ' + msg, ...args); break;
        case Level.Trace  : console.trace(msg, ...args); break;
        case Level.Debug  : console.debug(msg, ...args); break;
        case Level.Info   : console.info (msg, ...args); break;
        case Level.Warn   : console.warn (msg, ...args); break;
        case Level.Error  : console.error(msg, ...args); break;
        case Level.Fatal  : console.error('FATAL: ' + msg, ...args); break;
        }
    }

    verbose(msg: any, ...args: any[]): void { this.write(Level.Verbose, msg, ...args); }
    trace  (msg: any, ...args: any[]): void { this.write(Level.Trace  , msg, ...args); }
    debug  (msg: any, ...args: any[]): void { this.write(Level.Debug  , msg, ...args); }
    info   (msg: any, ...args: any[]): void { this.write(Level.Info   , msg, ...args); }
    warn   (msg: any, ...args: any[]): void { this.write(Level.Warn   , msg, ...args); }
    error  (msg: any, ...args: any[]): void { this.write(Level.Error  , msg, ...args); }
    fatal  (msg: any, ...args: any[]): void { this.write(Level.Fatal  , msg, ...args); }
}

export module LogManager
{
    export function getLogger(loggerName: string): ILogger
    {
        return new ConsoleLogger();
    }
}
