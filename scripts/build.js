const gulp = require('gulp');

const DIST_DIR = 'dist';

const { series, parallel } = gulp;
const { src, dest } = gulp;
const { promisify } = require('util');

const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');

const path = require('path');
const fs = require('fs');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

function makeDistDir()
{
    let fullName = path.join('./', DIST_DIR);

    return exists(fullName)
        .then(found => found ? Promise.resolve() : mkdir(fullName));
}

function copy_webfonts()
{
    return src(
        'node_modules/material-design-icons/iconfont/*.+(eot|woff|woff2|ttf)',
        { sense: gulp.lastRun(copy_webfonts) }
    ).pipe(dest(DIST_DIR + '/webfonts'));
}

function copy_resources()
{
    return src(
        ['src/**/*', '!src/less', '!src/less/**/*', '!src/**/*.less', '!src/**/*.ts'],
        { sense: gulp.lastRun(copy_resources) }
    ).pipe(dest(DIST_DIR));
}

var copy_static = parallel(copy_webfonts, copy_resources);

function less_build()
{
    return src('src/tau/ui/less/tau.less')
        .pipe(less({
            paths: [ 'src/less', 'node_modules/@fortawesome' ]
        }))
        .pipe(concat('css/style.css'))
        .pipe(cleanCSS({ level: 2, format: 'beautify' }))
        .pipe(dest(DIST_DIR))
};

function tsc_build()
{
    let project = tsc.createProject('tsconfig.json');

    return src('src/**/*.ts', { sense: gulp.lastRun(tsc_build) })
        .pipe(sourcemaps.init())
        .pipe(project())
        .js
        .pipe(sourcemaps.write({
            // Return relative source map root directories per file.
            sourceRoot: function (file) {
                var sourceFile = path.join(file.cwd, file.sourceMap.file);
                return path.relative(path.dirname(sourceFile), file.cwd);
            }
        }))
        .pipe(dest(DIST_DIR));
}

gulp.task('build', series(makeDistDir, copy_static, tsc_build, less_build));
