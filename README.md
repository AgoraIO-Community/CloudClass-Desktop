> *其他语言版本：[简体中文](README.zh.md)*

## CloudClass Desktop

## Install  
```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## config
Modify file content in `pacakges/agora-apaas-demo/src/components/app/index.js`
Fill in your Agora APPID and RTM Token. Note the uid you used to sign RTM token needs to match with userUuid.
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

## run
```bash
# start dev server
yarn run:apaas

# open localhost:9000
```