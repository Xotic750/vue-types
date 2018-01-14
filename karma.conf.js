// Karma configuration
// Generated on Wed Oct 26 2016 17:54:27 GMT+0200 (CEST)

// const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const stub = require('rollup-plugin-stub');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');

const production = process.env.PRODUCTION === 'true';

const baseConfig = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',

  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha'],

  // list of files / patterns to load in the browser
  files: [
    {
      pattern: 'src/*.js',
      included: false
    },
    'test/**/*.spec.js'
  ],

  // list of files to exclude
  exclude: [
  ],

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    // add webpack as preprocessor
    'src/**/*.js': ['rollup'],
    'test/**/*.spec.js': ['rollup']
  },

  rollupPreprocessor: {
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }),
      replace({
        'process.env.NODE_DEBUG': !production
      }),
      stub(),
      globals(),
      builtins()
    ],
    output: {
      format: 'iife',
      name: 'VueTypes',
      sourcemap: 'inline'
    },
    onwarn(warning) {
      // Suppress this error message... there are hundreds of them.
      // Angular team says to ignore it.
      // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }

      console.error(warning.message);
    }
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['mocha'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  concurrency: Infinity
};

module.exports = (config) => {
  config.set(Object.assign({}, baseConfig, {

    // level of logging
    // possible values:
    //   config.LOG_DISABLE
    //   config.LOG_ERROR
    //   config.LOG_WARN
    //   config.LOG_INFO
    //   config.LOG_DEBUG

    logLevel: config.LOG_INFO
  }));
};

module.exports.baseConfig = baseConfig;
