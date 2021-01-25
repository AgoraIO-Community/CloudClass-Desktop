> *Read this in another language: [English](README.md)*

# Agora Electron Edu Demo QuickStart  

## 目录结构
  * 教育sdk路径：[lib/agora-edu-sdk](./lib/agora-edu-sdk/index.js)
  * electron mac授权文件路径: [entitlements](./entitlements)  
  * 项目代码路径: [src](./src)

### 主要集成代码 
[src/renderer/index.js](./src/renderer/index.js)
### 主要集成逻辑    
```javascript
import {AgoraEduSDK} from 'agora-edu-sdk'

AgoraEduSDK.config({
  // 你的声网appID
  appId: "",
})

AgoraEduSDK.launch(
  // 一个存在的dom节点
  document.querySelector("#app"), {
    rtmToken: "", // 请使用你的rtmToken
    userUuid: "", // 请使用你的rtm uid
    userName: "1212demo112", // 用户昵称
    roomUuid: "12demo112", // 房间uid
    roleType: 1, // 角色
    roomType: 0, // 房间类型0: 1v1, 1: 小班课, 2: 大班课
    roomName: "demo-app", // 房间名称
    pretest: true, // 推荐默认开启设备预检
    language: "zh", // 语言 "zh"中文 "en"英文
    listener: (evt) => {
      console.log("evt", evt)
    }
  }
)
```

## 运行和发布 Electron demo

### macOS
1. 安装 npm

   ```
   npm install
   ```
2. 本地运行 Electron demo

   ```
   npm run dev
   ```

2. 发布 Electron demo

   ```
   npm run dist:dir
   ```

成功运行结束后会生成一个 release 目录，里面包含一个 dmg 安装文件，正常打开移动到 Application 目录即可完成安装，然后可以执行程序。 

### Windows
1. 安装 electron 7.1.14: 先找到 `package.json` 里的 `agora_electron` 按照如下结构替换
   ```
   "agora_electron": {
     "electron_version": "7.1.2",
     "prebuilt": true,
     "platform": "win32",
     "arch": "ia32"
   },
   ```
   再手动安装 electron 7.1.14
   ```
   npm install electron@7.1.14 --arch=ia32 --save-dev
   ```
2. 安装 npm
   ```
   npm install
   ```

3. 本地运行 Electron demo

   ```
   npm run dev
   ```

4. 发布 Electron demo

   ```
   npm run dist:dir
   ```

成功运行结束后会生成一个 release 目录，里面包含一个 exe 安装程序，请使用 Windows 管理员身份打开，即可完成安装，然后可以执行程序。
