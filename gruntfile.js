/*global module:false*/
module.exports = function(grunt) {

  // show elapsed time at the end
  require('time-grunt')(grunt);

  // load all grunt tasks
  //require('load-grunt-tasks')(grunt);
  require('jit-grunt')(grunt,{
    'bump-only':'grunt-bump',
    'bump-commit': 'grunt-bump',
    'saucelabs-qunit': 'grunt-saucelabs'
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      bannerLocal: '/*! iFrame Resizer (iframeSizer.min.js ) - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Force cross domain iframes to size to content.\n' +
        ' *  Requires: iframeResizer.contentWindow.min.js to be loaded into the target frame.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT\n */\n',
      bannerRemote: '/*! iFrame Resizer (iframeSizer.contentWindow.min.js) - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Include this file in any page being loaded into an iframe\n' +
        ' *        to force the iframe to resize to the content size.\n' +
        ' *  Requires: iframeResizer.min.js on host page.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT\n */\n'
    },

    connect: {
      server: {
        options: {
          base: '',
          port: 9999
        }
      }
    },

    qunit: {
      files: ['test/*.html']
    },

    'saucelabs-qunit': {
      all: {
        options: {
          browsers: [
            'XP',
            'chrome',
            ''
          ],
          build: process.env.TRAVIS_JOB_ID ? process.env.TRAVIS_JOB_ID : 0,
          concurrency: 3,
          tags: [
            process.env.TRAVIS_BRANCH ? process.env.TRAVIS_BRANCH : 'local'
          ],
          testname: 'QUnit tests',
          tunnelTimeout: 5,
          urls: [
            'http://127.0.0.1:<%= connect.server.options.port %>/test/close.html'
          ]
        }
      }
    },

    jshint: {
      options: {
          globals: {
          jQuery:false,
          require:true,
          process:true
        },
      },
      gruntfile: {
        src: 'gruntfile.js'
      },
      code: {
        src: 'src/**/*.js'
      },
    },

    uglify: {
      options: {
        sourceMap:true,
        sourceMapIncludeSources:true,
        report:'gzip',
      },
      local: {
        options:{
          banner:'<%= meta.bannerLocal %>',
          sourceMapName: 'src/iframeResizer.map'
        },
        src: ['src/iframeResizer.js'],
        dest: 'js/iframeResizer.min.js',
      },
      remote: {
        options: {
          banner:'<%= meta.bannerRemote %>',
          sourceMapName: 'src/iframeResizer.contentWindow.map'
        },
        src: ['src/iframeResizer.contentWindow.js'],
        dest: 'js/iframeResizer.contentWindow.min.js',
      }
    },

    watch: {
      files: ['src/**/*'],
      tasks: 'default'
    },

    bump: {
      options: {
        files: ['package.json','bower.json','component.json','iframeResizer.jquery.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },

    shell: {
      options:{
        stdout: true,
        stderr: true,
        failOnError: true
      },
      deployExample: {
        command: function(){

          var
            retStr = '',
            fs = require('fs');

          if (fs.existsSync('bin')) {
              retStr = 'bin/deploy.sh';
          }

          return retStr;
        }
      }
    },

    jsonlint: {
      json: {
        src: [ '*.json' ]
      }
    }

  });

  grunt.registerTask('default', ['notest','qunit']);
  grunt.registerTask('notest',  ['jsonlint','jshint','uglify']);
  grunt.registerTask('test',    ['jshint','qunit']);
  grunt.registerTask('test-cloud', ['jshint', 'connect', 'saucelabs-qunit']);

  grunt.registerTask('postBump',['uglify','bump-commit','shell']);
  grunt.registerTask('patch',   ['default','bump-only:patch','postBump']);
  grunt.registerTask('minor',   ['default','bump-only:minor','postBump']);
  grunt.registerTask('major',   ['default','bump-only:major','postBump']);

};
