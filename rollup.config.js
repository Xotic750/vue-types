import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import filesize from 'rollup-plugin-filesize';

import {
  version,
  name,
  license,
  author,
  homepage,
} from './package.json';

const banner = `
/*! ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${new Date().getFullYear()} - ${author};
 * Licensed ${license}
 */
`;

const plugins = [
  resolve(),
  commonjs(),
  babel({
    exclude: 'node_modules/**', // only transpile our source code
    runtimeHelpers: true,
  }),
];

const baseOutputConfig = {
  format: 'umd',
  name: 'VueTypes',
  sourcemap: true,
};

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'umd/vue-types.js',
      ...baseOutputConfig,
    },
    plugins: [replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }), ...plugins, filesize()],
    banner,
  },
  {
    input: 'src/index.js',
    output: {
      file: 'umd/vue-types.min.js',
      ...baseOutputConfig,
    },
    plugins: [replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }), ...plugins, uglify({
      warnings: false,
      mangle: true,
      compress: {
        pure_funcs: ['warn'],
      },
      output: {
        comments: /^!/,
      },
    }), filesize()],
    banner,
  },
];
