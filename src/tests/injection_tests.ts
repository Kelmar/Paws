/* ================================================================================================================= */
/* ================================================================================================================= */

const assert = require('assert');

import { testFixture, test, testCase, runAllTests } from './decorators';
import { inject } from '../lepton';
import { Container } from '../lepton/container';
import { isTypeOf } from './utils';

/* ================================================================================================================= */

const IBar: unique symbol = Symbol("IBar");

class Bar
{
}

/* ================================================================================================================= */

@testFixture("injection")
export class InjectTests
{
    @test
    public injectsOnNew()
    {
        class Foo
        {
            constructor(@inject(IBar) public bar: Bar)
            {
            }
        }

        let c = new Container();
        c.register(IBar).to(Bar);

        let f = c.resolve(Foo);

        assert.ok(f.bar);
        assert.ok(isTypeOf(f.bar, Bar));
    }

    @test
    public injectsProperties()
    {
        class Foo
        {
            @inject(IBar)
            private bar: Bar;

            public test()
            {
                assert.ok(this.bar);
                assert.ok(isTypeOf(this.bar, Bar));
            }
        }

        let c = new Container();
        c.register(IBar).to(Bar);

        let f = c.resolve(Foo);
        f.test();
    }
}

/* ================================================================================================================= */
