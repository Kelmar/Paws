const assert = require('assert');

import { testFixture, test, testCase, runAllTests } from './decorators';

@testFixture()
class ArrayTests
{
    @testCase(4)
    @testCase(5)
    @test
    public myTest(value: number): void
    {
        assert.equal([1,2,3].indexOf(value), -1);
    }
}

runAllTests();
