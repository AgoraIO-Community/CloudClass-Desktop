> *其他语言版本：[简体中文](README.zh.md)*

## Overview

|Scenario|Code entry|Description|
| ------ | ----- | ----- |
| One-to-one Classroom | [one-to-one.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/one-to-one.tsx) | An online teacher gives an exclusive lesson to only one student. |
| Small Classroom| [small-class.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/small-class.tsx) | A teacher gives an online lesson to at most 16 students. |
| Lecture Hall | [big-class.tsx](https://github.com/AgoraIO-Community/CloudClass-Desktop/tree/dev/apaas/1.0.1/src/pages/classroom/big-class.tsx) | Thousands of students watch an online lecture together. |

### Online preview

[web demo](https://solutions.agora.io/education/apaas/)

### Core SDKs
- agora-rtc-sdk (agora rtc web sdk)
- agora-rtm-sdk (agora rtm web sdk)
- agora-electron-sdk  ( agora electron sdk)
- white-web-sdk (netless web sdk)
- ali-oss (can be replaced with your own cloud oss sdk)
- agora cloud recording (we recommend to integrate agora cloud recording on server side)

### Frontend tech utilities
- typescript 3.8.3
- react & react hooks & mobx
- electron 7.1.14 & electron-builder
- material-ui
- Agora Edu Cloud Service

## Preparations

- Ensure your environment is well configured in Agora Console, if you are not sure what to do, please contact our technical support.
- Rename `.env.example` to `.env` and configure the following parameters:
  ```bash
# CONFIGS PROVIDED BY YOU
REACT_APP_AGORA_APP_ID=<YOUR APPID>
REACT_APP_NETLESS_APP_ID=<YOUR NETLESS APPID>
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
3. Create distribution Classroom SDK
   ```
   npm run pack:npm
   ```

After running, a `dist` folder that contains an edu_sdk.bundle.js will be generated.

## FAQ
- If you find your localhost:3000 port already exists or has been used, you can change `ELECTRON_START_URL=http://localhost:3000` in `package.json` to an available port, and then run it again.  
