> *其他语言版本：[简体中文](README.zh.md)*

# This branch is still in development stage, PR is not accepted at this stage.
## CloudClass Desktop

## Install  
```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## config
```bash
# copy config template to agora-rte-demo project
cp .env.example packages/agora-classroom-sdk/.env

# fill the config with your agora.io development environment
```

## run
```bash
yarn dev
```

## build classroom sdk
```bash
yarn build:ui-kit
yarn build:classroom:sdk
```

+ [Electron QuickStart](./packages/agora-electron-edu-demo/README.md)