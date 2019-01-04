/* ================================================================================================================= */
/* ================================================================================================================= */

import { Writable } from 'stream';

import { IDisposable } from 'lepton-di';

/* ================================================================================================================= */

export interface ICodeOutput extends IDisposable
{
    write(text: string): void;
}

/* ================================================================================================================= */

export class ConsoleOutput implements ICodeOutput
{
    constructor()
    {
    }

    public dispose()
    {
    }

    public write(text: string): void
    {
        console.log(text);
    }
}

/* ================================================================================================================= */

export class StringOutput implements ICodeOutput
{
    private buffer: string[] = [];

    constructor()
    {
    }

    public dispose()
    {
        this.buffer = [];
    }

    public write(text: string): void
    {
        this.buffer.push(text);
    }

    public toString()
    {
        return this.buffer.join('\r\n');
    }
}

/* ================================================================================================================= */

export class StreamOutput implements ICodeOutput
{
    constructor(private stream: Writable)
    {
    }

    public dispose()
    {
        let s = this.stream;
        this.stream = null;

        s.end(() => {
            s.destroy();
            s = null;
        });
    }

    public write(text: string): void
    {
        this.stream.write(text);
    }
}

/* ================================================================================================================= */
