/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: ['dist/'],
    copy: {
      prepare: {
        files: [
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/firefox/'},
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/firefox-offline/'},
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/chrome/'},
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/edge/'}
        ]
      },
      firefox_manifest: {
        expand: true,
        cwd: 'src/',
        src: 'manifest.json',
        dest: 'dist/firefox/',
        options: {
          process: function (content, srcpath) {
            var pkg = grunt.file.readJSON('package.json');
            var json = JSON.parse(content);
            json.version = pkg.version;
            return JSON.stringify(json, null, 2);
          }
        }
      },
      firefox_offline_manifest: {
        expand: true,
        cwd: 'src/',
        src: 'manifest.json',
        dest: 'dist/firefox-offline/',
        options: {
          process: function (content, srcpath) {
            var pkg = grunt.file.readJSON('package.json');
            var json = JSON.parse(content);
            json.version = pkg.version;
            json.name = "URLRedirector-offline";
            json.applications.gecko.id = "URLRedirector-offline@fengyc";
            return JSON.stringify(json, null, 2);
          }
        }
      },
      chrome_manifest: {
        expand: true,
        cwd: 'src',
        src: 'manifest.json',
        dest: 'dist/chrome/',
        options: {
          process: function (content, srcpath) {
            var pkg = grunt.file.readJSON('package.json');
            var json = JSON.parse(content);
            json.version = pkg.version;
            delete json.applications;
            return JSON.stringify(json, null, 2);
          }
        }
      },
      chrome_webstore: {
        expand: true,
        cwd: 'src/options',
        src: 'options.js',
        dest: 'dist/chrome/options/',
        options: {
          process: function (content, srcpath) {
            /* Fix chrome webstore url */
            var pkg = grunt.file.readJSON('package.json');
            var chromeWebStoreURL = pkg.publishConfig["chrome-webstore"];
            return content.replace(/var.*ADDON_URL.*=.*/, 'var ADDON_URL = "' + chromeWebStoreURL + '";' );
          }
        }
      },
      edge_manifest: {
        expand: true,
        cwd: 'src',
        src: 'manifest.json',
        dest: 'dist/edge/',
        options: {
          process: function (content, srcpath) {
            var pkg = grunt.file.readJSON('package.json');
            var json = JSON.parse(content);
            json.version = pkg.version;
            json.author = pkg.author.name;
            json.background.persistent = true;
            json.options_page = json.options_ui.page;
            delete json.options_ui;
            delete json.browser_action.browser_style;
            return JSON.stringify(json, null, 2);
          }
        }
      }
    },
    compress: {
      firefox: {
        options: {
          archive: 'dist/<%= pkg.name %>-firefox-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/firefox/', src: ['**'], dest: '/'}
        ]
      },
      firefox_offline: {
        options: {
          archive: 'dist/<%= pkg.name %>-firefox-offline-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/firefox-offline/', src: ['**'], dest: '/'}
        ]
      },
      chrome: {
        options: {
          archive: 'dist/<%= pkg.name %>-chrome-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/chrome', src: ['**'], dest: '/'}
        ]
      },
      edge: {
        options: {
          archive: 'dist/<%= pkg.name %>-edge-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/edge', src: ['**'], dest: '/'}
        ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task.
  grunt.registerTask('default', ['clean', 'copy', 'compress']);

};
