import React, { FC, useCallback, useState } from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';

export interface CloudDiskProps extends ToolItem {
  label: string;
  children?: React.ReactElement;
}

export const CloudDisk: FC<CloudDiskProps> = ({ label, children }) => {
  // const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  // const actionClose = useCallback(() => {
  //   setPopoverVisible(false);
  // }, []);

  // const Content = useCallback(
  //   () => (
  //     <div className={`expand-tools cloud-disk`}>
  //       {children ? React.cloneElement(children, { actionClose }, null) : null}
  //     </div>
  //   ),
  //   [children, actionClose],
  // );
  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip">
      {/* <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => {
          setPopoverVisible(visible);
        }}
        overlayClassName="customize-dialog-popover"
        trigger="click"
        content={<Content />}
        placement="right"> */}
      <div className="tool">
        <Icon type="cloud" />
      </div>
      {/* </Popover> */}
    </Tooltip>
  );
};
