const path = require('path');
const fs = require('fs');
const DIST_PATH = path.resolve(__dirname, '../../', 'dist');
const SRC_PATH = path.resolve(__dirname, '../../', 'src');
const PUBLIC_PATH = path.resolve(__dirname, '../../', 'public');
const ROOT_PATH = path.resolve(__dirname, '../../');
const DEFAULT_PORT = 3000;

const libs = ['agora-rte-sdk', 'agora-edu-core'];

let ALIAS = {};

// only load from source in development env
if (process.env.NODE_ENV === 'development') {
  ALIAS = libs.reduce((prev, cur) => {
    const libName = cur;

    const libPath = path.resolve(ROOT_PATH, `../${libName}/src`);

    const libExists = fs.existsSync(libPath);

    if (libExists) {
      prev[libName] = libPath;
    }

    return prev;
  }, {});
}

module.exports = {
  DIST_PATH,
  SRC_PATH,
  PUBLIC_PATH,
  ROOT_PATH,
  DEFAULT_PORT,
  ALIAS,
};
