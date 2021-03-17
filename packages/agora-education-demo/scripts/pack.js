const process = require('process')
const child_process = require('child_process')
const inquirer = require('inquirer')
const argv = process.argv

const platform = argv[2]

async function pack() {

  const askCDN = [{
    type: 'confirm',
    message: 'Use China TaoBao CDN? (y/N)',
    name: 'useCdn',
  }]

  let {useCdn} = await inquirer.prompt(askCDN)

  let env = ''

  const platformStr = platform === 'mac' ? 'mac' : 'win'

  if (useCdn) {
    if (platformStr) {
      env = `
        export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
        export ELECTRON_CUSTOM_DIR="7.1.14"
        export ELECTRON_BUILDER_BINARIES_MIRROR="https://npm.taobao.org/mirrors/electron-builder-binaries/"
      `.replace(/()\s+/, '')
    } else {
      env = `
        set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
        set ELECTRON_CUSTOM_DIR=7.1.14
        set ELECTRON_BUILDER_BINARIES_MIRROR=https://npm.taobao.org/mirrors/electron-builder-binaries/
      `.replace(/()\s+/, '')
    }
    child_process.execSync(`${env}`, {stdio: [0, 1, 2]})
  }

  child_process.execSync(`
    npm run electron:build && electron-builder --${platformStr} 
  `, {stdio: [0, 1, 2]})
}

pack()