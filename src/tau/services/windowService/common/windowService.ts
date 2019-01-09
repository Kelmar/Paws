/* ================================================================================================================= */
/* ================================================================================================================= */

export type WindowID = number;

export enum FrameType
{
    /** Use the default frame type. */
    Default = -1,

    /** Do not create a frame of any sort. */
    None = 0,

    /** Use the native OS frame if available. */
    Native = 1,

    /** Use a custom HTML frame if avilable. */
    Custom = 2
}

export interface WindowOpenOptions
{
    frameType?: FrameType;
    showDevTools?: boolean;
}

export interface IWindowService
{
    open(indexFile: string, mainFile: string, options?: WindowOpenOptions): WindowID;
    close(window: WindowID): void;
}

/* ================================================================================================================= */
