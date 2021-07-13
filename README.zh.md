_[English](README.md) | 中文_

本文指导你运行灵动课堂 Web 示例项目。

## 如何运行示例项目

### 前提条件

- 准备工作：请确保完成灵动课堂[前提条件](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web)中所列的准备工作。

- 开发环境：

  - 安装 [Node.js 和 npm](https://www.npmjs.com/)

    ```bash
    # Install Node.js and npm globally
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

### 运行示例项目

1. 进入项目根目录，运行以下命令安装依赖。

   ```bash
   # Install global dev dependencies
   yarn
   # Install all dependencies via lerna and yarn
   yarn bootstrap
   ```

2. 请确保完成所有[灵动课堂前提条件](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web)，根据文档一步一步往下做，否则灵动课堂demo运行会有问题   

3. 在 `pacakges/agora-apaas-demo/src/components/app/index.js` 中传入你事先获取到的 [Agora App ID](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web#1-%E5%88%9B%E5%BB%BA-agora-%E9%A1%B9%E7%9B%AE%E5%B9%B6%E8%8E%B7%E5%8F%96-app-id-%E5%92%8C-app-%E8%AF%81%E4%B9%A6) 和[临时 RTM Token](https://docs.agora.io/cn/agora-class/agora_class_prep?platform=Web#5-%E7%94%9F%E6%88%90-rtm-token)。请确保你在 `launch` 方法中传的 `userUuid` 和你在临时 RTM Token 时使用的用户 ID 保持一致。

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

      > 参考 [校验用户权限](https://docs.agora.io/cn/Agora%20Platform/token) 了解如何获取 App ID 和 Token。你可以获取一个临时 token，快速运行示例项目。
   >
   > 生成 Token 使用的频道名必须和加入频道时使用的频道名一致。

   > 为提高项目的安全性，Agora 使用 Token（动态密钥）对即将加入频道的用户进行鉴权。
   >
   > 临时 Token 仅作为演示和测试用途。在生产环境中，你需要自行部署服务器签发 Token，详见[生成 Token](https://docs.agora.io/cn/Interactive%20Broadcast/token_server)。

4. 运行以下命令编译灵动课堂。编译完成后，在浏览器中打开 `localhost:9000`，即可进入灵动课堂。

   ```bash
   # start dev server
   yarn run:apaas
   ```

## 反馈

如果你有任何问题或建议，可以通过 [issue](https://github.com/AgoraIO-Community/CloudClass-Desktop/issues) 的形式反馈。

## 参考文档

- [声网灵动课堂产品概述](https://docs.agora.io/cn/agora-class/product_agora_class?platform=Web)
- [Classroom SDK API 参考](https://docs.agora.io/cn/agora-class/agora_class_api_ref_web?platform=Web)

## 相关资源

- 你可以先参阅 [常见问题](https://docs.agora.io/cn/faq)
- 如果你想了解更多官方示例，可以参考 [官方 SDK 示例](https://github.com/AgoraIO)
- 如果你想了解声网 SDK 在复杂场景下的应用，可以参考 [官方场景案例](https://github.com/AgoraIO-usecase)
- 如果你想了解声网的一些社区开发者维护的项目，可以查看 [社区](https://github.com/AgoraIO-Community)
- 若遇到问题需要开发者帮助，你可以到 [开发者社区](https://rtcdeveloper.com/) 提问
- 如果需要售后技术支持, 你可以在 [Agora Dashboard](https://dashboard.agora.io) 提交工单

## 代码许可

示例项目遵守 MIT 许可证。
