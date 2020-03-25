'use strict';
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Show grunt task time
    require('time-grunt')(grunt);

    var serveStatic = require('serve-static');

    grunt.loadNpmTasks('grunt-humans-txt');
    grunt.loadNpmTasks('grunt-contrib-pug');

    grunt.file.defaultEncoding = 'utf8';

    // Configurable paths for the app
    var appConfig = {
        tmp: '.tmp',
        app: 'app',
        dist: 'dist'
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        aazbeltran: appConfig,
        humans_txt: {
            external_file: {
                options: {
                    content: grunt.file.readJSON('humans.json'),
                    intro: 'Desarrollado con amor y dedicación.',
                    includeUpdateIn: 'SITE',
                    commentStyle: 'u'
                },
                dest: '<%= aazbeltran.dist %>/humans.txt'
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect().use(
                                '/node_modules',
                                serveStatic('./node_modules')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= aazbeltran.dist %>'
                }
            }
        },
        pug: {
            compile: {
                options: {
                    pretty: true,
                    data: {
                        debug: false
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= aazbeltran.app %>/pug_templates/',
                    src: ['*.pug'],
                    dest: '<%= aazbeltran.app %>/',
                    ext: '.html',
                    extDot: 'first'
                }]
            }
        },
        // Compile sass to css
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    loadPath: ['.']
                },
                files: {
                    '<%= aazbeltran.app %>/styles/style.css': '<%= aazbeltran.app %>/sass/style.scss'

                }
            }
        },
        // Watch for changes in live edit
        watch: {
            styles: {
                files: ['<%= aazbeltran.app %>/sass/**/*.scss'],
                tasks: ['sass', 'copy:styles'],
                options: {
                    nospawn: true,
                    livereload: '<%= connect.options.livereload %>'
                },
            },
            pug: {
                files: ['<%= aazbeltran.app %>/pug_templates/**/*.pug'],
                tasks: ['pug'],
                options: {
                    nospawn: true,
                    livereload: '<%= connect.options.livereload %>'
                },
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= aazbeltran.app %>/**/*.html',
                    '<%= aazbeltran.tmp %>/styles/{,*/}*.css',
                    '<%= aazbeltran.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        uglify: {
            options: {
                mangle: false,
                maxLineLen: 1000000
            }
        },
        // Clean dist folder
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= aazbeltran.tmp %>',
                        '<%= aazbeltran.dist %>/{,*/}*',
                        '!<%= aazbeltran.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= aazbeltran.app %>',
                        dest: '<%= aazbeltran.dist %>',
                        src: [
                            '*.{png}',
                            '*.html',
                            '.htaccess',
                            'images/{,*/}*.*',
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'node_modules/@fortawesome/fontawesome-free',
                        src: ['webfonts/*.*'],
                        dest: '<%= aazbeltran.dist %>'
                    },
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= aazbeltran.app %>/styles',
                dest: '<%= aazbeltran.tmp %>/styles/',
                src: '{,*/}*.css'
            }
        },
        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= aazbeltran.dist %>/scripts/{,*/}*.js',
                    '<%= aazbeltran.dist %>/styles/{,*/}*.css',
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= aazbeltran.dist %>',
                    src: ['*.html'],
                    dest: '<%= aazbeltran.dist %>'
                }]
            }
        },
        useminPrepare: {
            html: '<%= aazbeltran.app %>/index.html',
            options: {
                dest: '<%= aazbeltran.dist %>'
            }
        },
        usemin: {
            html: ['<%= aazbeltran.dist %>/index.html']
        },
    });

    grunt.registerTask('live', [
        'clean:server',
        'sass',
        'pug',
        'copy:styles',
        'connect:livereload',
        'watch'
    ]);

    grunt.registerTask('server', [
        'build',
        'connect:dist:keepalive'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'pug',
        'sass',
        'useminPrepare',
        'concat',
        'copy:dist',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin',
        'humans_txt'
    ]);

};