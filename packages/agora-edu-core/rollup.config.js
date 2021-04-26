import commonjs from '@rollup/plugin-commonjs';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import babel from '@rollup/plugin-babel';
import clear from 'rollup-plugin-clear';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json'

const isProd = process.env.NODE_ENV === 'production';
export default {
  // 入口 可以是一个字符串，也可以是对象
  input: 'src/index.ts',
  // 出口
  output: {
    dir: './lib/', // 可以是 dir 表示输出目录 也可以是 file 表示输出文件
    format: 'esm', // 输出的格式 可以是 cjs commonJs 规范 | esm es Module 规范 | iife 浏览器可引入的规范
    entryFileNames: '[name].js',
    exports: 'named',
    sourcemap: isProd ? false : true,
    name: 'AgoraEduSDK',
  },
  // 需要引入的插件
  plugins: [
    clear({
      targets: ['lib']
    }),
    commonjs({
      include: /node_modules/,
    }),
    babel({
      ...pkg.babel,
      extensions: [...DEFAULT_EXTENSIONS, '.js', '.ts', '.tsx'],
      babelHelpers: 'runtime',
    }),
    typescript({
      verbosity: true,
      check: false
    })
  ],
  // 将模块视为外部模块，不会打包在库中
  external: [
    "react",
    "react-dom",
  ],
  // 文件监听
  watch: {
    include: 'src/**',
    clearScreen: true
  }
};