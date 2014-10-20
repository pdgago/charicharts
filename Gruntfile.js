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
        tasks: ['jshint']
      }
    },

    concat: {
      dist: {
        src: [
          'src/start.js',
          'src/core/pie.js',
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
    }

  });

  grunt.registerTask('build', [
    'concurrent:dist',
    'concat',
    'uglify'
  ]);


  grunt.registerTask('run', [
    'bower',
    'concurrent:server',
    'watch'
  ]);

  grunt.registerTask('default', 'run');

};