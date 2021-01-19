> *其他语言版本：[简体中文](README.zh.md)*

# Agora Electron Edu Demo QuickStart  

## Project Structure
  * agora-edu-sdk: [lib/agora-edu-sdk](./lib/agora-edu-sdk/index.js)
  * mac permission plist file path: [entitlements](./entitlements)  
  * core project source code: [src](./src)
### integrate code 
[src/renderer/index.js](./src/renderer/index.js)
### code snippet  
```javascript
import {AgoraEduSDK} from 'agora-edu-sdk'

AgoraEduSDK.config({
  // Your Agora AppID
  appId: "",
})

AgoraEduSDK.launch(
  // valid dom node
  document.querySelector("#app"), {
    rtmToken: "", // your valid rtm token
    userUuid: "", // your rtm uid
    userName: "1212demo112", // username
    roomUuid: "12demo112", // roomUuid
    roleType: 1, // roleType: 1 teacher, 2 student
    roomType: 0, // roomType 0 1v1, 1 smallClass, 2: bigClass
    roomName: "demo-app", // room name
    pretest: true, // recommend open pretest
   language: "zh", // language "zh"中文 "en" English
    listener: (evt) => { // callback
      console.log("evt", evt)
    }
  }
)
```

## Run the Electron demo

### macOS
1. Install npm
   ```
   npm install
   ```
2. Locally run the Electron demo
   ```
   npm run dev  
   ```
3. Release the Electron demo
   ```
   npm run dist:dir
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
   npm run dev  
   ```
4. Release the Electron demo
   ```
   npm run dist:dir
   ```
After running, a `release` folder that contains an exe file will be generated. Open the exe file as administrator to install it.
