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
                   * Copyright 2014 <%= pkg.author.name %>
                   * Released under the MIT license
                   * <%= pkg.homepage %>/blob/master/LICENSE
                   *
                   * Date: <%= grunt.template.today("isoUtcDateTime") %>
                   */\n
                  '''
        files:
          'dist/jquery.forceAsync.debug.js': ['src/main.js']
      iframe:
        files:
          'tmp/forceAsync.html': [
            'src/iframe_part_A.html',
            'tmp/iframe_head.min.js',
            'src/iframe_part_B.html',
            'tmp/iframe_main.min.js',
            'src/iframe_part_C.html'
          ]

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
        'src/main.js'
        'src/iframe_main.js'
        'src/iframe_head.js'
      ]

    removelogging:
      options:
        replaceWith: ''
      files:
        src:  'dist/jquery.forceAsync.debug.js'
        dest: 'dist/jquery.forceAsync.js'

    uglify:
      mainjs:
        options:
          banner: '''
                  /**
                   * <%= pkg.title %> v<%= pkg.version %>
                   * (c) 2014 <%= pkg.author.name %>
                   * MIT license
                   */
                  '''
          sourceMap: true
        files:
          'dist/jquery.forceAsync.min.js': ['dist/jquery.forceAsync.js']
      iframe:
        files: {
          'tmp/iframe_main.min.js': ['src/iframe_main.js'],
          'tmp/iframe_head.min.js': ['src/iframe_head.js']
        }

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-htmlmin'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-remove-logging'

  grunt.registerTask 'default', [
    'clean:start',
    'jshint',
    'concat:mainjs', 'removelogging', 'uglify:mainjs',
    'uglify:iframe', 'concat:iframe', 'htmlmin:iframe',
    'clean:finish'
  ]
  grunt.registerTask 'test', ['jshint']

