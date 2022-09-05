import { EduNavAction, EduNavRecordActionPayload } from '@/infra/stores/common/nav-ui';
import { observer } from 'mobx-react';
import { useStore } from '@/infra/hooks/ui-store';
import {
  Header,
  Inline,
  Popover,
  SvgImg,
  Tooltip,
  Button,
  transI18n,
  SvgaPlayer,
  SvgIcon,
  Card,
  Layout,
  SvgIconEnum,
  useI18n,
} from '~ui-kit';
import { EduClassroomConfig, EduRoleTypeEnum, RecordStatus } from 'agora-edu-core';
import RecordLoading from './assets/svga/record-loading.svga';
import './index.css';
import { visibilityControl, visibilityListItemControl } from '../visibility';
import {
  roomNameEnabled,
  networkStateEnabled,
  scheduleTimeEnabled,
  headerEnabled,
  cameraSwitchEnabled,
  microphoneSwitchEnabled,
} from '../visibility/controlled';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
import ClipboardJS from 'clipboard';
import { AgoraEduSDK } from '@/infra/api';

const SignalContent = observer(() => {
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

const SignalQuality = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { networkQualityClass, networkQualityIcon } = navigationBarUIStore;

    return (
      <Popover content={<SignalContent />} placement="bottomLeft">
        <div className={`biz-signal-quality ${networkQualityClass}`}>
          <SvgImg
            className="cursor-pointer"
            type={networkQualityIcon.icon}
            colors={{ iconPrimary: networkQualityIcon.color }}
            size={24}
          />
        </div>
      </Popover>
    );
  }),
  networkStateEnabled,
);

const ScheduleTime = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { classStatusText, classStatusTextColor } = navigationBarUIStore;
    return <Inline color={classStatusTextColor}>{classStatusText}</Inline>;
  }),
  scheduleTimeEnabled,
);

const RoomName = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { navigationTitle } = navigationBarUIStore;
    return <React.Fragment> {navigationTitle}</React.Fragment>;
  }),
  roomNameEnabled,
);

const ScreenShareTip = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { currScreenShareTitle } = navigationBarUIStore;
  return currScreenShareTitle ? (
    <div className="fcr-biz-header-title-share-name">{currScreenShareTitle}</div>
  ) : null;
});

const StartButton = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { isBeforeClass, startClass } = navigationBarUIStore;
  return isBeforeClass ? (
    <Button size="xs" onClick={() => startClass()}>
      {transI18n('begin_class')}
    </Button>
  ) : null;
});

const RoomState = () => {
  return (
    <React.Fragment>
      <div className="fcr-biz-header-title">
        <ScreenShareTip />
        <RoomName />
      </div>
      <div className="fcr-biz-header-split-line"></div>
      <div className="fcr-biz-header-title fcr-biz-subtitle">
        <ScheduleTime />
      </div>
      <StartButton />
    </React.Fragment>
  );
};

const Actions = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { actions } = navigationBarUIStore;

  return (
    <React.Fragment>
      {actions.length
        ? actions.map((a) =>
            a.id === 'Record' ? (
              <NavigationBarRecordAction
                key={a.iconType}
                action={a as EduNavAction<EduNavRecordActionPayload>}
              />
            ) : (
              <NavigationBarAction key={a.iconType} action={a as EduNavAction} />
            ),
          )
        : null}
    </React.Fragment>
  );
});

const ShareCard = observer(() => {
  const { navigationBarUIStore, shareUIStore } = useStore();
  const cls = classNames('absolute z-20', {});
  const { roomName } = EduClassroomConfig.shared.sessionInfo;
  const copyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (copyRef.current) {
      const clipboard = new ClipboardJS(copyRef.current);
      clipboard.on('success', function (e) {
        shareUIStore.addToast(transI18n('fcr_copy_success'));
        navigationBarUIStore.closeShare();
      });
      clipboard.on('error', function (e) {
        shareUIStore.addToast('Failed to copy');
      });
      return () => {
        clipboard.destroy();
      };
    }
  }, []);

  const t = useI18n();

  return (
    <Card
      className={cls}
      style={{
        display: navigationBarUIStore.shareVisible ? 'block' : 'none',
        right: 42,
        top: 30,
        padding: 20,
        borderRadius: 10,
      }}>
      <Layout direction="col">
        <Layout className="justify-between">
          <span className="text-14 whitespace-nowrap">{t('fcr_copy_room_name')}</span>
          <span
            style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={roomName}>
            {roomName}
          </span>
        </Layout>
        <Layout className="justify-between mt-3">
          <span className="text-14 whitespace-nowrap">{t('fcr_copy_share_link')}</span>
          <Button type="ghost" style={{ marginLeft: 40 }} size="xs">
            <Layout className="mx-4 items-center">
              <SvgImg
                type={SvgIconEnum.LINK_SOLID}
                colors={{ iconPrimary: InteractionStateColors.allow }}
                size={16}
              />
              <span
                ref={copyRef}
                data-clipboard-text={`${AgoraEduSDK.shareUrl}`}
                className="text-12 cursor-pointer whitespace-nowrap"
                style={{ color: InteractionStateColors.allow, marginLeft: 4 }}>
                {t('fcr_copy_share_link_copy')}
              </span>
            </Layout>
          </Button>
        </Layout>
      </Layout>
    </Card>
  );
});

const NavigationBarRecordAction = observer(
  ({ action }: { action: EduNavAction<EduNavRecordActionPayload> }) => {
    const { payload } = action;
    return payload ? (
      <div className="flex items-center">
        {payload.recordStatus === RecordStatus.started && (
          <i className="record-heartbeat animate-pulse"></i>
        )}
        {payload.text && <span className="record-tips">{payload.text}</span>}
        {payload.recordStatus === RecordStatus.starting ? (
          <SvgaPlayer className="record-icon" url={RecordLoading} width={18} height={18} loops />
        ) : (
          <Tooltip key={action.title} title={action.title} placement="bottom">
            <div className="action-icon record-icon">
              <SvgIcon
                colors={{ iconPrimary: action.iconColor }}
                type={action.iconType}
                hoverType={action.iconType}
                size={18}
                onClick={action.onClick}
              />
            </div>
          </Tooltip>
        )}
      </div>
    ) : null;
  },
);

export const NavigationBarAction = visibilityListItemControl(
  observer(({ action }: { action: EduNavAction }) => {
    return (
      <Tooltip title={action.title} placement="bottom">
        <div className="action-icon">
          <SvgIcon
            colors={{ iconPrimary: action.iconColor }}
            type={action.iconType}
            hoverType={action.iconType}
            size={18}
            onClick={action.onClick}
          />
        </div>
      </Tooltip>
    );
  }),
  (uiConfig, { action }) => {
    if (action.id === 'Camera' && !cameraSwitchEnabled(uiConfig)) {
      return false;
    }
    if (action.id === 'Mic' && !microphoneSwitchEnabled(uiConfig)) {
      return false;
    }
    return true;
  },
);

export const NavigationBar = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();

    const { readyToMount } = navigationBarUIStore;

    if (!readyToMount) {
      return null;
    }

    return (
      <Header className="fcr-biz-header">
        <div className="header-signal">
          <SignalQuality />
        </div>
        <div className="fcr-biz-header-title-wrap">
          <RoomState />
        </div>
        <div className="header-actions relative">
          <Actions />
          <ShareCard />
        </div>
      </Header>
    );
  }),
  headerEnabled,
);
