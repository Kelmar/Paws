'use strict';

const DIST_DIR = 'dist';

const gulp = require('gulp');

const { series } = gulp;
const { src } = gulp;

const { delTree } = require('./scripts/deltree');

const mocha = require('gulp-mocha');

require('./scripts/build');

function clean()
{
    return delTree('./' + DIST_DIR);
}

function run_tests()
{
    return src(DIST_DIR + '/tests/index.js', {read: false})
        .pipe(mocha({ reporter: 'nyan' }));
}

exports.clean = clean;
//exports.rebuild = series(clean, build);
//exports.test = series(build, run_tests);
//exports.default = build;
