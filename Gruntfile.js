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

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      server: [
      ],
      dist: [
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
        tasks: ['jshint', 'build']
      }
    },

    concat: {
      dist: {
        src: [
          'src/start.js',
          'src/core/globals.js',
          'src/core/*.js',
          'src/parts/*.js',
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
    }

  });

  grunt.registerTask('build', [
    'concurrent:dist',
    'concat',
    'uglify',
    'copy:demo'
  ]);


  grunt.registerTask('run', [
    'bower',
    'concurrent:server',
    'watch'
  ]);

  grunt.registerTask('default', 'run');

};