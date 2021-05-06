> *Read this in another language: [English](README.md)*

## 灵动课堂桌面版

## 安装依赖  
```bash
# 使用lerna与yarn自动安装依赖
yarn bootstrap
```

## config
修改`pacakges/agora-apaas-demo/src/components/app/index.js`
填入你的声网AppID与RTM Token, 请注意你用来生成RTM Token的Uid必须与userUuid字段一致
```javascript
    AgoraEduSDK.config({
    appId: "<YOUR APPID>",
    })
    AgoraEduSDK.launch(
    document.querySelector(`#${this.elem.id}`), {
        rtmToken: "<YOUR RTM TOKEN>",
        userUuid: "test",
        userName: "teacher",
        roomUuid: "4321",
        roleType: 1,
        roomType: 0,
        roomName: "demo-class",
        pretest: false,
        language: "en",
        startTime: new Date().getTime(),
        duration: 60 * 30,
        courseWareList: [],
        listener: (evt) => {
        console.log("evt", evt)
        }
    }
    )
```

## 启动
```bash
# 启动dev server
yarn run:apaas

# 之后打开 localhost:9000 即可
```