'use strict';

const fs = require('fs');
const path = require('path');
const packageJson = require("../package.json")

packageJson["build"]["electronDownload"] = {"mirror": "https://npm.taobao.org/mirrors/electron/"}

let data = JSON.stringify(packageJson);
fs.writeFileSync(path.join(__dirname,'../package.json'), data);