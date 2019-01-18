/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   A double linked list implementation.
 */
/* ================================================================================================================= */

import { Predicate, toPredicate, Reducer } from "./functional";

/* ================================================================================================================= */

class Node<T>
{
    public item: T;
    public prev: Node<T> = null;
    public next: Node<T> = null;
}

/* ================================================================================================================= */
/**
 * A double linked list container of elements.
 */
export class LinkedList<T> implements Iterable<T>
{
    private m_first: Node<T> = null;
    private m_last: Node<T> = null;
    private m_length: number = 0;

    private removeNode(node: Node<T>): void
    {
        if (node.prev != null)
            node.prev.next = node.next;
        else
            this.m_first = node.next;

        if (node.next != null)
            node.next.prev = node.prev;
        else
            this.m_last = node.prev;

        --this.m_length;
        node.next = node.prev = null;
    }

    /**
     * Gets the current size of the list in elements.
     */
    public get length(): number 
    {
         return this.m_length; 
    }

    /**
     * Removes all items from the list.
     *
     * @remarks Complexity: O(1)
     */
    public clear(): void
    {
        this.m_first = this.m_last = null;
        this.m_length = 0;
    }

    /**
     * Removes an item from the begining of the list.
     *
     * @remarks Complexity: O(1)
     */
    public shift(): T
    {
        let n = this.m_first;

        if (n)
        {
            this.removeNode(n);
            return n.item;
        }
    }

    /**
     * Adds an item to the begining of the list.
     *
     * @remarks Complexity: O(1)
     *
     * @param item The item to add
     */
    public unshift(item: T): void
    {
        let n = new Node<T>();
        n.item = item;

        n.next = this.m_first;

        if (n.next != null)
            n.next.prev = n;
        else
            this.m_last = n;

        this.m_first = n;
        ++this.m_length;
    }

    /**
     * Adds an item to the end of the list.
     *
     * @remarks Complexity: O(1)
     *
     * @param item The item to add.
     */
    public push(item: T): void
    {
        let n = new Node<T>();
        n.item = item;

        n.prev = this.m_last;

        if (n.prev != null)
            n.prev.next = n;
        else
            this.m_first = n;

        this.m_last = n;
        ++this.m_length;
    }

    /**
     * Removes an item from the end of the list.
     *
     * @remarks Complexity: O(1)
     */
    public pop(): T
    {
        let n = this.m_last;

        if (n)
        {
            this.removeNode(n);
            return n.item;
        }
    }

    /**
     * Returns true if any items in the list match the predicate.
     *
     * @remarks Complexity: O(n)
     *
     * @param predicate The predicate that matches against an item.
     */
    public some(predicate?: Predicate<T>): boolean
    {
        if (predicate == null)
            return this.m_length > 0;

        for (let i of this)
        {
            if (predicate(i))
                return true;
        }

        return false;
    }

    /**
     * Returns true of all items in the list match the predicate.
     *
     * @remarks Complexity: O(n)
     *
     * @param predicate The predicate that matches against an item.
     */
    public every(predicate: Predicate<T>): boolean
    {
        for (let i of this)
        {
            if (!predicate(i))
                return false;
        }

        return true;
    }

    /**
     * Removes an item or items that match a predicate from the list.
     *
     * @remarks Complexity: O(n)
     *
     * @param item The item or predicate that matches items to be removed.
     */
    public delete(item: T | Predicate<T>): void
    {
        let predicate: Predicate<T> = toPredicate(item);

        let n: Node<T>;

        for (let i = this.m_first; i && (n = i.next, true); i = n)
        {
            if (predicate(i.item))
                this.removeNode(i);
        }
    }

    /**
     * Returns items in the list that match the given predicate.
     *
     * @param predicate The predicate to match with.
     */
    public *filter(predicate: Predicate<T>): IterableIterator<T>
    {
        for (let i of this)
        {
            if (predicate(i))
                yield i;
        }
    }

    /**
     * Executes a function for all items in the list.
     *
     * This function is safe against removals while running.
     *
     * @remarks Complexity: O(n)
     *
     * @param callback The callback function to execute.
     */
    public forEach(callback: (x: T) => void): void
    {
        let n: Node<T>;

        for (let i = this.m_first; i && (n = i.next, true); i = n)
            callback(i.item);
    }

    /**
     * Executes a function for all items in the list in reverse order.
     *
     * This function is safe against removals while running.
     *
     * @remarks Complexity: O(n)
     *
     * @param callback The callback function to execute.
     */
    public forEachBackwards(callback: (x: T) => void): void
    {
        for (let i of this.backwards())
            callback(i);
    }

    /**
     * Converts the items in the list to another form.
     *
     * @remarks Complexity: O(n)
     *
     * @param callback The conversion callback to execute.
     */
    public *map<U>(callback: (x: T) => U): IterableIterator<U>
    {
        for (let item of this)
            yield callback(item);
    }

    /**
     * Executes a callback accumulating values from left to right.
     *
     * @param callback The callback to execute.
     * @param initial The initial value to start with
     */
    public reduce<TResult>(callback: Reducer<T, TResult>, initial?: TResult): TResult
    {
        let acc: TResult = initial;

        this.forEach(v => { acc = callback(acc, v); });

        return acc;
    }

    /**
     * Executes a callback accumulating values from right to left.
     *
     * @param callback The callback to execute.
     * @param initial The initial value to start with
     */
    public reduceRight<TResult>(callback: Reducer<T, TResult>, initial?: TResult): TResult
    {
        let acc: TResult = initial;

        this.forEachBackwards(v => { acc = callback(acc, v); });
        
        return acc;
    }

    /**
     * Returns an iterator that walks the list in reverse insert order.
     */
    public *backwards(): IterableIterator<T>
    {
        let p: Node<T>;

        for (let i = this.m_last; i && (p = i.prev, true); i = p)
            yield i.item;
    }

    [Symbol.iterator](): Iterator<T>
    {
        let current = this.m_first;

        return {
            next(): IteratorResult<T>
            {
                let rval = {
                    done: current == null,
                    value: current ? current.item : undefined
                };

                current = current ? current.next : null;

                return rval;
            }
        }
    }
}

/* ================================================================================================================= */
