> *其他语言版本：[简体中文](README.zh.md)*

## Overview

|Scenario|Code entry|Description|
| ------ | ----- | ----- |
| One-to-one Classroom | [one-to-one.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/one-to-one.tsx) | An online teacher gives an exclusive lesson to only one student. |
| Small Classroom| [small-class.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/small-class.tsx) | A teacher gives an online lesson to at most 16 students. |
| Lecture Hall | [big-class.tsx](https://github.com/AgoraIO-Usecase/eEducation/blob/master/education_web/src/pages/classroom/big-class.tsx) | Thousands of students watch an online lecture together. |

### Online preview

[web demo](https://solutions.agora.io/education/web_v2/)

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

- Make sure you have made the preparations mentioned in the [Agora e-Education Guide](../README.md#prerequisites).
- Set up your Alibaba Cloud OSS Guide. For details, see [Alibaba Cloud OSS Guide](https://github.com/AgoraIO-Usecase/eEducation/wiki/Alibaba-Cloud-OSS-Guide).
- Rename `.env.example` to `.env.local` and configure the following parameters:
  - **(Required) The Agora App ID that you get**
  ```bash
  # Agora App ID
  REACT_APP_AGORA_APP_ID=agora appId
  REACT_APP_AGORA_LOG=true
  ELECTRON_START_URL=http://localhost:3000
  ```
  - **(Required) The Agora Customer ID and Customer Secret that you get**
  ```bash
  # agora http basic authorization customer_id, customer_certificate
  REACT_APP_AGORA_CUSTOMER_ID=customer_id
  REACT_APP_AGORA_CUSTOMER_CERTIFICATE=customer_certificate
  ```
  - **(Required) The Netless AppIdentifier that you get**
  ```bash
  REACT_APP_NETLESS_APP_ID=netless appId
  ```
  - **(Optional) OSS configurations for whiteboard courseware. Ignore these if you do not need this**
  ```bash
  # your oss bucket name
  REACT_APP_YOUR_OWN_OSS_BUCKET_NAME=your_oss_bucket_name
  # your oss bucket folder
  REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER=your_oss_bucket_folder
  # your oss bucket region
  REACT_APP_YOUR_OWN_OSS_BUCKET_REGION=your_bucket_region
  # your oss bucket access key
  REACT_APP_YOUR_OWN_OSS_BUCKET_KEY=your_bucket_ak
  # your oss bucket access secret key
  REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET=your_bucket_sk
  # your oss bucket endpoint
  REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE=your_cdn_accelerate_endpoint
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
   npm run build
   ```
   
## Run the Electron demo

### macOS
1. Install npm
   ```
   npm install
   ```
2. Locally run the Electron demo
   ```
   npm run electron  
   ```
3. Release the Electron demo
   ```
   npm run pack:mac
   ```
After running, a `release` folder that contains a dmg file will be generated. Open the dmg file and remove it to `Application` to install it.

### Windows
1. Install electron 7.1.14: First, replace `agora_electron` in `package.json` with the following code snippet:
   ```
   "agora_electron": {
     "electron_version": "7.1.2",
     "prebuilt": true,
     "platform": "win32",
     "arch": "ia32",
   },
   ```
   Manually install electron 7.1.14
   ```  
   npm install electron@7.1.14 --arch=ia32 --save-dev
   ```
2. Install npm
   ```
   npm install
   ```

3. Locally run the Electron demo
   ```
   npm run electron  
   ```
4. Release the Electron demo
   ```
   npm run pack:win
   ```
After running, a `release` folder that contains an exe file will be generated. Open the exe file as administrator to install it.

## FAQ
- If you find your localhost:3000 port already exists or has been used, you can change `ELECTRON_START_URL=http://localhost:3000` in `package.json` to an available port, and then run it again.  
