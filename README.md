_English | [中文](README.zh.md)_

## CloudClass Desktop

This guide shows you how to run the CloudClass Web Demo.

## How to run the sample project

### Install  
```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

### Config
Modify file content in `pacakges/agora-apaas-demo/src/components/app/index.js`
Fill in your Agora APP ID and RTM Token. Note the uid you used to sign RTM token needs to match with userUuid.
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
   > See [Set up Authentication](https://docs.agora.io/en/Agora%20Platform/token) to learn how to get an App ID and access token. You can get a temporary access token to quickly try out this sample project.
   >
   > The Channel name you used to generate the token must be the same as the channel name you use to join a channel.

   > To ensure communication security, Agora uses access tokens (dynamic keys) to authenticate users joining a channel.
   >
   > Temporary access tokens are for demonstration and testing purposes only and remain valid for 24 hours. In a production environment, you need to deploy your own server for generating access tokens. See [Generate a Token](https://docs.agora.io/en/Interactive%20Broadcast/token_server) for details.

## Run
```bash
# start dev server
yarn run:apaas

# open localhost:9000
```

## Feedback

If you have any problems or suggestions regarding the sample projects, feel free to file an [issue](https://github.com/AgoraIO-Community/CloudClass-Desktop/issues).

## Related resources

- Check our [FAQ](https://docs.agora.io/en/faq) to see if your issue has been recorded.
- Dive into [Agora SDK Samples](https://github.com/AgoraIO) to see more tutorials
- Take a look at [Agora Use Case](https://github.com/AgoraIO-usecase) for more complicated real use case
- Repositories managed by developer communities can be found at [Agora Community](https://github.com/AgoraIO-Community)
- If you encounter problems during integration, feel free to ask questions in [Stack Overflow](https://stackoverflow.com/questions/tagged/agora.io)

## License

The sample projects are under the MIT license.