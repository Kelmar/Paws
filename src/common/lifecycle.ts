export default interface IDisposable
{
    dispose(): void;
}

export function using(item: IDisposable, fn: (item: IDisposable) => void): void
{
    try
    {
        fn(item);
    }
    finally
    {
        if (item != null)
            item.dispose();
    }
}