const process = require('process')
const inquirer = require('inquirer')
const child_process = require('child_process')
const path = require('path')
const cwd = process.cwd()
const fs = require('fs')

const packageJsonPath = path.join(__dirname, '../package.json')
const packageJson = require(packageJsonPath)

const getInstallCommand = (platform) => {
  let arch = 'x64'
  if (platform === 'win32') {
    arch = 'ia32'
  }

  const installMacSdk = `
    npm install electron@7.1.14 --save-dev --platform=${platform} -d
  `

  const installWin32Sdk = `
    npm install electron@7.1.14 --save-dev --platform=${platform} --arch=${arch} -d
  `
  const str = `
    ${platform === 'win32' ? installWin32Sdk : installMacSdk}
    npm install agora-electron-sdk@education290 --save -d
  `.replace(/()\s+/, '');

  return str;
}
async function run() {

  const builder = {
    type: [],
    platform: '',
    useTaoBaoCdn: false,
  }

  const askProjectType = [{
    type: 'confirm',
    message: 'Use Electron? (y/N)',
    name: 'type',
  }]

  let {type} = await inquirer.prompt(askProjectType)

  builder.type = type
  if (builder.type === true) {
    const electronPlatform = [{
      type: 'rawlist',
      name: 'platform',
      message: 'Electron platform ?',
      choices: [
        'macOS',
        'win32',
      ]
    }]
      
    let {platform} = await inquirer.prompt(electronPlatform);
    builder.platform = platform
    packageJson.dependencies = {
      "adm-zip": "^0.4.14",
      "agora-electron-sdk": "education290"
    }
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      electron: '7.1.14',
      'electron-builder': '22.5.1'
    }

    if (platform === 'macOS') {
      packageJson.agora_electron.platform = 'darwin'
      packageJson.agora_electron.arch = 'x64'
    }

    if (platform === 'win32') {
      packageJson.agora_electron.platform = 'win32'
      packageJson.agora_electron.arch = 'ia32'
    }
  } else {
    packageJson.dependencies = undefined
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      electron: undefined,
    }
  }

  const askTaoBaoCdn = [{
    type: 'confirm',
    name: 'useTaoBaoCdn',
    message: 'Use China TaoBao CDN',
  }]

  let {useTaoBaoCdn} = await inquirer.prompt(askTaoBaoCdn)

  if (useTaoBaoCdn === true) {
    builder.useTaoBaoCdn = true
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  child_process.execSync(`cd ${cwd}`);

  if (process.platform === 'darwin') {
    child_process.execSync(`
      export SASS_BINARY_SITE="https://npm.taobao.org/mirrors/node-sass/";
    `)
  }

  if (process.platform === 'win32') {
    child_process.execSync(`
      set SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/
    `)
  }


  if (builder.type === true) {
    const installSteps = getInstallCommand(packageJson.agora_electron.platform)
    console.log("builder.useTaoBaoCdn", builder.useTaoBaoCdn)
    if (builder.useTaoBaoCdn) {
      if (packageJson.agora_electron.platform === 'darwin') {
        child_process.execSync(`
          export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/";
          export ELECTRON_CUSTOM_DIR="7.1.14";
          export ELECTRON_BUILDER_BINARIES_MIRROR="https://npm.taobao.org/mirrors/electron-builder-binaries/";
        `.replace(/( )\s+/g,''))
      }

      if (packageJson.agora_electron.platform === 'win32') {
        child_process.execSync(`
          set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
          set ELECTRON_CUSTOM_DIR=7.1.14
          set ELECTRON_BUILDER_BINARIES_MIRROR=https://npm.taobao.org/mirrors/electron-builder-binaries/
        `.replace(/( )\s+/g,''))
      }
    }
    child_process.execSync(installSteps, {stdio: [0, 1, 2]})
    packageJson.devDependencies['electron'] = '7.1.14'
    packageJson.dependencies['agora-electron-sdk'] = 'education290'
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }
}

run()