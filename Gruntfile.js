module.exports = function (grunt) {
    // Load tasks
    require('load-grunt-tasks')(grunt);

    // Display task timing
    require('time-grunt')(grunt);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: {
            // PHP assets
            php: {
                files_std: ['*.php', '**/*.php', '!node_modules/**/*.php'], // Standard file match
                files: '<%= paths.php.files_std %>' // Dynamic file match
            }
        },
        phplint: {
            options: {
                phpArgs: {
                    '-lf': null
                }
            },
            all: {
                src: '<%= paths.php.files %>'
            }
        },
        makepot: {
            target: {
                options: {
                    mainFile: 'doliwoo.php',
                    type: 'wp-plugin',
                    potHeaders: {
                        poedit: true,
                        'report-msgid-bugs-to': 'https://github.com/GPCsolutions/doliwoo/issues'
                    },
                    updatePoFiles: true
                }
            }
        },
        po2mo: {
            files: {
                src: 'languages/*.po',
                expand: true
            }
        },
        phpdocumentor: {
            dist: {
                options: {
                    ignore: 'node_modules'
                }
            }
        },
        clean: {
            main: ['release/<%= pkg.version %>']
        },
        copy: {
            // Copy the plugin to a versioned release directory
            main: {
                src: [
                    '**',
                    '!node_modules/**',
                    '!release/**',
                    '!.git/**',
                    '!Gruntfile.js',
                    '!package.json',
                    '!.gitignore',
                    '!.gitmodules',
                    '!README.md',
                    '!CONTRIBUTING.md',
                    '!docs/**',
                    '!assets/**'
                ],
                dest: 'release/<%= pkg.version %>/'
            },
            dist: {
                src: 'readme.txt',
                dest: 'README.md'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: './release/doliwoo-v<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: 'release/<%= pkg.version %>/',
                src: ['**/*'],
                dest: 'doliwoo/'
            }
        },
        exec: {
            txpush: {
                cmd: 'tx push -s'
            },
            txpull: {
                cmd: 'tx pull -a'
            }
        },
        wp_readme_to_markdown: {
            main: {
                files: {
                    'README.md': 'readme.txt'
                }
            }
        },
        checkwpversion: {
            check: { //Check plug-in version and stable tag match
                version1: 'plugin',
                version2: 'readme',
                compare: '>='
            },
            check2: { //Check plug-in version and package.json match
                version1: 'plugin',
                version2: '<%= pkg.version %>',
                compare: '=='
            }
        }
    });

    grunt.registerTask('default', [
        'potupdate',
        'checkwpversion',
        'wp_readme_to_markdown'
    ]);

    grunt.registerTask('potupdate', [
        'makepot',
        'exec:txpush',
    ]);

    grunt.registerTask('poupdate', [
        'exec:txpull',
    ]);

    grunt.registerTask('i18n', [
        'potupdate',
        'poupdate',
        'po2mo'
    ]);

    grunt.registerTask('docs', [
        'phpdocumentor:dist'
    ]);

    grunt.registerTask('release', [
        'default',
        'i18n',
        'docs',
        'clean',
        'copy',
        'compress'
    ]);

};