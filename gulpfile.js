'use strict';

const DIST_DIR = 'dist';

const { series, parallel } = require('gulp');
const { src, dest, pipe } = require('gulp');
const { promisify } = require('util');
const { delTree } = require('./scripts/deltree');

const tsc = require('gulp-typescript');
const path = require('path');
const fs = require('fs');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

function clean()
{
    return delTree('./' + DIST_DIR);
}

function makeDistDir()
{
    let fullName = path.join('./', DIST_DIR);

    return exists(fullName)
        .then(found => found ? Promise.resolve() : mkdir(fullName));
}

function copyResources()
{
    return src(['src/**/*', '!src/**/*.ts'])
        .pipe(dest(DIST_DIR));
}

function compile()
{
    let project = tsc.createProject('tsconfig.json');

    return project
        .src()
        .pipe(project())
        .js.pipe(dest(DIST_DIR));
}

var build = series(makeDistDir, parallel(copyResources, compile))

exports.clean = clean;
exports.build = build;
exports.rebuild = series(clean, build);
exports.default = build;
