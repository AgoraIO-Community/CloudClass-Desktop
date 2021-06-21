import {AgoraEduSDK} from 'agora-classroom-sdk'


export default class App {
    constructor (elem) {
      if (!elem) return
      this.elem = elem
    }

    setupClassroom() {
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
          recordUrl: '<Your Record Page Url>',
          listener: (evt) => {
            console.log("evt", evt)
          }
        }
      )
    }
}