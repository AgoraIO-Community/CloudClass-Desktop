import {AgoraEduSDK} from 'agora-classroom-sdk'


export default class App {
    constructor (elem) {
      if (!elem) return
      this.elem = elem
    }

    setupClassroom() {
      AgoraEduSDK.config({
        appId: "f488493d1886435f963dfb3d95984fd4",
      })
      AgoraEduSDK.launch(
        document.querySelector(`#${this.elem.id}`), {
          rtmToken: "006f488493d1886435f963dfb3d95984fd4IABITbbeWgBC109/7I9Bnb2neHeib9ORVthUUjblt2rj4gx+f9gAAAAAEAA67mKyJKxeYAEA6AMkrF5g",
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
    }
}