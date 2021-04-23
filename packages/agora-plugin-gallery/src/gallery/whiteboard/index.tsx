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
  },[])

  return (
    <div style={{display:'flex', width: '100%', height: '100%'}}>
    </div>
  )
})


export class AgoraExtAppWhiteboard implements IAgoraExtApp {
  appIdentifier = "io.agora.whiteboard"
  appName = "Whiteboard App"
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




