import 'promise-polyfill/src/polyfill';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PluginStore, c2h } from './store';
import { usePluginStore } from './hooks';
import { Provider, observer } from 'mobx-react';
import {
  IAgoraExtApp,
  AgoraExtAppContext,
  AgoraExtAppHandle,
  EduRoleTypeEnum,
  AgoraExtAppUserInfo,
  AgoraExtAppEventHandler,
  AgoraExtAppController,
} from 'agora-edu-core';
import {
  Button,
  Table,
  Row,
  Input,
  transI18n,
  I18nProvider,
  changeLanguage,
  SvgImg,
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

    // const userlistEvents = pluginStore.context.contexts.userList.events

    useEffect(() => {
      // userlistEvents.subscribe((state:any) => {
      //   runInAction(() => {
      //     pluginStore.userList = state.userList
      //     pluginStore.rosterUserList = state.rosterUserList
      //   })
      // })
    }, []);

    return (
      <div
        style={{
          height: pluginStore.height,
          transition: 'all 0.5s ease 0s',
          overflow: 'hidden',
        }}
        className={classnames({
          [`vote-modal`]: 1,
          [`vote-language-en`]: lang === 'en',
        })}>
        {pluginStore.status !== 'config' &&
        ![EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
          pluginStore.context.localUserInfo.roleType,
        ) ? (
          <span className="vote-title-tip">
            {transI18n(pluginStore.mulChoice ? 'vote.mul-sel' : 'vote.single-sel')}
          </span>
        ) : null}
        <div>
          <textarea
            value={pluginStore.title}
            className="vote-title"
            placeholder={transI18n('vote.input-tip')}
            disabled={pluginStore.status !== 'config'}
            style={
              pluginStore.status !== 'config'
                ? { height: c2h(pluginStore.title?.length || 0) + 'px' }
                : undefined
            }
            maxLength={100}
            onChange={(e: any) => {
              pluginStore.status === 'config' && pluginStore.setTitle(e.target.value);
            }}
          />
          {pluginStore.status === 'config' ? (
            <>
              <span className="vote-limit">{pluginStore.title?.length || 0}/100</span>
              <div className="vote-mulchoice">
                <label>
                  <input
                    type="radio"
                    name="sel"
                    checked={!pluginStore.mulChoice}
                    onChange={() => {}}
                    onClick={() => {
                      pluginStore.status === 'config' && pluginStore.setMulChoice(false);
                    }}
                  />
                  <span></span>
                  {transI18n('vote.single-sel')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="sel"
                    checked={pluginStore.mulChoice}
                    onChange={() => {}}
                    onClick={() => {
                      pluginStore.status === 'config' && pluginStore.setMulChoice(true);
                    }}
                  />
                  <span></span>
                  {transI18n('vote.mul-sel')}
                </label>
              </div>
            </>
          ) : null}
          <Table>
            {pluginStore.answer?.map((col: string, idx: number) => (
              <Row
                key={idx}
                className={
                  pluginStore.status !== 'config' && pluginStore.status !== 'answer'
                    ? 'vote-process-show'
                    : ''
                }
                style={{ padding: pluginStore.status === 'config' ? '0' : '0 20px 0 0' }}>
                {pluginStore.status === 'end' || pluginStore.status === 'info' ? (
                  <span
                    style={{
                      color: '#677386',
                      fontSize: '14px',
                      position: 'relative',
                      top: '9px',
                      display: 'inline-block',
                      width: '30px',
                      textAlign: 'center',
                    }}>
                    {idx + 1}.
                  </span>
                ) : pluginStore.status === 'answer' ? (
                  <label className="vote-item-prefix">
                    <input
                      type="radio"
                      checked={pluginStore.selAnswer?.includes(col)}
                      onChange={() => {}}
                      onClick={() => {
                        pluginStore.changeSelAnswer(col, pluginStore.mulChoice);
                      }}
                      id={`${pluginStore.answer && pluginStore.answer[idx]}-${idx}`}
                    />
                    <span className={pluginStore.mulChoice ? 'vote-item-mul' : ''}></span>
                  </label>
                ) : null}
                <div className="vote-item-container">
                  <Input
                    className="vote-item"
                    maxLength={30}
                    prefix={
                      pluginStore.status === 'config' ? (
                        <span
                          style={{
                            color: '#677386',
                            fontSize: '14px',
                          }}>
                          {idx + 1}.
                        </span>
                      ) : null
                    }
                    suffix={
                      pluginStore.status === 'end' || pluginStore.status === 'info' ? (
                        <span
                          style={{
                            color: '#677386',
                            fontSize: '14px',
                          }}>
                          {pluginStore.answerInfo ? pluginStore.answerInfo[idx] : ''}
                        </span>
                      ) : null
                    }
                    value={pluginStore.answer && pluginStore.answer[idx]}
                    disabled={pluginStore.status !== 'config'}
                    placeholder={transI18n('vote.item-tip')}
                    onChange={(e: any) => {
                      pluginStore.changeAnswer(idx, e.target.value);
                    }}></Input>
                  {pluginStore.status !== 'config' && (
                    <label
                      className="vote-label-for"
                      htmlFor={`${pluginStore.answer && pluginStore.answer[idx]}-${idx}`}></label>
                  )}
                </div>
                {pluginStore.status === 'info' || pluginStore.status === 'end' ? (
                  <span className="vote-process" style={{ width: 'calc(100% - 50px)' }}>
                    <span
                      style={{
                        width: pluginStore.answerInfo
                          ? pluginStore.answerInfo[idx].split(' ')[1]
                          : '0',
                      }}></span>
                  </span>
                ) : null}
              </Row>
            ))}
          </Table>
        </div>
        {pluginStore.ui?.includes('subs') ? (
          <div
            className={pluginStore.status === 'config' ? 'vote-submit' : 'vote-submit vote-vote'}>
            <span
              onClick={() => {
                pluginStore.addAnswer();
              }}
              style={{
                backgroundImage: `url(${addSvg})`,
                visibility:
                  pluginStore.status !== 'config' || (pluginStore.answer?.length || 4) > 4
                    ? 'hidden'
                    : 'visible',
              }}></span>
            <Button
              className="vote-submit-btn"
              disabled={
                pluginStore.status === 'config'
                  ? !pluginStore.answer ||
                    !pluginStore.title ||
                    pluginStore.answer.includes('') ||
                    [...new Set(pluginStore.answer)].length !== pluginStore.answer.length
                  : pluginStore.status === 'answer'
                  ? (pluginStore.selAnswer?.length || 0) === 0
                  : false
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
                  pluginStore.status !== 'config' || (pluginStore.answer?.length || 4) < 3
                    ? 'hidden'
                    : 'visible',
              }}></span>
          </div>
        ) : null}
      </div>
    );
  },
);

