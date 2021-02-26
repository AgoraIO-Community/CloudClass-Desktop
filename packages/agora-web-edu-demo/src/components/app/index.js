import {AgoraEduSDK} from 'agora-classroom-sdk'


export default class App {
    constructor (elem) {
      if (!elem) return
      this.elem = elem
    }

    setupClassroom() {
      AgoraEduSDK.config({
        appId: "<your appid>",
      })
      AgoraEduSDK.launch(
        document.querySelector(`#${this.elem.id}`), {
          rtmToken: "<your rtm token>",
          userUuid: "<your user id>",
          userName: "teacher",
          roomUuid: "321",
          roleType: 1,
          roomType: 0,
          roomName: "demo-class",
          pretest: false,
          language: "en",
          listener: (evt) => {
            console.log("evt", evt)
          }
        }
      )
    }
}