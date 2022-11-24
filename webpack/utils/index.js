const path = require('path');
const fs = require('fs');
const PUBLIC_PATH = path.resolve(__dirname, '../../', 'public');
const ROOT_PATH = path.resolve(__dirname, '../../');

const libs = ['agora-rte-sdk', 'agora-edu-core', 'agora-common-libs'];

let ALIAS = libs.reduce((prev, cur) => {
  const libName = cur;

  const libPath = path.resolve(ROOT_PATH, `../${libName}/src`);

  const libExists = fs.existsSync(libPath);

  if (libExists) {
    prev[libName] = libPath;
  }

  return prev;
}, {});

module.exports = {
  PUBLIC_PATH,
  ROOT_PATH,
  ALIAS,
};
