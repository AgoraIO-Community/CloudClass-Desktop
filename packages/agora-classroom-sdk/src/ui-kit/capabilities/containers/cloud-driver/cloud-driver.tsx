import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { TabPane, Tabs, transI18n, SvgImg, OverlayWrap } from '~ui-kit';
import { PublicResourcesContainer } from './public-resource';
import { PersonalResourcesContainer } from './person-resource';
import './index.css';
import { CloudDriverContainerProps } from '.';

export enum ActiveKeyEnum {
  public = '1',
  person = '2',
  download = '3',
}

export type CloudDriverProps = {
  activeKey: ActiveKeyEnum;
  handleChange: (key: string) => void;
} & CloudDriverContainerProps;

export const CloudDriver = ({ onClose, activeKey, handleChange }: CloudDriverProps) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);
  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Draggable bounds=".track-bounds" handle=".tabs-nav" positionOffset={{ y: 27, x: 0 }}>
        <div className="agora-board-resources cloud-wrap">
          <div className="btn-pin">
            <SvgImg type="close" style={{ cursor: 'pointer' }} onClick={() => setOpened(false)} />
          </div>
          <Tabs activeKey={activeKey} onChange={handleChange}>
            <TabPane tab={transI18n('cloud.publicResources')} key={ActiveKeyEnum.public}>
              <PublicResourcesContainer />
            </TabPane>
            <TabPane tab={transI18n('cloud.personalResources')} key={ActiveKeyEnum.person}>
              <PersonalResourcesContainer />
            </TabPane>
          </Tabs>
        </div>
      </Draggable>
    </OverlayWrap>
  );
};
