/* ================================================================================================================= */
/* ================================================================================================================= */

import { ENVIRONMENT_INFO, ElectronSupport } from '../common/startup';

/* ================================================================================================================= */
/**
 * Defines where a service runs locallay.
 * 
 * This is used by the ServiceManager to figure out if it needs to send a service request to a remote endpoint or
 * to use a local endpoint.
 */
export enum ServiceTarget
{
    /** Service can run server side. */
    Server   = 0x01,

    /** Service can run on a browser */
    Browser  = 0x02,

    /** Service can run on any Electron main process. */
    Main     = 0x04,

    /** Service can run on an Electron renderer process. */
    Renderer = 0x08,

    /** Service can run on any target. */
    Any      = 0xFF
}

/* ================================================================================================================= */
/**
 * Indicates the current level of service support for this script.
 */
export const SERVICE_TARGET: ServiceTarget = (() =>
{
    if (!ENVIRONMENT_INFO.isNode)
        return ServiceTarget.Browser;

    switch (ENVIRONMENT_INFO.electron)
    {
    case ElectronSupport.Main:
        return ServiceTarget.Main;

    case ElectronSupport.Render:
        return ServiceTarget.Renderer;

    case ElectronSupport.None:
    default:
        return ServiceTarget.Server;
    }
})();

/* ================================================================================================================= */
