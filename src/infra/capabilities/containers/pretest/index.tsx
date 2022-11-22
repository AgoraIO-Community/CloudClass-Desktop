import { useStore } from '@classroom/infra/hooks/ui-store';
import { primaryRadius, brandColor } from '@classroom/infra/utils/colors';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useState } from 'react';
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
}

type DeviceType = 'audio' | 'video';

const SETTINGS: (DeviceType | 'stage')[] = ['audio', 'video', 'stage'];
const DEVICE_SETTINGS: DeviceType[] = ['audio', 'video'];
const SvgImgType = {
  audio: SvgIconEnum.MICROPHONE_ON,
  video: SvgIconEnum.RECORDING,
  stage: SvgIconEnum.STAGE,
};

export const RoomPretest: FC<PretestProps> = observer(({ onOK, closeable, showStage = false }) => {
  return (
    <PretestModal closeable={closeable}>
      <DeviceTest showStage={showStage} onOK={onOK} />
    </PretestModal>
  );
});

const DeviceTest: FC<PretestProps> = observer(({ onOK, showStage = false }) => {
  const {
    pretestUIStore: { currentPretestTab, setCurrentTab },
  } = useStore();

  const handleOK = useCallback(() => {
    onOK && onOK();
  }, []);

  const handleTabChange = useCallback((tab: DeviceType | 'stage') => {
    setCurrentTab(tab);
  }, []);

  const transI18n = useI18n();

  return (
    <PreTestContent>
      <PreTestTabLeftContent>
        <PreTestTitle>{transI18n('pretest.settingTitle')}</PreTestTitle>
        {(showStage ? SETTINGS : DEVICE_SETTINGS).map((item) => (
          <PreTestTabHeader
            key={item}
            activity={currentPretestTab === item}
            onClick={() => handleTabChange(item)}>
            <Icon type={item} activity={currentPretestTab === item}>
              <SvgImg type={SvgImgType[item]} colors={{ iconPrimary: '#fff' }} size={18} />
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

const PretestModal: FC<{ children: React.ReactNode; closeable?: boolean }> = ({
  children,
  closeable,
}) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(true);
  }, []);

  return (
    <OverlayWrap opened={opened}>
      <Modal>
        {closeable && <></>}
        {children}
      </Modal>
    </OverlayWrap>
  );
};

const Modal: FC = ({ children }) => (
  <div
    className="bg-component"
    style={{
      width: 671,
      height: 630,
      borderRadius: primaryRadius,
      boxShadow: '-1px 10px 60px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
    }}>
    {children}
  </div>
);

const PreTestContent: FC = ({ children }) => <div className="flex w-full h-full">{children}</div>;

const PreTestTabLeftContent: FC = ({ children }) => (
  <div
    className="border-divider"
    style={{
      flexBasis: 160,
      paddingTop: 40,
      borderRight: '1px solid #dceafe',
      flexShrink: 0,
    }}>
    {' '}
    {children}
  </div>
);

const PreTestTitle: FC = ({ children }) => (
  <div
    className="text-level1"
    style={{
      fontWeight: 800,
      fontSize: 26,
      paddingLeft: 25,
      marginBottom: 32,
    }}>
    {children}
  </div>
);

const PreTestTabContent: FC = ({ children }) => (
  <div className="flex flex-grow flex-col justify-between">{children}</div>
);

const PreTestTabHeader: FC<{ activity: boolean; onClick: () => void }> = ({
  children,
  activity,
  onClick,
}) => {
  const background = activity ? brandColor : 'transparent';
  const fontWeight = activity ? 700 : 500;

  const text = activity ? 'text-white' : 'text-level1';

  return (
    <div
      className={`flex items-center ${text}`}
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

const Icon: FC<{ type: DeviceType | 'stage'; activity: boolean }> = ({
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
      className="flex justify-center items-center"
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
