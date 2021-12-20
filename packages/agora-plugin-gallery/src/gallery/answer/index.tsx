import 'promise-polyfill/src/polyfill';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { observable, observe, runInAction } from 'mobx';
import { PluginStore } from './store';
import { usePluginStore } from './hooks';
import { Provider, observer } from 'mobx-react';
import {
  IAgoraExtApp,
  AgoraExtAppContext,
  AgoraExtAppHandle,
  AgoraExtAppEventHandler,
  AgoraExtAppUserInfo,
  EduRoleTypeEnum,
} from 'agora-edu-core';

import {
  Button,
  Table,
  TableHeader,
  Col,
  Row,
  transI18n,
  I18nProvider,
  changeLanguage,
  Icon,
} from '~ui-kit';
import classnames from 'classnames';
import './index.css';
import reduceSvg from './reduce.svg';
import addSvg from './add.svg';

const App = observer(
  ({
    onHeight,
    onTitle,
    lang,
  }: {
    onHeight: (height: number) => void;
    onTitle: (title: string) => void;
    lang: 'zh' | 'en';
  }) => {
    const pluginStore = usePluginStore();

    useEffect(() => {
      onHeight(pluginStore.height || 0);
    }, [pluginStore.height]);

    useEffect(() => {
      onTitle(transI18n('answer.appName') + ' ' + pluginStore.currentTime);
    }, [pluginStore.currentTime]);

    return (
      <div
        style={{
          width: '340px',
          height: pluginStore.height,
          transition: 'all 0.5s ease 0s',
          overflow: 'hidden',
        }}
        className={classnames({
          [`answer-modal`]: 1,
          [`answer-role-student`]:
            pluginStore.context.localUserInfo.roleType === EduRoleTypeEnum.student,
          [`answer-language-en`]: lang === 'en',
          [`answer-change`]: pluginStore.status === 'answer' && pluginStore.showModifyBtn,
        })}>
        {pluginStore.ui?.includes('sels') ? (
          <div className="answer-items">
            {pluginStore.answer?.map((ele: string, idx: number) => {
              return (
                <span
                  key={idx}
                  style={
                    pluginStore.selAnswer?.includes(ele)
                      ? { background: '#357BF6', color: '#fff' }
                      : {}
                  }
                  onClick={() => {
                    pluginStore.changeSelAnswer(ele);
                  }}>
                  {ele}
                </span>
              );
            })}
          </div>
        ) : null}
        {pluginStore.ui?.includes('users') ? (
          <div className="answer-userlist">
            <Table className="answer-table">
              <TableHeader>
                <Col key="student-name" style={{ justifyContent: 'center' }}>
                  {transI18n('answer.student-name')}
                </Col>
                <Col key="answer-time" style={{ justifyContent: 'center' }}>
                  {transI18n('answer.answer-time')}
                </Col>
                <Col key="selected-answer" style={{ justifyContent: 'center' }}>
                  {transI18n('answer.selected-answer')}
                </Col>
              </TableHeader>
              <Table className="table-container">
                {pluginStore.students?.map((student: any) => (
                  <Row className={'border-bottom-width-1'} key={student.name}>
                    {['name', 'replyTime', 'answer'].map((col: string, idx: number) => (
                      <Col
                        key={col}
                        style={{
                          justifyContent: 'center',
                          color:
                            idx === 2
                              ? student[col] ===
                                (pluginStore.context.properties.answer?.join('') || '')
                                ? '#3AB449'
                                : '#F04C36'
                              : '#191919',
                        }}>
                        {
                          <span
                            title={student[col]}
                            style={{
                              paddingLeft: 0,
                            }}>
                            {student[col]}
                          </span>
                        }
                      </Col>
                    ))}
                  </Row>
                ))}
              </Table>
            </Table>
          </div>
        ) : null}
        {pluginStore.ui?.includes('infos') ? (
          <div className="answer-info">
            {['number-answered', 'acc', 'right-key', 'my-answer'].map((key: any, index: number) =>
              index < 3 ||
              pluginStore.context.localUserInfo.roleType === EduRoleTypeEnum.student ? (
                <div className="answer-info-line" key={key}>
                  <span className="answer-info-tab">{transI18n('answer.' + key) + '： '}</span>
                  <span
                    style={
                      index === 3 && pluginStore && pluginStore.answerInfo
                        ? {
                            color:
                              pluginStore.answerInfo[key] === pluginStore.answerInfo['right-key']
                                ? '#3AB449'
                                : '#F04C36',
                          }
                        : {}
                    }
                    className="answer-info-value">
                    {pluginStore.answerInfo ? pluginStore.answerInfo[key] : ''}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        ) : null}
        {pluginStore.ui?.includes('subs') ? (
          <div className="answer-submit">
            <span
              onClick={() => {
                pluginStore.addAnswer();
              }}
              style={{
                backgroundImage: `url(${addSvg})`,
                visibility:
                  pluginStore.status !== 'config' || (pluginStore.answer?.length || 4) > 7
                    ? 'hidden'
                    : 'visible',
              }}></span>
            <Button
              className="answer-submit-btn"
              disabled={
                pluginStore.ui.includes('sels') && (pluginStore.selAnswer?.length || 0) === 0
              }
              onClick={() => {
                pluginStore.onSubClick();
              }}>
              {transI18n(pluginStore?.buttonName || '')}
            </Button>
            <span
              onClick={() => {
                pluginStore.subAnswer();
              }}
              style={{
                backgroundImage: `url(${reduceSvg})`,
                visibility:
                  pluginStore.status !== 'config' || (pluginStore.answer?.length || 4) < 2
                    ? 'hidden'
                    : 'visible',
              }}></span>
          </div>
        ) : null}
      </div>
    );
  },
);

const Clock = ({ app }: { app: AgoraExtAppAnswer }) => {
  const [clockTime, setClockTime] = useState(app.clockWatchProps.currentTime);

  useEffect(() => {
    const disposer = observe(app.clockWatchProps, ({ name, newValue }: any) => {
      if (name === 'currentTime') {
        setClockTime(newValue);
      }
    });
    return disposer;
  }, [app.clockWatchProps]);

  return <div style={{ marginLeft: 8 }}>{clockTime}</div>;
};

const ClockUpdater = observer(({ onUpdate }: { onUpdate: (time: string) => void }) => {
  const pluginStore = usePluginStore();
  onUpdate(pluginStore.currentTime || '');
  return null;
});

export class AgoraExtAppAnswer implements IAgoraExtApp, AgoraExtAppEventHandler {
  // should be final
  static store = new PluginStore();
  appIdentifier = 'io.agora.answer';
  appName = transI18n('cabinet.answer.appName');
  className = 'answer-dialog';
  icon = 'answer';
  width = 380;
  height = 150; // 超过4个选项高度为220
  minWidth = 380;
  minHeight = 150; // 超过4个选项高度为220
  store?: PluginStore;
  customHeader = (<Clock app={this} />);
  clockWatchProps = observable({
    currentTime: '',
  });

  eventHandler = this;

  constructor(public readonly language: any = 'en') {
    changeLanguage(this.language);
    this.store = AgoraExtAppAnswer.store;
    this.appName = transI18n('cabinet.answer.appName');
  }

  onUserListChanged(userList: AgoraExtAppUserInfo[]): void {
    this.store?.updateStudents(userList);
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this.store?.resetContextAndHandle(ctx, handle);

    ReactDOM.render(
      <I18nProvider language={this.language}>
        <Provider store={this.store}>
          <App
            onHeight={(height: number) => {
              this.height = height;
            }}
            onTitle={(title: string) => {}}
            lang={this.language}
          />
          <ClockUpdater
            onUpdate={(time) => {
              runInAction(() => {
                this.clockWatchProps.currentTime = time;
              });
            }}
          />
        </Provider>
      </I18nProvider>,
      dom,
    );
  }

  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void {
    this.store?.onReceivedProps(properties, cause);
  }

  async extAppWillUnload(): Promise<boolean> {
    try {
      if (this.store?.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
        await this.store?.onSubClick(true);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
