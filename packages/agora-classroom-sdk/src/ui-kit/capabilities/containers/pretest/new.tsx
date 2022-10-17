import { primaryRadius, brandColor } from '@/infra/utils/colors';
import { FC, useCallback, useEffect, useState } from 'react';
import tw, { styled, css } from 'twin.macro';
import { Button, AModal, transI18n, SvgImg, SvgIconEnum } from '~ui-kit';
import { BaseProps } from '~ui-kit/components/util/type';
import { PretestVideo } from './pretest-video';
import { PretestVoice } from './pretest-voice';

export interface PretestProps extends BaseProps {
  className?: string;
  onOK?: () => void;
}

type deviceType = 'voice' | 'video';

const SETTINGS: deviceType[] = ['voice', 'video'];
const SvgImgType = { voice: SvgIconEnum.MICROPHONE_ON, video: SvgIconEnum.RECORDING };

export const RoomPretest: FC<PretestProps> = ({ onOK }) => {
  const [currentTab, setCurrentTab] = useState<deviceType>('video');
  const [visible, setVisible] = useState<boolean>(false);
  const handleTabChange = useCallback((tab: deviceType) => {
    setCurrentTab((_) => tab);
  }, []);

  useEffect(() => {
    setVisible(true);
    return () => {
      setVisible(false);
    };
  }, []);

  return (
    <PretestModal
      open={visible}
      footer={null}
      width={671}
      bodyStyle={{ height: 630 }}
      onOk={onOK}
      centered={true}
      destroyOnClose={true}
      onCancel={() => {}}>
      <PreTestContent>
        <PreTestTabLeftContent>
          <PreTestTitle>Setting</PreTestTitle>
          {SETTINGS.map((item) => (
            <PreTestTabHeader
              key={item}
              activity={currentTab === item}
              onClick={() => handleTabChange(item)}>
              <Icon type={item} activity={currentTab === item}>
                <SvgImg type={SvgImgType[item]} colors={{ iconPrimary: '#fff' }} size={18} />
              </Icon>
              {item}
            </PreTestTabHeader>
          ))}
        </PreTestTabLeftContent>
        <PreTestTabContent>
          {currentTab === 'voice' && <PretestVoice />}
          {currentTab === 'video' && <PretestVideo />}
        </PreTestTabContent>
      </PreTestContent>
    </PretestModal>
  );
};

export type RoomPretestContainerProps = {
  onOK?: () => void;
};

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
      case 'voice':
        return props.activity ? 'transparent' : '#83BC53';
    }
  }};
`;

const PretestModal = styled(AModal)`
  & .ant-modal-content {
    border-radius: ${primaryRadius};
    box-shadow: -1px 10px 60px rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }
  & .ant-modal-body {
    padding: 0;
    /* ${tw`bg-background`}; */
    background: #fff;
  }
`;

const AButton = styled(Button)``;
