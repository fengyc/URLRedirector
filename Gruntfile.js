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
      main: {
        expand: true,
        cwd: 'src/',
        src: '**',
        dest: 'dist/main/'
      },
      offline: {
        expand: true,
        cwd: 'src/',
        src: '**',
        dest: 'dist/offline/',
        options: {
          process: function (content, srcpath) {
            if (/manifest.json/.test(srcpath)) {
              return content.replace(/URLRedirector@fengyc/g, "URLRedirector-offline@fengyc");
            }
            return content;
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
          {expand: true, cwd: '<%= copy.main.dest %>', src: ['**'], dest: '/'}
        ]
      },
      offline: {
        options: {
          archive: 'dist/<%= pkg.name %>-offline-v<%= pkg.version %>.zip'
        },
        files: [
          {expand: true, cwd: '<%= copy.offline.dest %>', src: ['**'], dest: '/'}
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
