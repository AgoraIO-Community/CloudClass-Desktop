const { task, option, logger, argv, series } = require('just-scripts');
const packageJSON = require('./packages/agora-classroom-sdk/package.json')
const fs = require('fs-extra')
const path = require('path')
const shell = require('shelljs')

// option('name', { default: 'world' });

task('prepare', () => {
    fs.copyFileSync(path.resolve(__dirname, './packages/agora-classroom-sdk/package.json'), path.resolve(__dirname, 'tmp.json'))
    packageJSON['build']['electronDownload'] = {"mirror": "https://npm.taobao.org/mirrors/electron/"}
    fs.writeFileSync(path.resolve(__dirname, './packages/agora-classroom-sdk/package.json'), JSON.stringify(packageJSON))
});

task('build:demo:web', () => {
    shell.exec('yarn release:demo')
});

task('build:demo:electron:mac', () => {
    shell.exec('yarn release:electron:mac')
});

task('build:demo:electron:win', () => {
    shell.exec('yarn release:electron:win')
});

task('build:classroom:sdk', () => {
    shell.exec('yarn release:classroom:sdk')
});

task('cleanup', () => {
    fs.copyFileSync(path.resolve(__dirname, 'tmp.json'), path.resolve(__dirname, './packages/agora-classroom-sdk/package.json'))
})

task('release:web', series('prepare', 'build:demo:web', 'cleanup'))
task('release:electron:win', series('prepare', 'build:demo:electron:win', 'cleanup'))
task('release:electron:mac', series('prepare', 'build:demo:electron:mac', 'cleanup'))
task('release:classroom:sdk', series('prepare', 'build:classroom:sdk', 'cleanup'))