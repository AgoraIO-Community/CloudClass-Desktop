import 'promise-polyfill/src/polyfill';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store'
import { usePluginStore } from './hooks'
import { Provider, observer } from 'mobx-react';
import type { IAgoraExtApp, AgoraExtAppContext, AgoraExtAppHandle } from 'agora-edu-core'
import { useAppPluginContext } from 'agora-edu-core'
import {
  Button,
  Table,
  TableHeader,
  Col,
  Row,
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

const App = observer(({ onHeight,onTitle,lang }: { onHeight: (height: number) => void ,onTitle: (title: string) => void, lang: 'zh'|'en' }) => {
  const pluginStore = usePluginStore()

  const {events} = pluginStore.context

  useEffect(() => {
    events.global.subscribe((state:any) => {
      pluginStore.updateGlobalContext(state)
    })
  }, [])

  useEffect(() => {
    onHeight(pluginStore.height || 0)
  }, [pluginStore.height])

  useEffect(() => {
    onTitle(transI18n('answer.appName')+ ' ' + pluginStore.currentTime)
  }, [pluginStore.currentTime])

  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
      className={classnames({
        [`answer-modal`]: 1,
        [`answer-role-student`]: pluginStore.context.localUserInfo.roleType === EduRoleTypeEnum.student,
        [`answer-language-en`]: lang === 'en',
        [`answer-change`]: pluginStore.status==='answer'&&pluginStore.showModifyBtn,
      })}
    >
      {pluginStore.ui?.includes('sels') ? <div className="answer-items" >
        {pluginStore.answer?.map((ele: string, idx: number) => {
          return (<span key={idx} style={pluginStore.selAnswer?.includes(ele) ? { background: '#357BF6', color: '#fff' } : {}} onClick={() => {
            pluginStore.changeSelAnswer(ele)
          }}>{ele}</span>)
        })}
      </div> : null}
      {pluginStore.ui?.includes('users') ?
        <div className="answer-userlist">
          <Table className="answer-table">
            <TableHeader>
              <Col key="student-name" style={{ justifyContent: 'center' }}>{transI18n('answer.student-name')}</Col>
              <Col key="answer-time" style={{ justifyContent: 'center' }}>{transI18n('answer.answer-time')}</Col>
              <Col key="selected-answer" style={{ justifyContent: 'center' }}>{transI18n('answer.selected-answer')}</Col>
            </TableHeader>
            <Table className="table-container">
              {pluginStore.students?.map((student: any) => (
                <Row className={'border-bottom-width-1'} key={student.uid}>
                  {['name', 'replyTime', 'answer'].map((col: string, idx: number) => (
                    <Col key={col} style={{ justifyContent: 'center', color:idx===2?(student[col]===(pluginStore.context.properties.answer?.join('')||'')?'#3AB449':'#F04C36'):'#191919' }}>
                      {
                        <span
                          title={student[col]}
                          style={{
                            paddingLeft: 0
                          }}
                        >
                          {student[col]}
                        </span>
                      }
                    </Col>
                  ))}
                </Row>
              ))}
            </Table>
          </Table>
        </div> : null}
      {pluginStore.ui?.includes('infos') ? <div className="answer-info">
        {['number-answered', 'acc', 'right-key', 'my-answer'].map((key: any,index: number) => (index < 3 || pluginStore.context.localUserInfo.roleType === EduRoleTypeEnum.student?(
          <div className='answer-info-line' key={key}>
            <span className='answer-info-tab'>{transI18n('answer.' + key) + '： '}</span><span style={(index===3&&pluginStore&&pluginStore.answerInfo)?{color:pluginStore.answerInfo[key]===pluginStore.answerInfo['right-key']?'#3AB449':'#F04C36'}:{}} className='answer-info-value'>{pluginStore.answerInfo ? pluginStore.answerInfo[key] : ''}</span>
          </div>
        ):null))}
      </div> : null}
      {pluginStore.ui?.includes('subs') ? <div className="answer-submit">
        <span onClick={() => {
          pluginStore.addAnswer()
        }} style={{ backgroundImage: `url(${addSvg})`,visibility: (pluginStore.status !== 'config') || ((pluginStore.answer?.length || 4) > 7) ? 'hidden' : 'visible' }} ></span>
        <Button
          disabled = { pluginStore.ui.includes('sels') && (pluginStore.selAnswer?.length || 0) === 0 }
          onClick={() => {
            pluginStore.onSubClick();
          }}
        >{transI18n(pluginStore?.buttonName || '')}</Button>
        <span onClick={() => {
          pluginStore.subAnswer()
        }} style={{ backgroundImage: `url(${reduceSvg})`,visibility: (pluginStore.status !== 'config') || ((pluginStore.answer?.length || 4) < 2) ? 'hidden' : 'visible' }}></span>
      </div> : null}
    </div>
  )
})


export class AgoraExtAppAnswer implements IAgoraExtApp {
  appIdentifier = "io.agora.answer"
  appName = 'answer'
  className = 'answer-dialog'
  width = 360
  height = 150 // 超过4个选项高度为220
  title = transI18n('answer.appName')

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