export class AgoraExtAppVote implements IAgoraExtApp, AgoraExtAppEventHandler {
  // should be final
  static store = new PluginStore();
  appIdentifier = 'io.agora.vote';
  appName = transI18n('cabinet.vote.appName');
  className = 'vote-dialog';
  icon = 'vote';
  width = 360;
  height = 283;
  minWidth = 360;
  minHeight = 283;

  store: PluginStore;

  eventHandler = this;

  _el?: Element;

  constructor(public readonly language: any = 'en') {
    changeLanguage(this.language);
    this.store = AgoraExtAppVote.store;
  }

  onUserListChanged(userList: AgoraExtAppUserInfo[]): void {
    this.store?.updateStudents(userList);
  }

  setController(controller: AgoraExtAppController) {
    this.store.controller = controller;
  }

  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void {
    this._el = dom;
    this.store.resetContextAndHandle(ctx, handle);

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
        </Provider>
      </I18nProvider>,
      dom,
    );
  }

  onClose() {
    this.store.clearProps();
  }

  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void {
    this.store?.onReceivedProps(properties, cause);
  }

  async extAppWillUnload(): Promise<boolean> {
    if (this._el) {
      ReactDOM.unmountComponentAtNode(this._el);
    }

    return Promise.resolve(true);
  }
}
