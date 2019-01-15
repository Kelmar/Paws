/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   String extension functions.
 */
/* ================================================================================================================= */

import * as moment from "moment";

import { isNumber } from "util";

/* ================================================================================================================= */

declare global
{
    interface String
    {
        formatPegasus(...args: any[]): string;
        escapeJS(): string;
        escapeHTML(): string;
    }

    interface Symbol
    {
        toString(): string;
    }
}

/* ================================================================================================================= */

function formatDate(value: Date, options: string[]): string
{
    return moment(value).format(...options);
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

    if (padding > 0)
        strVal = strVal.padStart(padding, padChar);

    return strVal;
}

/* ================================================================================================================= */

/**
 * Splits a format item up into it's specific parts.
 *
 * Format is {(index|name|index#name)[,padding][:arg1,arg2,...argN]}
 *
 * index is a numerical index of the argument to fetch.
 *
 * name is the name on the given object to use for the formatting.
 * If no name is given, the whole object is used.
 *
 * padding is the amount of padding to add to the item after other formatting options are done.
 * Negative values will pad to the right of the item.
 *
 * arg1, arg2,...argN are extra arguments to pass the toString() function on an object.
 * For numbers, the first argument can be used to specify a zero pad.
 * 
 * @example "Hi {there}".formatPegasus({ there: 'World!' }); // Output: Hi World!
 * @example "Multiple {name} {1#foo}".formatPegasus({ name: "items" }, { foo: "in one" }); // Output: Multiple items in one
 * @example "The cost is ${0,2:02}".formatPegasus(5.45); // Output: The cost is $05.45
 *
 * @param format Format item to parse
 */
function parseFormat(format: string): [string, string, number, string[]]
{
    let parts = format.split(':', 2);
    let options = parts.length > 1 ? parts[1] : "";
    let padding: number = 0;
    let index: string = '';

    parts = parts[0].split(',', 2);

    if (parts.length > 1)
        padding = parseInt(parts[1]);

    parts = parts[0].split('#');

    if (parts.length > 1)
        index = parts.shift();

    return [index, parts[0], padding, options.split(',')];
}

/* ================================================================================================================= */

function formatPegasus(...args: any[]): string
{
    let lastIndex: number = 0;

    return this.replace(/{(.*?)}/g, ({}, match: string) =>
    {
        let [n1, n2, padding, options] = parseFormat(match);
        let value: any;

        if (isNumber(n1))
        {
            let index = parseInt(n1);
            lastIndex = index;

            value = args[index][n2];
        }
        else if (isNumber(n2))
        {
            let index = parseInt(n2);
            lastIndex = index;

            value = args[index];
        }
        else
            value = args[lastIndex][n2];

        if (value === null)
            value = "";

        switch (typeof value)
        {
        case "undefined":
            value = `'undefined:${n2}'`;
            break;

        case "number":
            return formatNumber(value, padding, options);

        case "string":
            break;

        case "symbol":
            value = value.toString();
            break;

        case "object":
            if (value instanceof Date)
            {
                value = formatDate(value, options);
                break;
            }
            else if (typeof value["toString"] === "function")
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

const oldSymbolToString = Symbol.prototype.toString;

Symbol.prototype.toString = function()
{
    return oldSymbolToString.apply(this).replace(/^Symbol/, '#');
}

/* ================================================================================================================= */

export {}

/* ================================================================================================================= */
