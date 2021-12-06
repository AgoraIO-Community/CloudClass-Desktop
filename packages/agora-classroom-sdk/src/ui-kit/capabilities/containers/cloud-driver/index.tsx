import { observer } from 'mobx-react';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { useStore } from '~hooks/use-edu-stores';
import { TabPane, Tabs, transI18n, SvgImg } from '~ui-kit';
import { PublicResourcesContainer } from './public-resource';
import { PersonalResourcesContainer } from './person-resource';
import './index.css';

export type CloudDriveContainerProps = {
  onClose?: () => void;
  onDelete?: (fileName: string) => void;
};

enum ActiveKeyEnum {
  public = '1',
  person = '2',
  download = '3',
}

export const CloudDriverContainer: React.FC<CloudDriveContainerProps> = observer(({ onClose }) => {
  const [activeKey, setActiveKey] = useState<ActiveKeyEnum>(ActiveKeyEnum.public);

  const handleChange = (key: string) => {
    setActiveKey(key as ActiveKeyEnum);
  };

  return (
    <Draggable bounds=".track-bounds" handle=".tabs-nav" positionOffset={{ y: 27, x: 0 }}>
      <div className="agora-board-resources cloud-wrap">
        <div className="btn-pin">
          <SvgImg type="close" style={{ cursor: 'pointer' }} onClick={onClose} />
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
  );
});
