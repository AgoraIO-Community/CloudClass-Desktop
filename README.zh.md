> _Read this in another language: [English](README.md)_

> \*提示：这个分支处于开发阶段，暂不接受外部开发者的 PR

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
cp .env.example packages/agora-classroom-sdk/.env.dev

# 按照模板配置你的项目
```

## 如何使用自己的 AppId 和 Secret 生成 RtmToken

```bash
# 如果.env.dev 文件中包含 `REACT_APP_AGORA_APP_ID` 和 `REACT_APP_AGORA_APP_CERTIFICATE` 配置，客户端会为你自动生成 RTM Token
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
# 构建 Windows 客户端
npm run pack:electron:mac
# 构建 Mac 客户端
npm run pack:electron:win
```
