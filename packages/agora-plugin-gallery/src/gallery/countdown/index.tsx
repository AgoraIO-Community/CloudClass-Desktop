import 'promise-polyfill/src/polyfill';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import type { IAgoraExtApp, AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import { Button } from '../../gallery-ui-kit/components/button'
import { Countdown } from '../../gallery-ui-kit/components/countdown'
import { Input } from '../../gallery-ui-kit/components/input'
import classnames from 'classnames'
import { EduRoleTypeEnum } from 'agora-rte-sdk';

const App = observer(() => {
  const pluginStore = usePluginStore()

  useEffect(() => {
  }, [])

  return (
    <div 
      style={{
        width: '100%',
        height: '100%'
      }}
      className={classnames({
        [`countdown-modal`]: 1,
        [`countdown-modal-hover`]: !pluginStore.showSetting && pluginStore.context.localUserInfo.roleType === EduRoleTypeEnum.teacher
      })}
    >
      <div className="restart-wrap">
        <Button
          onClick={() => {
            pluginStore.setResult(0)
            pluginStore.setShowSetting(true)
            pluginStore.changeRoomProperties({
              state: '2',
              pauseTime: (Math.floor(Date.now() / 1000)).toString(),
            })
          }}
        >restart</Button>
      </div>

      <Countdown
        style={{ transform: 'scale(0.4)' }}
        endDate={pluginStore.result}
        theme={2}
        type={2}
        timeUnit={[':', ':', ':']}
      />
      {pluginStore.showSetting ? (
        <div style={{ width: '100%' }}>
          <div>
            <Input
              value={pluginStore.number}
              onChange={(e: any) => { pluginStore.setNumber(e.target.value.replace(/\D+/g, '')) }}
              suffix={<span style={{
                color: (pluginStore.number != undefined && pluginStore.number <= 3600) ? '#333' : '#F04C36'
              }}>(seconds)</span>}
              maxNumber={3600}
              style={{
                color: (pluginStore.number != undefined && pluginStore.number <= 3600)  ? '#333' : '#F04C36'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
            <Button
              onClick={() => {
                const result = Date.now() + (pluginStore.number != undefined ? pluginStore.number : 0) * 1000
                pluginStore.setResult(result)
                pluginStore.setShowSetting(false)
                pluginStore.changeRoomProperties({
                  state: '1',
                  startTime: (Math.floor(Date.now() / 1000)).toString(),
                  duration: pluginStore.number != undefined ? pluginStore.number.toString() : '0',
                  commonState: 1
                })
              }}
              disabled={pluginStore.number !== undefined && pluginStore.number > 3600}
            >Sure</Button>
          </div>
        </div>
      ) : null}

    </div>
  )
})


export class AgoraExtAppCountDown implements IAgoraExtApp {
  appIdentifier = "io.agora.countdown"
  appName = "Count Down"
  width = 258
  height = 240

  store?: PluginStore

  constructor() {
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this.store = new PluginStore(ctx, handle)
    ReactDOM.render((
      <Provider store={this.store}>
        <App />
      </Provider>
    ),
      dom
    );
  }
  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void {
    this.store?.onReceivedProps(properties, cause)
  }
  extAppWillUnload(): void {
    this.store?.changeRoomProperties({
      commonState: 0
    })
    this.store?.cleanup()
  }
}




