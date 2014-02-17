module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean:
      start: ['dist/*']
      finish: ['tmp']

    concat:
      mainjs:
        options:
          banner: '''
                  /**
                   * <%= pkg.title %> v<%= pkg.version %>
                   * <%= pkg.homepage %>
                   *
                   * Copyright 2014 <%= pkg.author.organization %>
                   * Released under the MIT license
                   * <%= pkg.homepage %>/blob/master/LICENSE
                   *
                   * Date: <%= grunt.template.today("isoUtcDateTime") %>
                   */\n
                  '''
        files:
          'dist/jquery.forceAsync.js': ['src/jquery.forceAsync.js']
      iframe:
        files:
          'tmp/forceAsync.html': ['src/iframe_part_A.html', 'tmp/iframe_inline.min.js', 'src/iframe_part_B.html']

    htmlmin:
      iframe:
        options:
          removeComments: true
          collapseWhitespace: true
        files:
          'dist/forceAsync.html': ['tmp/forceAsync.html']

    jshint:
      options:
        jshintrc: '.jshintrc'
      files: [
        'src/jquery.forceAsync.dev.js'
        'src/iframe_inline.js'
      ]

    uglify:
      mainjs:
        options:
          banner: '''
                  /**
                   * <%= pkg.title %> v<%= pkg.version %>
                   * (c) 2014 <%= pkg.author.organization %>
                   * MIT license
                   */
                  '''
          sourceMap: true
        files:
          'dist/jquery.forceAsync.min.js': ['dist/jquery.forceAsync.js']
      iframe:
        files:
          'tmp/iframe_inline.min.js': ['src/iframe_inline.js']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-htmlmin'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  grunt.registerTask 'default', [
    'clean:start',
    'jshint',
    'concat:mainjs', 'uglify:mainjs',
    'uglify:iframe', 'concat:iframe', 'htmlmin:iframe',
    'clean:finish'
  ]

  grunt.registerTask 'test', ['jshint']

