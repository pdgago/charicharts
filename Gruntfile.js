module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    root: '/',

    // JS
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      files: [
        'Gruntfile.js',
        'src/{,*/}{,*/}{,*/}*.js'
      ]
    },

    bower: {
      install: {
        options: {
          copy: false
        }
      }
    },

    watch: {
      options: {
        spawn: false
      },
      scripts: {
        files: '<%= jshint.files %>',
        tasks: ['build', 'jshint']
      }
    },

    concat: {
      dist: {
        src: [
          'src/start.js',
          'src/core/helpers.js',
          'src/core/*.js',
          'src/parts/*.js',
          'src/constructors/*.js',
          'src/end.js'
        ],
        dest: 'charicharts.js'
      }
    },

    uglify: {
      dist: {
        files: {
          'charicharts.min.js': ['charicharts.js']
        }
      }
    },

    copy: {
      demo: {
        src: 'charicharts.js',
        dest: 'demo/'
      }
    },

    shell: {
      options: {
        stderr: false
      },
      server: {
        command: 'http-server demo/'
      }
    }

  });

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'copy:demo'
  ]);


  grunt.registerTask('run', [
    'bower',
    'build',
    'watch'
  ]);

  grunt.registerTask('s', [
    'shell:server'
  ]);

  grunt.registerTask('default', 'run');

};