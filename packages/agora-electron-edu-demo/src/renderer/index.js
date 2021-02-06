import {AgoraEduSDK} from 'agora-classroom-sdk'

// set app dom to fill the page height
document.querySelector("#app").style.height = "100%"

const appId = ""

// temp rtm token generator
// https://webdemo.agora.io/token-builder/
// "uid" field in the builder must align with userUuid
let rtmToken = "", userUuid = ""

if(!appId || !rtmToken || !userUuid) {
  throw new Error("appId/rtmToken/userUuid are mandatory");
}


AgoraEduSDK.config({
  appId,
})

AgoraEduSDK.launch(
  document.querySelector("#app"), {
    rtmToken,
    userUuid,
    userName: "1212demo112",
    roomUuid: "12demo112",
    roleType: 1,
    roomType: 0,
    roomName: "demo-app",
    pretest: true,
    language: "zh",
    listener: (evt) => {
      console.log("evt", evt)
    }
  }
)