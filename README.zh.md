> _Read this in another language: [English](README.md)_

## 云课堂 Electron App

## Install

```bash
# 安装lerna项目的npm依赖包
npm install

# 用lerna完成整个项目的npm依赖包安装
lerna bootstrap
```

## config

```bash
# 拷贝配置文件到demo目录
cp .env.example packages/agora-classroom-sdk/.env

# 按照模板配置你的项目
```

## 如何使用自己的 AppId 和 Secret 生成 RtmToken

```bash
# 如果.env 文件中包含 `REACT_APP_AGORA_APP_ID` 和 `REACT_APP_AGORA_APP_CERTIFICATE` 配置，客户端会为你自动生成 RTM Token
REACT_APP_AGORA_APP_ID=
REACT_APP_AGORA_APP_CERTIFICATE=
```

## 运行

```bash
# 构建sdk并且运行项目
npm run dev
```

## 打包 Electron 客户端

```bash
# 构建 Web 资源
npm run build:demo
# 构建 Windows 客户端（需要先执行 npm run build:demo 构建 Web 资源）
npm run pack:electron:win
# 构建 Mac 客户端（需要先执行 npm run build:demo 构建 Web 资源）
npm run pack:electron:mac
```
