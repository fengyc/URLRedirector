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
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/main/'},
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/offline/'},
          {expand:true, cwd: 'src/', src: ['**'], dest: 'dist/chrome/'}
        ]
      },
      main_manifest: {
        expand: true,
        cwd: 'src/',
        src: 'manifest.json',
        dest: 'dist/main/',
        options: {
          process: function (content, srcpath) {
            var pkg = grunt.file.readJSON('package.json');
            var json = JSON.parse(content);
            json.version = pkg.version;
            return JSON.stringify(json, null, 2);
          }
        }
      },
      offline_manifest: {
        expand: true,
        cwd: 'src',
        src: 'manifest.json',
        dest: 'dist/offline/',
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
      }
    },
    compress: {
      main: {
        options: {
          archive: 'dist/<%= pkg.name %>-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/main/', src: ['**'], dest: '/'}
        ]
      },
      offline: {
        options: {
          archive: 'dist/<%= pkg.name %>-offline-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/offline', src: ['**'], dest: '/'}
        ]
      },
      chrome: {
        options: {
          archive: 'dist/<%= pkg.name %>-chrome-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: 'dist/chrome', src: ['**'], dest: '/'}
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
