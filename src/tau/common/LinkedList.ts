/* ================================================================================================================= */
/* ================================================================================================================= */

import { Predicate, toPredicate } from "./functional";

/* ================================================================================================================= */

class Node<T>
{
    public item: T;
    public prev: Node<T> = null;
    public next: Node<T> = null;
}

/* ================================================================================================================= */

export class LinkedList<T> implements Iterable<T>
{
    private m_first: Node<T> = null;
    private m_last: Node<T> = null;
    private m_length: 0;

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

    public get length(): number 
    {
         return this.m_length; 
    }

    public clear()
    {
        this.m_first = this.m_last = null;
        this.m_length = 0;
    }

    public shift(): T
    {
        let n = this.m_first;

        if (n)
        {
            this.removeNode(n);
            return n.item;
        }
    }

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

    public pop(): T
    {
        let n = this.m_last;

        if (n)
        {
            this.removeNode(n);
            return n.item;
        }
    }

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

    public every(predicate: Predicate<T>): boolean
    {
        for (let i of this)
        {
            if (!predicate(i))
                return false;
        }

        return true;
    }

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

    public forEach(cb: (x: T) => void): void
    {
        let n: Node<T>;

        for (let i = this.m_first; i && (n = i.next, true); i = n)
            cb(i.item);
    }

    public *map<U>(cb: (x: T) => U): IterableIterator<U>
    {
        for (let item of this)
            yield cb(item);
    }

    [Symbol.iterator](): Iterator<T>
    {
        let current = this.m_first;

        return {
            next: () =>
            {
                let rval = {
                    done: current == null,
                    value: current ? current.item : undefined
                }

                current = current ? current.next : null;

                return rval;
            }
        }
    }
}

/* ================================================================================================================= */
