> _其他语言版本：[简体中文](README.zh.md)_

## Overview

| Scenario | Code entry | Description |
| --- | --- | --- |
| One-to-one Classroom | [one-to-one.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/one-to-one.tsx) | An online teacher gives an exclusive lesson to only one student. |
| Small Classroom | [small-class.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/small-class.tsx) | A teacher gives an online lesson to at most 16 students. |
| Lecture Hall | [big-class.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/big-class.tsx) | Thousands of students watch an online lecture together. |

### Core SDKs

- agora-rtc-sdk (agora rtc web sdk)
- agora-rtm-sdk (agora rtm web sdk)
- agora-electron-sdk ( agora electron sdk)
- white-web-sdk (netless web sdk)
- ali-oss (can be replaced with your own cloud oss sdk)
- agora page cloud recording (we recommend to integrate agora cloud recording on server side)

### Frontend tech utilities

- typescript 4.4.4
- react & react hooks & mobx
- electron 12.0.0 & electron-builder
- ui-kit & storybook
- Agora Edu Cloud Service

## Preparations

- Make sure you have made the preparations mentioned in the [Agora e-Education Guide](../README.md#prerequisites).
- Set up your Alibaba Cloud OSS Guide. For details, see [Alibaba Cloud OSS Guide](https://github.com/AgoraIO-Usecase/eEducation/wiki/Alibaba-Cloud-OSS-Guide).
- Rename `.env.example` to `.env` and configure the following parameters:

  - **(Required) The Agora App ID that you get**

  ```bash
  # Agora App ID
  REACT_APP_AGORA_APP_ID=agora appId
  REACT_APP_AGORA_APP_CERTIFICATE=agora app certificate
  ```

- Install Node.js LTS

## Run the Web demo

1. Install npm

   ```
   npm install
   ```

2. Locally run the Web demo
   ```
   npm run dev
   ```
3. Release the Web demo. Before the release, you need to change the `"homepage": "Your domain/address"` in `package.json`. For example, you need to change `https://solutions.agora.io/education/web` to `"homepage": "https://solutions.agora.io/education/web"`
   ```
   npm run build:demo
   ```

## Run the Electron demo

### macOS

1. Install npm
   ```
   npm install
   ```
2. Locally run the Electron demo
   ```
   npm run dev:electron
   ```
3. Release the Electron demo
   ```
   npm run pack:electron:mac
   ```
   After running, a `release` folder that contains a dmg file will be generated. Open the dmg file and remove it to `Application` to install it.

### Windows

1. Install electron 12.0.0: First, replace `agora_electron` in `package.json` with the following code snippet:
   ```
   "agora_electron": {
     "electron_version": "12.0.0",
     "prebuilt": true,
     "platform": "win32",
     "arch": "ia32",
   },
   ```
   Manually install electron 12.0.0
   ```
   npm install electron@12.0.0 --arch=ia32 --save-dev
   ```
2. Release the Electron demo
   ```
   npm run pack:electron:win
   ```
   After running, a `release` folder that contains an exe file will be generated. Open the exe file as administrator to install it.

## FAQ

- If you find your localhost:3000 port already exists or has been used, you can change `ELECTRON_START_URL=http://localhost:3000` in `package.json` to an available port, and then run it again.
- If you encounter an exception of `Error: Can't resolve'../../build/Release/agora_node_ext'` when packaging, you need to add configuration to the Webpack packaging configuration: `externals: {'agora-electron-sdk': 'commonjs2 agora-electron-sdk' }`
- Build error in Linux environment: `Error:unsupported platform!`, need to modify agora-classroom-sdk/package.json file configuration: `"agora_electron": {"electron_version": "12.0.0","prebuilt": true}` amended to `"agora_electron": {"electron_version": "12.0.0","prebuilt": true,"platform":"win32" | "darwin"}`
