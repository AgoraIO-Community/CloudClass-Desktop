> *其他语言版本：[简体中文](README.zh.md)*

## CloudClass Desktop

## Install  
```bash
# install global dev dependencies
npm install

# install all dependencies via lerna and npm
lerna bootstrap
```

## config
```bash
# copy config template to agora-rte-demo project
cp .env.example packages/agora-rte-demo/.env

# fill the config with your agora.io development environment
```

## run
```bash
# build sdk and run dev demo
npm run dev
```

+ [Electron QuickStart](./packages/agora-electron-edu-demo/README.md)