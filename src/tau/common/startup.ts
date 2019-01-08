/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   Common startup for Tau front end and back end.
 */
/* ================================================================================================================= */

/**
 * Electron environment.
 */
export enum ElectronSupport
{
    /** Not running in electron. */
    None,

    /** Running in the main Electron process. */
    Main,

    /** Running in the render process of Electron. */
    Render
}

/* ================================================================================================================= */

/**
 * Extended information about the environment we're running in.
 */
export class EnvironmentInfo
{
    /** Set if running under NodeJS */
    public readonly isNode: boolean;

    /** Set if we should use a custom HTML based main menu, false to use the Electron built-in menus. */
    public readonly useCustomMenu: boolean;

    /** Which part of Electron we're running in. (None for browser or pure NodeJS server side) */
    public readonly electron: ElectronSupport;

    /** Primary modifier key for this platform.  (Usually 'Control' for most, 'Command' for Macs) */
    public readonly mainModKey: string;

    /** Secondary modifier key for this platform.  (Usually 'Alt') */
    public readonly secondModKey: string;

    constructor()
    {
        this.isNode = false;
        this.useCustomMenu = true;

        this.electron = ElectronSupport.None;

        this.mainModKey = 'Control';
        this.secondModKey = 'Alt';

        if (process)
        {
            // Running in NodeJS, see if we are main or renderer side of Electron.

            this.isNode = true;

            if (process.versions.electron)
                this.electron = (process.type == 'renderer') ? ElectronSupport.Render : ElectronSupport.Main;

            if (process.platform === 'darwin')
                this.mainModKey = 'Command';

            this.useCustomMenu = process.platform === 'win32';
        }
        else
        {
            // Running in a browser via a URL.
        }
    }
}

/* ================================================================================================================= */

module.exports.environmentInfo = new EnvironmentInfo();

/* ================================================================================================================= */
