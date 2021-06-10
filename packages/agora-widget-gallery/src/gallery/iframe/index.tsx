import * as React from 'react';
import type {AgoraWidgetHandle, AgoraWidgetContext, IAgoraWidget} from 'agora-edu-core'
import { observer, Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store';
import { usePluginStore } from './hooks';
import { get } from 'lodash';

type AppProps = {
  orgName: string;
  appName: string;
}

const App: React.FC<AppProps> = observer((props) => {
  const pluginStore = usePluginStore()
  const {localUserInfo, roomInfo} = pluginStore.context
  const chatroomId = get(pluginStore.props, 'chatroomId')
  const orgName = get(pluginStore.props, 'orgName')
  const appName = get(pluginStore.props, 'appName')

  return (
    <div id="netless-white" style={{display:'flex', width: '100%', height: '100%'}}>
      <iframe style={{width:'100%',height:'100%'}} src={`https://cloudclass-agora-test.easemob.com/?chatRoomId=${chatroomId}&roomUuid=${roomInfo.roomUuid}&roleType=${localUserInfo.roleType}&userUuid=${localUserInfo.userUuid}&avatarUrl=${'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png'}&nickName=${localUserInfo.userName}&org=${orgName}&apk=${appName}`}></iframe>
    </div>
  )
})


export class AgoraIFrameWidget implements IAgoraWidget {
  widgetId = "io.agora.widget.iframe"
  store?:PluginStore

  constructor(){
  }

  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, props:any): void {
    this.store = new PluginStore(ctx, props)
    ReactDOM.render((
      <Provider store={this.store}>
        <App {...props} />
      </Provider>
    ),
      dom
    );
  }
  widgetRoomPropertiesDidUpdate(properties:any, cause:any): void {
  }
  widgetWillUnload(): void {
  }
}