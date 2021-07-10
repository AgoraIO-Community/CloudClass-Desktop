## 可以通过以下方式引用 WebSDK:

1.安装

```
npm install easemob-websdk --save
```
2. 先引入 ，再访问 WebIM 。
```
import websdk from 'easemob-websdk'
```
注：该方式只引用了 Web SDK ，仍需在项目里配置 WebIMConfig 文件内的参数，用于实例化 websdk。

配置
在 webim.config.js 文件内进行以下配置：
```
socketServer: 'im-api.easemob.com',            // websocket Server地址，对于在console.easemob.com创建的appKey，固定为该值

restServer: 'http://a1.easemob.com',          // rest Server地址，对于在console.easemob.com创建的appkey，固定为该值

appkey: 'easemob-demo#chatdemoui',        // App key

https : false,                            // 是否使用https

isHttpDNS: true,                         //防止DNS劫持从服务端获取XMPPUrl、restUrl

isMultiLoginSessions: false,              // 是否开启多页面同步收消息，注意，需要先联系商务开通此功能

isAutoLogin: true,                        // 自动出席，（如设置为false，则表示离线，无法收消息，需要在登录成功后手动调用conn.setPresence()才可以收消息）

isDebug: false,                           // 打开调试，会自动打印log，在控制台的console中查看log

autoReconnectNumMax: 2,                   // 断线重连最大次数

autoReconnectInterval: 2,                 // 断线重连时间间隔

heartBeatWait: 4500,                       // 使用webrtc（视频聊天）时发送心跳包的时间间隔，单位ms

delivery: true,                           // 是否发送已读回执
```
注：建议 xmppURL、apiURL、https 三个参数统一，否则 IE9 以下会报拒绝访问的错误。

例：
```
https: false
socketServer: 'im-api.easemob.com',

restServer: 'http://a1.easemob.com',

appkey: 'easemob-demo#chatdemoui',

https : false, 

isMultiLoginSessions: false

isAutoLogin: true

https: true
socketServer: 'im-api.easemob.com',

restServer: 'https://a1.easemob.com',

appkey: 'easemob-demo#chatdemoui',

https : true, 

isMultiLoginSessions: false 

isAutoLogin: true
```
兼容性
兼容V1.1.2
Web SDK V1.4.5 向下兼容 V1.1.2。如果直接用 V1.1.2 的 Demo 嵌入 V1.4.5 的 SDK ，需要修改旧的 webim.config.js，在第一行WebIM.config = {的前面插入一行var WebIM = {};。完成后，示例如下：
```
var WebIM = {};
  WebIM.config = {
```
兼容V1.1.1
Web SDK V1.4.5 向下兼容 V1.1.1。从V1.1.1升级到V1.4.5时，需要做如下操作：

第1步：修改引入的 SDK 文件
1. 下载 Web SDK V1.4.5 并解压后，将 /sdk/dist/websdk-1.4.5.js 和 /sdk/disk/websdk.shim.js 拷贝到系统相应的目录下。

2. 在原来的引用 SDK 的 html 文件中增加一行代码 window.WebIM = {}; ，并使用上述两个文件替换原来引用的 SDK 的 js 文件。

替换前：

<!--sdk相关的js-->
<script type='text/javascript' src='static/sdk/strophe.js'></script>
<script type='text/javascript' src='static/sdk/easemob.im-1.1.1.js'></script>
<script type='text/javascript' src='static/sdk/easemob.im.shim.js'></script>
<!--webim相关配置-->
<script type='text/javascript' src='static/js/easemob.im.config.js'></script>
替换后：

<!--sdk相关的js-->
<script type='text/javascript' src='static/sdk/strophe.js'></script>
<script>
    window.WebIM = {};       // 这行代码需要加在引用strophe.js文件的代码后面
</script>
<script type='text/javascript' src='static/sdk/websdk-1.4.5.js'></script>
<script type='text/javascript' src='static/sdk/websdk.shim.js'></script>
<!--webim相关配置-->
<script type='text/javascript' src='static/js/easemob.im.config.js'></script>
3. 将 easemob.im.config.js 文件中的参数 multiResources 修改为 isMultiLoginSessions 。

第2步：修改 websdk-1.4.5.js 文件
1. 在 SDK 文件下搜索//class，将下面的connection = function connection(options) 改成window.WebIM.connection = function connection(options)

2. 在 SDK 文件下搜索connection.prototype.registerUser = function (options)，在上面一行添加var connection = window.WebIM.connection;