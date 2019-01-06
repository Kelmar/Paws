/* ================================================================================================================= */
/* ================================================================================================================= */

export enum EventType
{
    // Keyboard
    KeyDown = 'keydown',
    KeyUp = 'keyup',
    KeyPress= 'keypress',

    // Mouse
    MouseUp = 'mouseup',
    MouseDown = 'mousedown',
    Click = 'click',
    DoubleClick = 'dblclick',
    MouseMove = 'mousemove',
    MouseEnter = 'mouseenter',
    MouseLeave = 'mouseleave',
    ContextMenu = 'contextmenu',
    Wheel = 'wheel',

    // Control events
    Change = 'change',
    Focus = 'focus',
    Blur = 'blur',

    // Document
    ContentLoaded = 'DOMContentLoaded',

    // Window events
    Load = 'load',
    Close = 'close'
}

/* ================================================================================================================= */
