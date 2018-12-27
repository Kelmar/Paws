/* ================================================================================================================= */
/* ================================================================================================================= */

const assert = require('assert');

import { testFixture, test, testCase, runAllTests } from './decorators';
import { using, Lifetime, IDisposable } from '../lepton';
import { Container } from '../lepton/container';

/* ================================================================================================================= */

const IFoo: unique symbol = Symbol('scope:IFoo');

@testFixture("scope")
class ScopeTests
{
    @test
    public disposesOfChildren()
    {
        let disposed: boolean = false;

        class Foo implements IDisposable
        {
            public dispose()
            {
                console.log("Disposing of Foo object.");
                disposed = true;
            }
        }

        let c = new Container();
        c.register(IFoo).to(Foo).with(Lifetime.Scoped);

        using (c.beginScope(), scope =>
        {
            let f: Foo = scope.resolve(IFoo);
        });

        assert.ok(disposed, "dispose() was not called.");
    }
}

/* ================================================================================================================= */
