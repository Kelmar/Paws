/* ================================================================================================================= */
/* ================================================================================================================= */

declare global
{
    interface String
    {
        formatPegasus<T>(properties: T): string;
        escapeJS(): string;
        escapeHTML(): string;
    }
}

/* ================================================================================================================= */

function formatNumber(value: number, padding: number, options: string[]): string
{
    let format: string = options.shift() || "";
    let padChar: string = ' ';

    if (format.startsWith('0'))
    {
        padChar = '0';
        format = format.substr(1);
    }

    let prec = parseInt(format);
    let strVal: string = prec !== NaN ? value.toFixed(prec) : value.toFixed();

    if (padding != 0)
    {
        if (padding > 0)
            strVal = strVal.padStart(padding, padChar);
        else
            strVal = strVal.padEnd(-padding, padChar);
    }

    return strVal;
}

/* ================================================================================================================= */

function parseFormat(format: string): [string, number, string[]]
{
    let parts = format.split(':', 2);
    let options = parts.length > 1 ? parts[1] : "";
    let padding: number = 0;

    parts = parts[0].split(',', 2);

    if (parts.length > 1)
        padding = parseInt(parts[1]);

    return [parts[0], padding, options.split(',')];
}

/* ================================================================================================================= */

function formatPegasus<T>(properties: T): string
{
    return this.replace(/{(.*?)}/g, ({}, match: string) =>
    {
        let [name, padding, options] = parseFormat(match);
        let value: any = (properties as any)[name];

        if (value === null)
            value = "";

        switch (typeof value)
        {
        case "undefined":
            value = `'undefined:${name}'`;
            break;

        case "number":
            return formatNumber(value, padding, options);

        case "string":
            break;

        case "object":
            if (typeof value["toString"] === "function")
            {
                value = value.toString(...options);
                break;
            }

            // Fall through to default case if toString isn't a function.

        default:
            value = '' + value;
            break;
        }

        if (padding != 0)
            value = padding > 0 ? value.padStart(padding, ' ') : value.padEnd(-padding, ' ');

        return value;
    });
}

/* ================================================================================================================= */

function escapeJS(): string
{
    return this
        .replace('\\', '\\\\')
        .replace("'", "\\'")
        .replace('"', '\\"')
        .replace('`', '\\`')
    ;
}

/* ================================================================================================================= */

function escapeHTML(): string
{
    return this
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace("'", '&apos;')
        .replace('"', '&quot;')
    ;
}

/* ================================================================================================================= */

String.prototype.formatPegasus = formatPegasus;
String.prototype.escapeJS = escapeJS;
String.prototype.escapeHTML = escapeHTML;

/* ================================================================================================================= */

export {}

/* ================================================================================================================= */
