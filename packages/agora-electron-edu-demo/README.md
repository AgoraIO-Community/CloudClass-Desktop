> *其他语言版本：[简体中文](README.zh.md)*

# Agora Electron Edu Demo QuickStart  

## Project Structure
  * mac permission plist file path: [entitlements](./entitlements)  
  * core project source code: [src](./src)
### integrate code 
[src/renderer/index.js](./src/renderer/index.js)
### code snippet  
```javascript
    //add this only dev
    AgoraEduSDK.setParameters(JSON.stringify({
        'edu.apiUrl': 'https://api-solutions-dev.bj2.agoralab.co'
    }));

    AgoraEduSDK.config({
        // Your Agora AppID
        appId: "",
    })

    AgoraEduSDK.launch(
        //Specifies the DOM node to mount
        document.querySelector(`#${this.elem.id}`), 
        {
            courseWareList: [],
            duration: 1800,
            language: "en",// Language 'zh'中午 'en'English
            personalCourseWareList: [],
            pretest: true,// recommend open pretest
            recordUrl: "https://webdemo.agora.io/flexible-classroom/test/20210428_811/#/record",
            region: "CN",//region
            roleType: 1,//roleType: 1 teacher, 2 student
            roomName: "demoedupaas",//room name
            roomType: 0,//roomType 0 1v1, 1 smallClass, 2: bigClass
            roomUuid: "demoedupaas0", //room's uid
            rtmToken: "",// Please use your rtmToken
            startTime: 1620305722926,
            userName: "1221",//nickname
            userUuid: "",//Please use your rtm uid
            listener: (evt) => {
            console.log("evt", evt)
            }
        }
    )
```

## Run the Electron demo

### macOS
1. At first time, you need to use `npm`/`yarn` to install dependencies. recommand to use `yarn`
   ```
   yarn add
   ```
2. Locally run the Electron demo
   ```
   yarn run dev  
   ```
3. Release the Electron demo
   ```
   yarn run dist:dir
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
   yarn add electron@7.1.14 --arch=ia32 --dev
   ```
2. At first time, you need to use `npm`/`yarn` to install dependencies. recommand to use `yarn`
   ```
   yarn add
   ```

3. Locally run the Electron demo
   ```
   yarn run dev  
   ```
4. Release the Electron demo
   ```
   yarn run dist:dir
   ```
After running, a `release` folder that contains an exe file will be generated. Open the exe file as administrator to install it.
