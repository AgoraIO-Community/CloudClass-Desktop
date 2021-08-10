import 'promise-polyfill/src/polyfill';
import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { PluginStore, c2h } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import type { IAgoraExtApp, AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import {
  Button,
  Table,
  TableHeader,
  Col,
  Row,
  Input,
  transI18n,
  I18nProvider,
  changeLanguage
} from '~ui-kit'
import classnames from 'classnames'
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import "./index.css"
import reduceSvg from './reduce.svg';
import addSvg from './add.svg';
// import { I18nProvider, transI18n, changeLanguage } from '../../gallery-ui-kit/components/i18n'

const App = observer(({ onHeight, onTitle, lang }: { onHeight: (height: number) => void, onTitle: (title: string) => void, lang:'zh'|'en' }) => {
  const pluginStore = usePluginStore()

  useEffect(() => {
    onHeight(pluginStore.height || 0)
  }, [pluginStore.height])

  const {events} = pluginStore.context

  useEffect(() => {
    events.global.subscribe((state:any) => {
      pluginStore.updateGlobalContext(state)
    })
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
      className={classnames({
        [`vote-modal`]: 1,
        [`vote-language-en`]: lang === 'en'
      })}
    >
      {pluginStore.status !== 'config' && pluginStore.context.localUserInfo.roleType !== EduRoleTypeEnum.teacher ? <span className='vote-title-tip'>{transI18n(pluginStore.mulChoice ? 'vote.mul-sel' : 'vote.single-sel')}</span> : null}
      <div>
        <textarea
          value={pluginStore.title}
          className="vote-title"
          placeholder={transI18n('vote.input-tip')}
          disabled={pluginStore.status !== 'config'}
          style={pluginStore.status !== 'config' ? { height: c2h(pluginStore.title?.length || 0) + 'px' } : undefined}
          maxLength={100}
          onChange={(e: any) => { pluginStore.status === 'config' && (pluginStore.title = e.target.value) }}
        />
        {pluginStore.status === 'config' ? <>
          <span className='vote-limit' >{pluginStore.title?.length || 0}/100</span>
          <div className="vote-mulchoice" >
            <label ><input type="radio" name='sel' checked={!pluginStore.mulChoice} onChange={() => { }} onClick={() => { pluginStore.status === 'config' && (pluginStore.mulChoice = false) }} /><span></span>{transI18n('vote.single-sel')}</label>
            <label ><input type="radio" name='sel' checked={pluginStore.mulChoice} onChange={() => { }} onClick={() => { pluginStore.status === 'config' && (pluginStore.mulChoice = true) }} /><span></span>{transI18n('vote.mul-sel')}</label>
          </div>
        </> : null}
        <Table>
          {pluginStore.answer?.map((col: string, idx: number) => (
            <Row key={idx} className={pluginStore.status !== 'config' && pluginStore.status !== 'answer'?'vote-process-show':''} style={{ padding: pluginStore.status==='config'?'0':'0 20px 0 0' }}>
              {pluginStore.status === 'end' || pluginStore.status === 'info' ? <span
                style={{
                  color: '#677386',
                  fontSize: '14px',
                  position: 'relative',
                  top: '9px',
                  display: 'inline-block',
                  width: '30px',
                  textAlign: 'center'
                }}>{idx + 1}.</span> : (pluginStore.status === 'answer' ?
                <label className="vote-item-prefix">
                  <input
                    type="radio"
                    checked={pluginStore.selAnswer?.includes(col)} onChange={() => { }}
                    onClick={() => { pluginStore.changeSelAnswer(col, pluginStore.mulChoice) }}
                  />
                  <span className={pluginStore.mulChoice?'vote-item-mul':''} ></span>
                </label>
                : null)}
              <Input
                className="vote-item"
                prefix={pluginStore.status === 'config' ? <span
                    style={{
                      color: '#677386',
                      fontSize: '14px'
                    }}>{idx + 1}.</span> : null}
                suffix={pluginStore.status === 'end' || pluginStore.status === 'info' ? <span style={{
                  color: '#677386',
                  fontSize: '14px'
                }}>{pluginStore.answerInfo ? pluginStore.answerInfo[idx] : ''}</span> : null}
                value={pluginStore.answer && pluginStore.answer[idx]}
                disabled={pluginStore.status !== 'config'}
                placeholder={transI18n('vote.item-tip')}
                onChange={(e: any) => { pluginStore.changeAnswer(idx, e.target.value) }}>
              </Input>
              {pluginStore.status === 'info' || pluginStore.status === 'end' ? <span className="vote-process" style={{ width: 'calc(100% - 50px)' }}><span
                style={{ width: pluginStore.answerInfo ? pluginStore.answerInfo[idx].split(' ')[1] : '0' }} ></span></span> : null}
            </Row>
          ))}
        </Table>
      </div>
      {pluginStore.ui?.includes('subs') ? <div className={pluginStore.status === 'config' ? "vote-submit" : "vote-submit vote-vote"}>
        <span onClick={() => {
          pluginStore.addAnswer()
        }} style={{ backgroundImage: `url(${addSvg})`, visibility: (pluginStore.status !== 'config') || ((pluginStore.answer?.length || 4) > 4) ? 'hidden' : 'visible' }} ></span>
        <Button
          disabled={pluginStore.status === 'config' ? ( !pluginStore.answer || !pluginStore.title || pluginStore.answer.includes('') || ([...new Set(pluginStore.answer)].length !== pluginStore.answer.length))
            : (pluginStore.status === 'answer' ? (pluginStore.selAnswer?.length || 0) === 0 : false)}
          onClick={() => {
            pluginStore.onSubClick();
          }}
        >{transI18n(pluginStore?.buttonName || '')}</Button>
        <span onClick={() => {
          pluginStore.subAnswer()
        }} style={{ backgroundImage: `url(${reduceSvg})`, visibility: (pluginStore.status !== 'config') || ((pluginStore.answer?.length || 4) < 3) ? 'hidden' : 'visible' }}></span>
      </div> : null}
    </div>
  )
})


export class AgoraExtAppVote implements IAgoraExtApp {
  appIdentifier = "io.agora.vote"
  appName = 'vote'
  className = 'vote-dialog'
  width = 360
  height = 283
  title = transI18n('vote.appName')

  store?: PluginStore

  constructor(public readonly language: any = 'en') {
    changeLanguage(this.language)
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this.store = new PluginStore(ctx, handle)
    ReactDOM.render((
      <I18nProvider language={this.language}>
        <Provider store={this.store}>
          <App onHeight={(height: number) => {
            this.height = height
          }} onTitle={(title: string) => {
            this.title = title
          }} lang={this.language} />
        </Provider>
      </I18nProvider>
    ),
      dom
    );
  }
  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void {
    this.store?.onReceivedProps(properties, cause)
  }
  extAppWillUnload(): void {
    if (this.store?.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      this.store?.onSubClick(true)
    }
  }
}
