/* global require */

var pkg   = require('./package.json'),
    gulp  = require('gulp'),
    $     = require('gulp-load-plugins')(),
    merge = require('event-stream').merge,
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

gulp.task('default', function() {
    gulp.watch('src/forceAsync.js',   ['jshint']);
    gulp.watch('src/forceAsync.html', ['htmlhint']);
});

gulp.task('clean', function() {
    return del('dist/*');
});

gulp.task('build', ['clean'], function() {
    return merge(
        // make debug.js
        gulp.src('src/forceAsync.js')
            .pipe($.rename({basename: pkg.name, suffix: '.debug'}))
            .pipe($.banner())
            .pipe($.enableDebug())
            .pipe(gulp.dest('dist')),
        // make js & min.js & source map
        gulp.src('src/forceAsync.js')
            .pipe($.rename({basename: pkg.name}))
            .pipe($.banner())
            .pipe($.disableDebug())
            .pipe(gulp.dest('dist'))
            .pipe($.rename({suffix: '.min'}))
            .pipe($.uglify())
            .pipe($.minBanner())
            .pipe(gulp.dest('dist')),
        // make html
        gulp.src('src/forceAsync.html')
            .pipe($.htmlmin({
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeOptionalTags: true,
                minifyJS: true
            }))
            .pipe(gulp.dest('dist'))
    );
});

gulp.task('jshint', function() {
    return gulp.src('src/forceAsync.js')
        .pipe($.jshint(jshint_options))
        .pipe($.jshint.reporter('jshint-stylish'));
});
gulp.task('htmlhint', function() {
    return gulp.src('src/forceAsync.html')
        .pipe($.htmlhint({jshint: jshint_options}))
        .pipe($.htmlhint.reporter());
});
gulp.task('lint', ['jshint', 'htmlhint']);
