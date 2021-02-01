import {AgoraEduSDK} from 'agora-classroom-sdk'

AgoraEduSDK.config({
  appId: "",
})

AgoraEduSDK.launch(
  document.querySelector("#app"), {
    rtmToken: "",
    userUuid: "",
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