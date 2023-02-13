import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { ATabPane, ATabs, SvgImg, OverlayWrap, Popover, SvgIconEnum } from '@classroom/ui-kit';
import { PublicResourcesContainer } from './public-resource';
import { PersonalResourcesContainer } from './person-resource';
import './index.css';
import { CloudDriverContainerProps } from '.';
import { useDraggableDefaultCenterPosition } from '@classroom/ui-kit/utilities/hooks';
import CloudHelp from './cloud-help';
import { useI18n } from 'agora-common-libs';

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
  const transI18n = useI18n();
  const bounds = '.classroom-track-bounds';
  const cancel = '.ant-tabs-tab';
  const defaultRect = useDraggableDefaultCenterPosition({
    draggableWidth: modalSize.width,
    draggableHeight: modalSize.height,
    bounds,
  });
  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        bounds={bounds}
        cancel={cancel}
        dragHandleClassName="ant-tabs-nav"
        enableResizing={false}
        default={defaultRect}>
        <div className="agora-board-resources cloud-wrap" style={modalSize}>
          <div className="btn-pin">
            <Popover content={<CloudHelp />} placement={'bottom'}>
              <span>
                <SvgImg
                  type={SvgIconEnum.CLOUD_FILE_HELP}
                  style={{ cursor: 'pointer', color: '#7B88A0', marginRight: 10 }}
                />
              </span>
            </Popover>
            <SvgImg
              type={SvgIconEnum.CLOSE}
              style={{ cursor: 'pointer', color: '#7B88A0' }}
              onClick={() => setOpened(false)}
            />
          </div>
          <ATabs activeKey={activeKey} onChange={handleChange} className="cloud-driver-tab">
            <ATabPane tab={transI18n('cloud.publicResources')} key={ActiveKeyEnum.public}>
              <PublicResourcesContainer />
            </ATabPane>
            <ATabPane tab={transI18n('cloud.personalResources')} key={ActiveKeyEnum.person}>
              <PersonalResourcesContainer />
            </ATabPane>
          </ATabs>
        </div>
      </Rnd>
    </OverlayWrap>
  );
};
