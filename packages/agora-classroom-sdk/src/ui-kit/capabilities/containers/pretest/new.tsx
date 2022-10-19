import { useStore } from '@/infra/hooks/ui-store';
import { primaryRadius, brandColor } from '@/infra/utils/colors';
import { observer } from 'mobx-react';
import { FC, useCallback } from 'react';
import tw, { styled, css } from 'twin.macro';
import { transI18n, SvgImg, SvgIconEnum } from '~ui-kit';
import { BaseProps } from '~ui-kit/components/util/type';
import { Footer } from './pretest-footer';
import { PretestVideo } from './pretest-video';
import { PretestVoice } from './pretest-voice';

export interface PretestProps extends BaseProps {
  className?: string;
  onOK?: () => void;
}

type deviceType = 'audio' | 'video';

const SETTINGS: deviceType[] = ['audio', 'video'];
const SvgImgType = { audio: SvgIconEnum.MICROPHONE_ON, video: SvgIconEnum.RECORDING };

export const RoomPretest: FC<PretestProps> = observer(({ onOK }) => {
  const {
    pretestUIStore: { currentPretestTab, setCurrentTab },
  } = useStore();

  const handleTabChange = useCallback((tab: deviceType) => {
    setCurrentTab(tab);
  }, []);

  const handleOK = useCallback(() => {
    onOK && onOK();
  }, []);

  return (
    <OverlayModal>
      <Modal>
        <PreTestContent>
          <PreTestTabLeftContent>
            <PreTestTitle>{transI18n('pretest.settingTitle')}</PreTestTitle>
            {SETTINGS.map((item) => (
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
            <Footer onOK={handleOK} visibleMirror={currentPretestTab === 'video'} />
          </PreTestTabContent>
        </PreTestContent>
      </Modal>
    </OverlayModal>
  );
});

export type RoomPretestContainerProps = {
  onOK?: () => void;
};

const OverlayModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Modal = styled.div`
  background: ${tw`bg-background`};
  width: 671px;
  height: 630px;
  border-radius: ${primaryRadius};
  box-shadow: -1px 10px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

const PreTestContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const PreTestTabLeftContent = styled.div`
  flex-basis: 160px;
  padding-top: 40px;
  border-right: 1px solid #dceafe;
`;

const PreTestTitle = styled.div`
  font-weight: 800;
  font-size: 26px;
  padding-left: 25px;
  margin-bottom: 32px;
  ${tw`text-level1`};
`;

const PreTestTabContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PreTestTabHeader = styled.div<{ activity: boolean }>`
  ${(props) => css`
    background: ${props.activity ? brandColor : 'transparent'};
    font-weight: ${props.activity ? 700 : 500};
    ${props.activity ? tw`text-white` : tw`text-level1`};
  `}
  margin: 0 15px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  font-size: 16px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
`;

const Icon = styled.div<{ type: deviceType; activity: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => {
    switch (props.type) {
      case 'video':
        return props.activity ? 'transparent' : '#7C79FF';
      case 'audio':
        return props.activity ? 'transparent' : '#83BC53';
    }
  }};
`;
