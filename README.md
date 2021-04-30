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

*Please do not put your certificate in client for production release. For sake of convenience we allow you to put certificate here and help you calculate tokens so that you can start easily. when you go production you should use your own server to sign the token.*

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

## UI Folder Structure
![image](https://user-images.githubusercontent.com/471561/116705542-396afe80-a9ff-11eb-8732-3126b2740d15.png)

