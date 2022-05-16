import { EduNavAction, EduNavRecordActionPayload } from '@/infra/stores/common/nav-ui';
import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { Header, Inline, Popover, SvgImg, Tooltip, Button, transI18n, SvgaPlayer } from '~ui-kit';
import { RecordStatus } from 'agora-edu-core';
import RecordLoading from './assets/svga/record-loading.svga';
import './index.css';

export const ClassStatusComponent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { classStatusText, classStatusTextColor } = navigationBarUIStore;
  return <Inline color={classStatusTextColor}>{classStatusText}</Inline>;
});

export const SignalContent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { networkQualityLabel, delay, packetLoss } = navigationBarUIStore;
  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className="biz-col label left">{transI18n('signal.status')}:</td>
            <td className="biz-col value left">{networkQualityLabel}</td>
            <td className="biz-col label right">{transI18n('signal.delay')}:</td>
            <td className="biz-col value right">{delay}</td>
          </tr>
          <tr>
            <td className="biz-col label left">{transI18n('signal.lose')}:</td>
            <td className="biz-col value left">{packetLoss}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
});

export const SignalQualityComponent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { networkQualityClass, networkQualityIcon } = navigationBarUIStore;

  return (
    <Popover content={<SignalContent />} placement="bottomLeft">
      <div className={`biz-signal-quality ${networkQualityClass}`}>
        <SvgImg className="cursor-pointer" type={networkQualityIcon} size={24} />
      </div>
    </Popover>
  );
});

export const NavigationBarContainer = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { readyToMount } = navigationBarUIStore;

  return <>{readyToMount ? <NavigationBar></NavigationBar> : null}</>;
});

const NavigationBarRecordAction = observer(
  ({ action }: { action: EduNavAction<EduNavRecordActionPayload> }) => {
    const { payload } = action;
    return payload ? (
      <>
        {payload.recordStatus === RecordStatus.started && (
          <i className="record-heartbeat animate-pulse"></i>
        )}
        {payload.text && <span className="record-tips">{payload.text}</span>}
        {payload.recordStatus === RecordStatus.starting ? (
          <SvgaPlayer className="record-icon" url={RecordLoading} width={18} height={18} loops />
        ) : (
          <Tooltip key={action.title} title={action.title} placement="bottom">
            <SvgImg
              className="record-icon"
              canHover
              color={action.iconColor}
              type={action.iconType}
              size={24}
              onClick={action.onClick}
            />
          </Tooltip>
        )}
      </>
    ) : null;
  },
);

export const NavigationBarAction = observer(({ action }: { action: EduNavAction }) => {
  return (
    <Tooltip title={action.title} placement="bottom">
      <SvgImg
        canHover
        color={action.iconColor}
        type={action.iconType}
        size={24}
        onClick={action.onClick}
      />
    </Tooltip>
  );
});

export const NavigationBar = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { navigationTitle, currScreenShareTitle, actions, isBeforeClass, startClass } =
    navigationBarUIStore;

  return (
    <Header className="fcr-biz-header">
      <div className="header-signal">
        <SignalQualityComponent />
      </div>

      <div className="fcr-biz-header-title-wrap">
        <div className="fcr-biz-header-title">
          {currScreenShareTitle && (
            <div className="fcr-biz-header-title-share-name">{currScreenShareTitle}</div>
          )}
          {navigationTitle}
        </div>
        <div className="fcr-biz-header-split-line"></div>
        <div className="fcr-biz-header-title fcr-biz-subtitle">
          <ClassStatusComponent />
        </div>
        {isBeforeClass ? (
          <Button size="xs" onClick={() => startClass()}>
            {transI18n('begin_class')}
          </Button>
        ) : null}
      </div>
      <div className="header-actions">
        {actions.map((a) =>
          a.id === 'Record' ? (
            <NavigationBarRecordAction
              key={a.iconType}
              action={a as EduNavAction<EduNavRecordActionPayload>}></NavigationBarRecordAction>
          ) : (
            <NavigationBarAction key={a.iconType} action={a as EduNavAction} />
          ),
        )}
      </div>
    </Header>
  );
});
