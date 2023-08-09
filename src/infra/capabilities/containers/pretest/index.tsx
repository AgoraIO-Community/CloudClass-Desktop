import { useStore } from '@classroom/infra/hooks/ui-store';
import { primaryRadius, brandColor } from '@classroom/infra/utils/colors';
import { observer } from 'mobx-react';
import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { SvgImg, SvgIconEnum, OverlayWrap } from '@classroom/ui-kit';
import { BaseProps } from '@classroom/ui-kit/components/util/type';
import { Footer } from './pretest-footer';
import { PretestVideo } from './pretest-video';
import { PretestVoice } from './pretest-audio';
import { useI18n } from 'agora-common-libs';
import { PretestStage } from './pretest-stage';

export interface PretestProps extends BaseProps {
  className?: string;
  onOK?: () => void;
  closeable?: boolean;
  onCancel?: () => void;
  showStage?: boolean;
  pertestTitle?: string;
}

type DeviceType = 'audio' | 'video';

const SETTINGS: (DeviceType | 'stage')[] = ['audio', 'video', 'stage'];
const DEVICE_SETTINGS: DeviceType[] = ['audio', 'video'];
const SvgImgType = {
  audio: SvgIconEnum.MICROPHONE,
  video: SvgIconEnum.CAMERA,
  stage: SvgIconEnum.STAGE,
};

export const RoomPretest: FC<PretestProps> = observer(
  ({ onOK, closeable, showStage = false, pertestTitle, onCancel }) => {
    return (
      <PretestModal onCancel={onCancel} closeable={closeable}>
        <DeviceTest showStage={showStage} pertestTitle={pertestTitle} onOK={onOK} />
      </PretestModal>
    );
  },
);

const DeviceTest: FC<PretestProps> = observer(({ onOK, showStage = false, pertestTitle }) => {
  const {
    pretestUIStore: {
      currentPretestTab,
      setCurrentTab,
      startRecordingDeviceTest,
      stopRecordingDeviceTest,
    },
  } = useStore();

  const handleOK = useCallback(() => {
    onOK && onOK();
  }, []);

  const handleTabChange = useCallback((tab: DeviceType | 'stage') => {
    setCurrentTab(tab);
  }, []);

  const transI18n = useI18n();

  useEffect(() => {
    startRecordingDeviceTest();
    return () => {
      stopRecordingDeviceTest();
    };
  }, []);

  return (
    <PreTestContent>
      <PreTestTabLeftContent>
        <PreTestTitle>{pertestTitle || transI18n('pretest.settingTitle')}</PreTestTitle>
        {(showStage ? SETTINGS : DEVICE_SETTINGS).map((item) => (
          <PreTestTabHeader
            key={item}
            activity={currentPretestTab === item}
            onClick={() => handleTabChange(item)}>
            <Icon type={item} activity={currentPretestTab === item}>
              <SvgImg type={SvgImgType[item]} colors={{ iconPrimary: '#fff' }} size={24} />
            </Icon>
            {transI18n(`pretest.${item}`)}
          </PreTestTabHeader>
        ))}
      </PreTestTabLeftContent>
      <PreTestTabContent>
        {currentPretestTab === 'audio' && <PretestVoice />}
        {currentPretestTab === 'video' && <PretestVideo />}
        {currentPretestTab === 'stage' && <PretestStage />}
        <Footer onOK={handleOK} visibleMirror={currentPretestTab === 'video'} />
      </PreTestTabContent>
    </PreTestContent>
  );
});

const PretestModal: FC<{ children: React.ReactNode; closeable?: boolean; onCancel?: () => void }> =
  ({ children, closeable, onCancel }) => {
    const [opened, setOpened] = useState(false);

    useEffect(() => {
      setOpened(true);
    }, []);

    return (
      <OverlayWrap opened={opened}>
        <Modal>
          {closeable && (
            <div className="fcr-pretest-modal-closeable" onClick={onCancel}>
              <SvgImg type={SvgIconEnum.CLOSE} colors={{ iconPrimary: '#fff' }}></SvgImg>
            </div>
          )}
          {children}
        </Modal>
      </OverlayWrap>
    );
  };

const Modal: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="fcr-bg-component fcr-pretest-modal"
    style={{
      width: 730,
      height: 656,
      borderRadius: primaryRadius,
      boxShadow: '-1px 10px 60px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
    }}>
    {children}
  </div>
);

const PreTestContent: FC<PropsWithChildren> = ({ children }) => (
  <div className="fcr-flex fcr-w-full fcr-h-full">{children}</div>
);

const PreTestTabLeftContent: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="fcr-border-divider"
    style={{
      flexBasis: 160,
      paddingTop: 40,
      borderRightWidth: '1px',
      borderStyle: 'solid',
      flexShrink: 0,
    }}>
    {' '}
    {children}
  </div>
);

const PreTestTitle: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="fcr-text-level1"
    style={{
      fontWeight: 800,
      fontSize: 26,
      paddingLeft: 25,
      marginBottom: 32,
    }}>
    {children}
  </div>
);

const PreTestTabContent: FC<PropsWithChildren> = ({ children }) => (
  <div className="fcr-flex fcr-flex-grow fcr-flex-col fcr-justify-between">{children}</div>
);

const PreTestTabHeader: FC<PropsWithChildren<{ activity: boolean; onClick: () => void }>> = ({
  children,
  activity,
  onClick,
}) => {
  const background = activity ? brandColor : 'transparent';
  const fontWeight = activity ? 700 : 500;

  const text = activity ? 'fcr-text-white' : 'fcr-text-level1';

  return (
    <div
      className={`fcr-flex fcr-items-center ${text}`}
      onClick={onClick}
      style={{
        margin: '0 15px',
        paddingLeft: 10,
        gap: 8,
        height: 46,
        fontSize: 16,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        background,
        fontWeight,
      }}>
      {children}
    </div>
  );
};

const Icon: FC<PropsWithChildren<{ type: DeviceType | 'stage'; activity: boolean }>> = ({
  children,
  type,
  activity,
}) => {
  let background = '';

  switch (type) {
    case 'video':
      background = activity ? 'transparent' : '#7C79FF';
      break;
    case 'audio':
      background = activity ? 'transparent' : '#83BC53';
      break;
    case 'stage':
      background = activity ? 'transparent' : '#0056FD';
      break;
  }

  return (
    <div
      className="fcr-flex fcr-justify-center fcr-items-center"
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background,
      }}>
      {children}
    </div>
  );
};
