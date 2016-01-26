(function () {
    module.exports = function (grunt) {
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            coffee: {
                options: {
                    join: true
                },
                build: {
                    files: {
                        'src/tmp/content-tools.js': [
                            'src/scripts/namespace.coffee',
                            'src/scripts/ui/ui.coffee',
                            'src/scripts/ui/flashes.coffee',
                            'src/scripts/ui/ignition.coffee',
                            'src/scripts/ui/inspector.coffee',
                            'src/scripts/ui/modal.coffee',
                            'src/scripts/ui/toolbox.coffee',
                            'src/scripts/ui/dialogs/dialogs.coffee',
                            'src/scripts/ui/dialogs/image.coffee',
                            'src/scripts/ui/dialogs/link.coffee',
                            'src/scripts/ui/dialogs/properties.coffee',
                            'src/scripts/ui/dialogs/table.coffee',
                            'src/scripts/ui/dialogs/video.coffee',
                            'src/scripts/editor.coffee',
                            'src/scripts/history.coffee',
                            'src/scripts/styles.coffee',
                            'src/scripts/tools.coffee'
                        ]
                    }
                },
                sandbox: {
                    files: {
                        'sandbox/sandbox.js': [
                            'src/sandbox/image-uploader.coffee',
                            'src/sandbox/sandbox.coffee'
                        ]
                    }
                },
                spec: {
                    files: {
                        'spec/spec-helper.js': 'src/spec/spec-helper.coffee',
                        'spec/content-tools-spec.js': [
                            'src/spec/namespace.coffee',
                            'src/spec/ui/ui.coffee',
                            'src/spec/ui/flashes.coffee',
                            'src/spec/ui/ignition.coffee',
                            'src/spec/ui/inspector.coffee',
                            'src/spec/ui/modal.coffee',
                            'src/spec/ui/toolbox.coffee',
                            'src/spec/ui/dialogs/dialogs.coffee',
                            'src/spec/ui/dialogs/image.coffee',
                            'src/spec/ui/dialogs/link.coffee',
                            'src/spec/ui/dialogs/properties.coffee',
                            'src/spec/ui/dialogs/table.coffee',
                            'src/spec/ui/dialogs/video.coffee',
                            'src/spec/editor.coffee',
                            'src/spec/history.coffee',
                            'src/spec/tools.coffee',
                            'src/spec/styles.coffee'
                        ]
                    }
                }
            },
            cssmin: {
                build: {
                    //src: 'src/style/content-tools.css',
                    src: 'src/style/ew-content-tools.css',
                    dest: 'build/content-tools.min.css'
                }
            },
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> by <%= pkg.author.name %> <<%= pkg.author.email %>> (<%= pkg.author.url %>) */\n',
                    mangle: false
                },
                build: {
                    src: 'build/content-tools.js',
                    dest: 'build/content-tools.min.js'
                }
            },
            concat: {
                build: {
                    src: [
                        'external/scripts/content-edit.js',
                        'src/scripts/ew/ew-content-edit.js',
                        //'src/tmp/content-tools.js',
                        // compiled coffee
                        //'src/scripts/namespace.js',
                        'src/scripts/ew/ew-namespace.js',
                        'src/scripts/ui/ui.js',
                        'src/scripts/ui/flashes.js',
                        'src/scripts/ui/ignition.js',
                        'src/scripts/ui/inspector.js',
                        'src/scripts/ui/modal.js',
                        'src/scripts/ui/toolbox.js',
                        'src/scripts/ui/dialogs/dialogs.js',
                        'src/scripts/ui/dialogs/image.js',
                        //'src/scripts/ui/dialogs/link.js',
                        'src/scripts/ew/ew-dialog-link.js',
                        'src/scripts/ui/dialogs/content-field.js',
                        'src/scripts/ui/dialogs/properties.js',
                        'src/scripts/ui/dialogs/table.js',
                        'src/scripts/ui/dialogs/video.js',
                        //'src/scripts/editor.js',
                        'src/scripts/ew/ew-editor.js',
                        'src/scripts/history.js',
                        'src/scripts/styles.js',
                        'src/scripts/tools.js',
                        'src/scripts/ew/ew-tools.js'
                    ],
                    dest: 'build/content-tools.js'

                }
            },
            copy: {
                build: {
                    expand: true,
                    cwd: 'build/',
                    src: ['**'],
                    dest: "C:/xampp/htdocs/EverythingWidget/packages/admin/public/js/ContentStrike/"
                }
            },
            clean: {
                build: ['src/tmp']
            },
            jasmine: {
                build: {
                    src: ['build/content-tools.js'],
                    options: {
                        specs: 'spec/content-tools-spec.js',
                        helpers: 'spec/spec-helper.js'
                    }
                }
            },
            watch: {
                build: {
                    files: ['src/scripts/**/*.js'],
                    tasks: ['build-dev']
                },
                production: {
                    files: ['external/scripts/content-edit.js','src/scripts/**/*.js','src/style/*.css'],
                    tasks: ['build-production']
                },
                sandbox: {
                    files: ['src/sandbox/*.coffee'],
                    tasks: ['sandbox']
                },
                spec: {
                    files: ['src/spec/**/*.coffee'],
                    tasks: ['spec']
                }
            }
        });
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-coffee');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-jasmine');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-contrib-copy');

        grunt.registerTask('build-dev', ['concat:build', 'cssmin:build', 'copy:build']);
        grunt.registerTask('build-production', [/*'coffee:build', */'concat:build', 'uglify:build',  'clean:build', 'cssmin:build', 'copy:build']);
        grunt.registerTask('sandbox', ['coffee:sandbox']);
        grunt.registerTask('spec', ['coffee:spec']);
        grunt.registerTask('watch-build', ['watch:build']);
        grunt.registerTask('watch-production', ['watch:production']);
        grunt.registerTask('watch-sandbox', ['watch:sandbox']);
        grunt.registerTask('copy-to-ew', ['copy:build']);
        return grunt.registerTask('watch-spec', ['watch:spec']);
    };

}).call(this);
