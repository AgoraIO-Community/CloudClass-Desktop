> *Read this in another language: [English](README.md)*

# 声网灵动课堂

## Prerequisites

- NodeJS 12+
- Chrome浏览器

## Install  
```bash
# 全局安装 lerna 与 yarn
npm i yarn -g
npm i lerna

# 通过lerna全局装下依赖
yarn bootstrap
```

## config
```bash
# 将示例配置文件放入agora-classroom-sdk
cp .env.example packages/agora-classroom-sdk/.env
```

*为了容易启动应用，我们在内部提供了输入声网certificate的地方，若你的应用要上生产环境，建议使用你自己的服务器生成token后下发给客户端，不然会有比较大的安全风险*

```
SKIP_PREFLIGHT_CHECK=true
ELECTRON_START_URL=http://localhost:3000
REACT_APP_AGORA_APP_SDK_LOG_SECRET=7AIsPeMJgQAppO0Z

REACT_APP_AGORA_APP_ID=<YOUR AGORA APPID>

# 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
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
# 编译 classroom sdk
yarn ci:build:classroom:sdk

# 编译web部署包
yarn ci:build:web

# 编译electron mac版本
yarn ci:build:electron:mac

# 编译electron win版本
yarn ci:build:electron:win
```
