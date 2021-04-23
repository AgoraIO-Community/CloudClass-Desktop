import 'promise-polyfill/src/polyfill';
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import type {IAgoraExtApp, AgoraExtAppHandle, AgoraExtAppContext} from 'agora-edu-core'
import {BoardClient} from './board'

const App = observer(() => {
  const pluginStore = usePluginStore()
  useEffect(() => {
    let client = new BoardClient({
      identity: "host",
      appIdentifier: "<netless app identifier>",
      dependencies: pluginStore.context.dependencies
    })
    client.join({
      uuid: "<netless room uuid>",
      roomToken: "<netless roomToken>"
    }).then(() => {
      let container = document.getElementById("netless-white") as HTMLDivElement
      if(container) {
        client.room.bindHtmlElement(container);
      }
    })
  },[])

  return (
    <div id="netless-white" style={{display:'flex', width: '100%', height: '100%'}}>
    </div>
  )
})


export class AgoraExtAppWhiteboard implements IAgoraExtApp {
  appIdentifier = "io.agora.whiteboard"
  appName = "Whiteboard"
  width = 640
  height= 480

  store?:PluginStore

  constructor(){
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this.store = new PluginStore(ctx, handle)
    ReactDOM.render((
      <Provider store={this.store}>
        <App/>
      </Provider>
    ),
      dom
    );
  }
  extAppRoomPropertiesDidUpdate(properties:any, cause:any): void {
    this.store?.onReceivedProps(properties, cause)
  }
  extAppWillUnload(): void {
  }
}




