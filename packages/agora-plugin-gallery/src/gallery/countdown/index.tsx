import 'promise-polyfill/src/polyfill';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import type { IAgoraExtApp, AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import {
  Button,
  Countdown,
  Input,
  transI18n,
  I18nProvider,
  changeLanguage
} from '~ui-kit'
import classnames from 'classnames'
import { EduRoleTypeEnum } from 'agora-rte-sdk';
// import { I18nProvider, transI18n, changeLanguage } from '../../gallery-ui-kit/components/i18n'

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
            pluginStore.setPlay(false)
            pluginStore.setShowSetting(true)
            pluginStore.changeRoomProperties({
              state: '2',
              pauseTime: (Math.floor(Date.now() / 1000)).toString(),
            })
          }}
        >{transI18n('countdown.restart')}</Button>
      </div>
      <div className="numbers-wrap">
        <Countdown
          style={{ transform: 'scale(0.4)' }}
          endDate={pluginStore.result}
          theme={2}
          type={2}
          timeUnit={[':', ':', ':']}
          play={pluginStore.play}
        />
      </div>    
      {pluginStore.showSetting ? (
        <div className="setting-wrap">
          <div>
            <Input
              value={pluginStore.number}
              onChange={(e: any) => { pluginStore.setNumber(e.target.value.replace(/\D+/g, '')) }}
              suffix={<span style={{
                color: (pluginStore.number != undefined && pluginStore.number <= 3600) ? '#333' : '#F04C36'
              }}>({transI18n('countdown.seconds')})</span>}
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
                pluginStore.setPlay(true)
                pluginStore.changeRoomProperties({
                  state: '1',
                  startTime: (Math.floor(Date.now() / 1000)).toString(),
                  duration: pluginStore.number != undefined ? pluginStore.number.toString() : '0',
                  commonState: 1
                })
              }}
              disabled={pluginStore.number !== undefined && pluginStore.number > 3600}
            >{transI18n('countdown.start')}</Button>
          </div>
        </div>
      ) : null}

    </div>
  )
})


export class AgoraExtAppCountDown implements IAgoraExtApp {

  appIdentifier = "io.agora.countdown"
  appName = 'countdown'
  width = 258
  height = 168 // 开始倒计时后高度为 55

  store?: PluginStore

  constructor(public readonly language: any = 'en') {
    changeLanguage(this.language)
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this.store = new PluginStore(ctx, handle)
    this.height = this.store.showSetting ? 168 : 55
    ReactDOM.render((
      <I18nProvider language={this.language}>
        <Provider store={this.store}>
          <App />
        </Provider>
      </I18nProvider>
    ),
      dom
    );
  }
  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void {
    this.height = this.store?.showSetting ? 168 : 55
    this.store?.onReceivedProps(properties, cause)
  }
  extAppWillUnload(): void {
  }
}




