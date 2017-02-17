module.exports = function (grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		uglify: {
			build: {
			  src: 'public_html/bundle.js',
			  dest: 'public_html/bundle.min.js'
			}
		},
		clean:['public_html/*'],
		copy: {
			build: {
				  files:[{expand: true, cwd: 'files/', src: ['index.html'], dest: 'public_html/'}]
			}
		},
		browserify: {
			'public_html/require.js': ['files/jquery.autoinput.js']
		}
		/*requirejs: {
			build: {
				options: {
					//name: "../node_modules/almond/almond",
					baseUrl: 'files/',
					removeCombined: true,
					findNestedDependencies: true,
					preserveLicenseComments: false,
					out: 'public_html/require.js',
					include:['jquery.autoinput'],
					paths: {//jquery.autoinput
						jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery'
					}
				}
			}
		}*/
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	//grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.registerTask('build', [
		'copy',
		'browserify'
	]);
};
