/* ================================================================================================================= */
/* ================================================================================================================= */

export enum ModelEventType
{
    // Object events

    /**
     * A call to notify() was made.
     *
     * Used to update all properties/items on a model.
     */
    Ping,

    /**
     * A specific property was changed.
     */
    Changed,

    // Collection events

    /**
     * An item was added to the collection.
     */
    Added,

    /**
     * The entire collection was cleared.
     */
    Cleared,

    /**
     * An item was removed from the collection.
     */
    Deleted
}

/* ================================================================================================================= */

export class ModelEvent
{
    constructor (readonly type: ModelEventType, readonly property?: any, readonly value?: any)
    {
    }
}

/* ================================================================================================================= */
