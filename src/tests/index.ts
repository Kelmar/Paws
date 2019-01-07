const assert = require('assert');

import { runAllTests } from './decorators';

import './injection_tests';
import './scope_tests';

/*
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
*/

runAllTests();
