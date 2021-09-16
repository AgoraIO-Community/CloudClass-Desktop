import { ScreenShare } from '~ui-kit';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useScreenShareContext } from 'agora-edu-core';

export type ScreenShareContainerProps = {
  windowId: any;
  setWindowId: (newValue: any) => void;
};

export const ScreenShareContainer: React.FC<ScreenShareContainerProps> = observer((props) => {
  const { nativeAppWindowItems } = useScreenShareContext();

  return (
    <ScreenShare
      onActiveItem={(id: any) => {
        props.setWindowId(id);
      }}
      currentActiveId={props.windowId}
      screenShareTitle={'screen share'}
      windowItems={nativeAppWindowItems}></ScreenShare>
  );
});
