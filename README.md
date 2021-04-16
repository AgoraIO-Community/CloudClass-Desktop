> *其他语言版本：[简体中文](README.zh.md)*

# This branch is still in development stage, PR is not accepted at this stage.
## CloudClass Desktop

## Install  
```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## config
```bash
# copy config template to agora-rte-demo project
cp .env.example packages/agora-classroom-sdk/.env

# fill the config with your agora.io development environment
```

## run
修改src/ui-components/launch/index.tsx，添加自己计算的rtm token (rtm token可以通过 https://webdemo.agora.io/token-builder/ 计算)
```javascript
const mountLaunch = useCallback(async (dom: any) => {
  if (dom) {
    AgoraEduSDK.config({
      appId: `${REACT_APP_AGORA_APP_ID}`,
    })
    launchOption.rtmToken = "<YOUR RTM TOKEN>"
    roomRef.current = await AgoraEduSDK.launch(dom, {
      ...launchOption,
      listener: (evt: AgoraEduEvent) => {
        console.log("launch#listener ", evt)
        if (evt === AgoraEduEvent.destroyed) {
          history.push('/')
        }
      },
      appPlugins: [new AgoraExtAppTest()]
    })
  }
  return () => {
    if (roomRef.current) {
      roomRef.current.destroy()
    }
  }
}, [AgoraEduSDK])
```


```bash
yarn dev
```

## build classroom sdk
```bash
yarn release:classroom:sdk
```

+ [Electron QuickStart](./packages/agora-electron-edu-demo/README.md)
