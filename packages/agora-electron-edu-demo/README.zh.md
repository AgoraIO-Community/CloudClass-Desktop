> *Read this in another language: [English](README.md)*

# Agora Electron Edu Demo QuickStart  

## 目录结构
  * electron mac授权文件路径: [entitlements](./entitlements)  
  * 项目代码路径: [src](./src)

### 主要集成代码 
[src/renderer/index.js](./src/renderer/index.js)
### 主要集成逻辑    
```javascript
import {AgoraEduSDK} from 'agora-classroom-sdk'

   //开发环境添加
   AgoraEduSDK.setParameters(JSON.stringify({
      'edu.apiUrl': 'https://api-solutions-dev.bj2.agoralab.co'
   }));

   AgoraEduSDK.config({
      // 你的声网appID
      appId: "",
   })

   AgoraEduSDK.launch(
      //指定挂载的dom节点
      document.querySelector(`#${this.elem.id}`), 
      {
         courseWareList: [],
         duration: 1800,
         language: "en",//语言 ‘zh’中文 ‘en‘英文
         personalCourseWareList: [],
         pretest: true,// 推荐默认开启设备预检
         recordUrl: "https://webdemo.agora.io/flexible-classroom/test/20210428_811/#/record",
         region: "CN",//区域
         roleType: 1,//角色类型
         roomName: "demoedupaas",//房间名称
         roomType: 0,//房间类型 
         roomUuid: "demoedupaas0", //房间uid
         rtmToken: "",// 请使用你的rtmToken
         startTime: 1620305722926,
         userName: "1221",//用户昵称
         userUuid: "",//请使用你的rtm uid
         listener: (evt) => {
         console.log("evt", evt)
         }
      }
   )
```

## 运行和发布 Electron demo

### macOS
1. 国内用户首次需要配置环境变（海外用户无需配置）
   打开mac终端以此执行下面2条命令
   ```
   export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
   ```
   ```
    export ELECTRON_CUSTOM_DIR="7.1.14"
   ```
2. 首次需要npm/yarn安装依赖 下面推荐使用yarn

   ```
   yarn add
   ```
3. 本地运行 Electron demo

   ```
   yarn run dev
   ```

4. 发布 Electron demo

   ```
   yarn run dist:dir
   ```

成功运行结束后会生成一个 release 目录，里面包含一个 dmg 安装文件，正常打开移动到 Application 目录即可完成安装，然后可以执行程序。 

### Windows
1. 首次安装 electron 7.1.14: 先找到 `package.json` 里的 `agora_electron` 按照如下结构替换
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
   yarn add electron@7.1.14 --arch=ia32 --dev
   ```
2. 首次需要npm/yarn安装依赖，下面推荐使用yarn
   ```
   yarn install
   ```

3. 本地运行 Electron demo

   ```
   yarn run dev
   ```

4. 发布 Electron demo

   ```
   yarn run dist:dir
   ```

成功运行结束后会生成一个 release 目录，里面包含一个 exe 安装程序，请使用 Windows 管理员身份打开，即可完成安装，然后可以执行程序。
