import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { TabPane, Tabs, transI18n, SvgImg, OverlayWrap } from '~ui-kit';
import { PublicResourcesContainer } from './public-resource';
import { PersonalResourcesContainer } from './person-resource';
import './index.css';
import { CloudDriverContainerProps } from '.';
import { useDraggableDefaultCenterPosition } from '~ui-kit/utilities/hooks';

export enum ActiveKeyEnum {
  public = '1',
  person = '2',
  download = '3',
}

export type CloudDriverProps = {
  activeKey: ActiveKeyEnum;
  handleChange: (key: string) => void;
} & CloudDriverContainerProps;

const modalSize = { width: 606, height: 540 };

export const CloudDriver = ({ onClose, activeKey, handleChange }: CloudDriverProps) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);

  const defaultPos = useDraggableDefaultCenterPosition({
    draggableWidth: modalSize.width,
    draggableHeight: modalSize.height,
  });

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        bounds=".classroom-track-bounds"
        dragHandleClassName="tabs-nav"
        enableResizing={false}
        default={defaultPos}>
        <div className="agora-board-resources cloud-wrap" style={modalSize}>
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
      </Rnd>
    </OverlayWrap>
  );
};
