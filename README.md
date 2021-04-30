> *其他语言版本：[简体中文](README.zh.md)*

# CloudClass Desktop

## Prerequisites

- NodeJS 12+
- Chrome Browser

## Install  
```bash
# global install lerna and yarn
npm i yarn -g
npm i lerna

# install all dependencies via lerna and npm
yarn bootstrap
```

## config
```bash
# copy config template to agora-rte-demo project
cp .env.example packages/agora-classroom-sdk/.env
```

```
SKIP_PREFLIGHT_CHECK=true
ELECTRON_START_URL=http://localhost:3000
REACT_APP_AGORA_APP_SDK_LOG_SECRET=7AIsPeMJgQAppO0Z

REACT_APP_AGORA_APP_ID=<YOUR AGORA APPID>

# this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
REACT_APP_AGORA_APP_CERTIFICATE=<YOUR AGORA APPCERTIFICATE>

REACT_APP_BUILD_VERSION=TEST_APAAS_1.1.0

REACT_APP_AGORA_APP_SDK_DOMAIN=https://api-test.agora.io/preview
```


## run
```bash
yarn dev
```

## build release products
```bash
# build classroom sdk
yarn ci:build:classroom:sdk

# build web deployment
yarn ci:build:web

# build electron mac
yarn ci:build:electron:mac

# build electron win
yarn ci:build:electron:win
```

+ [Electron QuickStart](./packages/agora-electron-edu-demo/README.md)
