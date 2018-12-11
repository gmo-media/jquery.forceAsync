/* global require */

var pkg   = require('./package.json'),
    gulp  = require('gulp'),
    $     = require('gulp-load-plugins')(),
    del   = require('del');

var jshint_options = require('jshint/src/cli').loadConfig('.jshintrc');
delete jshint_options.dirname;

$.banner = function() {
    return $.header([
        '/**',
        ' * <%= pkg.title %> v<%= pkg.version %>',
        ' * <%= pkg.homepage %>',
        ' *',
        ' * Copyright 2014 <%= pkg.author.name %>',
        ' * Released under the MIT license',
        ' * <%= pkg.homepage %>/blob/master/LICENSE',
        ' *',
        ' * Date: <%= $.util.date("isoUtcDateTime") %>',
        ' */',
        ''].join('\n'),
        { 'pkg': pkg, '$': $ }
    );
};

$.minBanner = function() {
    return $.header([
        '/*!',
        ' * <%= pkg.title %> v<%= pkg.version %>',
        ' * (c) 2014 <%= pkg.author.name %>',
        ' * MIT license',
        ' */',
        ''].join('\n'),
        { 'pkg': pkg, '$': $ }
    );
};

$.enableDebug = function() {
    return $.replace(
        /^\/\*\s*(?:DEBUG|END).*?\*\/\n/gm, ''
    );
};

$.disableDebug = function() {
    return $.replace(
        /^\/\*\s*DEBUG.*?\*\/[\s\S]*?^\/\*\s*END.*?\*\/\n/gm, ''
    );
};

gulp.task('default', gulp.parallel(
    function watchJs() {
        return gulp.watch('src/forceAsync.js', jshint);
    },
    function watchHtml() {
        return gulp.watch('src/forceAsync.html', htmlhint);
    }
));

function clean() {
    return del('dist/*');
}
gulp.task(clean);

gulp.task('build', gulp.series(
    clean,
    gulp.parallel(
        // make debug.js
        function buildDebugJs() {
            return gulp.src('src/forceAsync.js')
                .pipe($.rename({basename: pkg.name, suffix: '.debug'}))
                .pipe($.banner())
                .pipe($.enableDebug())
                .pipe(gulp.dest('dist'));
        },
        // make js & min.js & source map
        function buildJs() {
            return gulp.src('src/forceAsync.js')
                .pipe($.rename({basename: pkg.name}))
                .pipe($.banner())
                .pipe($.disableDebug())
                .pipe(gulp.dest('dist'))
                .pipe($.rename({suffix: '.min'}))
                .pipe($.uglify())
                .pipe($.minBanner())
                .pipe(gulp.dest('dist'));
        },
        // make html
        function buildHtml() {
            return gulp.src('src/forceAsync.html')
                .pipe($.htmlmin({
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeOptionalTags: true,
                    minifyJS: true
                }))
                .pipe(gulp.dest('dist'));
        }
    )
));

function jshint() {
    return gulp.src('src/forceAsync.js')
        .pipe($.jshint(jshint_options))
        .pipe($.jshint.reporter('jshint-stylish'));
}
gulp.task(jshint);

function htmlhint() {
    return gulp.src('src/forceAsync.html')
        .pipe($.htmlhint({jshint: jshint_options}))
        .pipe($.htmlhint.reporter());
}
gulp.task(htmlhint);

gulp.task('lint', gulp.parallel(jshint, htmlhint));
