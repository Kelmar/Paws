/* ================================================================================================================= */
/*
 * Description:
 * Quick and dirty wrapers around Mocha so we can use a class and decorators as our test fixtures.
 */
/* ================================================================================================================= */

require('reflect-metadata');

const { describe, it } = require('mocha');

const TEST_INFO: unique symbol = Symbol('test:info');

/* ================================================================================================================= */

interface Constructor<T>
{
    new (): T;
}

/* ================================================================================================================= */

class TestInfo
{
    private m_cases: any[];

    constructor (readonly name: string, readonly fn: Function)
    {
        this.m_cases = [];
    }

    public addCase(args: any[]): void
    {
        this.m_cases.push(args);
    }

    public run(fixture: any): void
    {
        if (this.m_cases.length == 0)
        {
            // Call once without any cases.
            it(this.name, () => this.fn.apply(fixture));
        }
        else
        {
            for (let i = 0; i < this.m_cases.length; ++i)
            {
                let args: any[] = this.m_cases[i];

                let str = args.toString();
                it(`${this.name}: ${str}`, () => this.fn.apply(fixture, args));
            }
        }
    }

    public get size(): number
    {
        return Math.max(1, this.m_cases.length);
    }
}

/* ================================================================================================================= */

class FixtureInfo
{
    public name: string;
    public fixtureCtor: Constructor<any>;

    public readonly tests: Map<string, TestInfo> = new Map<string, TestInfo>();

    public addTestCase(name: string, fn: Function, ...args: any[])
    {
        let testInfo = this.tests.get(name);

        if (testInfo == null)
        {
            testInfo = new TestInfo(name, fn);
            this.tests.set(name, testInfo);
        }

        if (args.length > 0)
            testInfo.addCase(args);
    }

    public run(): void
    {
        let fixture = new this.fixtureCtor();
        this.tests.forEach((test, name) => describe(name, () => test.run(fixture)));
    }

    public get count(): number
    {
        let acc = 0;
        this.tests.forEach(x => acc += x.size);
        return acc;
    }
}

/* ================================================================================================================= */

let g_fixtures: FixtureInfo[] = [];

/* ================================================================================================================= */

export function testFixture(description?: string): (target: any, ...args: any[]) => void
{
    return function(target: Constructor<any>, ...args: any[]): void 
    {
        let info: FixtureInfo = Reflect.getOwnMetadata(TEST_INFO, target.prototype);

        if (info != null)
        {
            info.name = description || target.name;
            info.fixtureCtor = target;

            let testCount = info.count;

            if (testCount > 0)
            {
                //console.debug(`Adding ${testCount} ${info.name} test(s)...`);
                g_fixtures.push(info);
            }
            else
                console.info(`${info.name} test fixture has no tests, skipping`);
        }
    }
}

/* ================================================================================================================= */

export function test(target: any, key: string, descriptor: PropertyDescriptor): void
{
    let info: FixtureInfo = Reflect.getOwnMetadata(TEST_INFO, target);
    
    if (info == null)
        info = new FixtureInfo();

    info.addTestCase(key, descriptor.value);
    Reflect.defineMetadata(TEST_INFO, info, target);
}

/* ================================================================================================================= */

export function testCase(...args: any[]): (target: any, key: string | symbol, descriptor: PropertyDescriptor) => void
{
    return function(target: any, key: string, descriptor: PropertyDescriptor): void
    {
        let info: FixtureInfo = Reflect.getOwnMetadata(TEST_INFO, target);
    
        if (info == null)
            info = new FixtureInfo();

        info.addTestCase(key, descriptor.value, ...args);
        Reflect.defineMetadata(TEST_INFO, info, target);
    }
}

/* ================================================================================================================= */

export function runAllTests()
{
    g_fixtures.forEach(info => describe(info.name, () => info.run()));
}

/* ================================================================================================================= */
