> *Read this in another language: [English](README.md)*

> *提示：这个分支处于开发阶段，暂不接受外部开发者的PR

## 云课堂Electron App  
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
cp .env.example packages/agora-rte-demo/.env

# 按照模板配置你的项目
```

## 运行
```bash
# 构建sdk并且运行项目
npm run dev
```

+ [Electron 项目快速开始](./packages/agora-electron-edu-demo/README.zh.md)