> *Read this in another language: [English](README.md)*

本文指导你运行灵动课堂 Web 示例项目。

## 前提条件

- 准备工作：请确保完成灵动课堂[前提条件](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web)中所列的准备工作。

- 开发环境：

  - 安装 [Node.js 和 npm](https://www.npmjs.com/)

    ```bash
    Install Node.js and npm globally
    npm install -g npm
    # Check Node.js version
    node -v
    # Check npm version
    npm -v
    ```

  - 安装 [yarn](https://yarnpkg.com/)

    ```bash
    # Install yarn
    npm install yarn -g
    # Check yarn version
    yarn -v
    ```

- 安装最新稳定版 [Chrome 浏览器](https://www.google.cn/chrome/)。

## 运行示例项目

1. 进入项目根目录，运行以下命令安装依赖。

   ```bash
   # Install global dev dependencies
   yarn
   # Install all dependencies via lerna and yarn
   yarn bootstrap
   ```

2. 在 `pacakges/agora-apaas-demo/src/components/app/index.js` 中传入你事先获取到的 [Agora App ID](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web#1-%E5%88%9B%E5%BB%BA-agora-%E9%A1%B9%E7%9B%AE%E5%B9%B6%E8%8E%B7%E5%8F%96-app-id-%E5%92%8C-app-%E8%AF%81%E4%B9%A6) 和[临时 RTM Token](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web#5-%E7%94%9F%E6%88%90-rtm-token)。请确保你在 `launch` 方法中传的 `userUuid` 和你在临时 RTM Token 时使用的用户 ID 保持一致。

   ```js
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

3. 运行以下命令编译灵动课堂。编译完成后，在浏览器中打开 `localhost:9000`，即可进入灵动课堂。

   ```bash
   # start dev server
   yarn run:apaas
   ```

## 联系我们

- 如需阅读完整的文档和 API 注释，你可以访问[声网开发者中心](https://docs.agora.io/cn/)。
- 如果在集成中遇到问题，你可以到[声网开发者社区](https://dev.agora.io/cn/)提问。
- 如果有售前咨询问题，你可以拨打 400 632 6626，或加入官方Q群 12742516 提问。
- 如果需要售后技术支持，你可以在 [Agora 控制台](https://dashboard.agora.io/)提交工单。
- 如果发现了示例代码的 bug，欢迎提交 [issue](https://github.com/AgoraIO/Rtm/issues)。

## 代码许可

The MIT License (MIT).
