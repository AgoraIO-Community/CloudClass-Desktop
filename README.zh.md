> *Read this in another language: [English](README.md)*

## 概览

|支持场景|代码入口|功能描述|
| ---- | ----- | ----- |
|1 对 1 互动教学 | [one-to-one.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/one-to-one.tsx) | 1 个老师和 1 个学生默认以主播角色进入教室 |
|1 对 N 在线小班课| [small-class.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/small-class.tsx) | 1个老师和最多 16 个学生默认以主播角色进入教室 |
|互动直播大班课| [big-class.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/big-class.tsx) | 1个老师默认以主播角色进入教室，学生默认以观众角色进入教室，学生人数无限制 |

### 在线体验

[web demo](https://solutions.agora.io/education/apaas/)

### 使用的 SDK

- agora-rtc-sdk（声网 RTC Web SDK）
- agora-rtm-sdk（声网实时消息 Web SDK）
- agora-electron-sdk（声网官方 electron sdk）
- white-web-sdk（Netless 官方白板 sdk）
- ali-oss（可替换成你自己的 oss client）
- 声网云录制 （建议在服务端集成）

### 使用的技术
- typescript 3.8.3
- react & react hooks & mobx
- electron 7.1.14 & electron-builder
- material-ui
- Agora Edu 云服务

## 准备工作

- 请确保你已经完成灵动课堂项目指南中的[前提条件](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web)。
- 重命名 `.env.example` 为 `.env`，并配置以下参数：
  ```bash
# CONFIGS PROVIDED BY YOU
REACT_APP_AGORA_APP_ID=<YOUR APPID>
REACT_APP_NETLESS_APP_ID=<YOUR NETLESS APPID>
  ```

- 中国区客户推荐使用以下方式安装 npm 依赖包和 electron & node-sass 加速
  > 我们建议使用 npm 而非 yarn 或 cnpm
  ```
  # 仅适用于中国区客户
  # macOS
  export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
  export ELECTRON_CUSTOM_DIR="7.1.14"
  export SASS_BINARY_SITE="https://npm.taobao.org/mirrors/node-sass/"
  export ELECTRON_BUILDER_BINARIES_MIRROR="https://npm.taobao.org/mirrors/electron-builder-binaries/"

  # Windows
  set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
  set ELECTRON_CUSTOM_DIR=7.1.14
  set ELECTRON_BUILDER_BINARIES_MIRROR=https://npm.taobao.org/mirrors/electron-builder-binaries/
  set SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/

  npm install --registry=https://registry.npm.taobao.org
  ```

- 安装 Node.js LTS

## 运行和发布 Web demo

1. 安装 npm

   ```
   npm install
   ```

2. 本地运行 Web demo

   ```
   npm run dev
   ```
3. 生成Classroom SDK 

   ```
   npm run pack:npm
   ```

成功运行结束后会生成一个 dist 目录，里面包含一个edu_sdk.bundle.js文件

## 常见问题 
- 如果你在运行 Electron 时发现 localhost:3000 端口被占用，可以在 `package.json` 里找到 `ELECTRON_START_URL=http://localhost:3000` 修改成你本地可以使用的端口号。 
