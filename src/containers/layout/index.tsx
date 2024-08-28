import { useStore } from '@classroom/hooks/ui-store';
import { useEffectOnce } from '@classroom/hooks/utilites';
import { SvgImg, SvgIconEnum } from '@classroom/ui-kit';
import { Layout, LayoutProps } from '@classroom/ui-kit/components/layout';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';

export const Room: FC<Props> = observer(({ children }) => {
  const { join } = useStore();

  useEffectOnce(() => {
    join();
  });

  return <React.Fragment>{children}</React.Fragment>;
});

export const LayoutOrientation: FC<LayoutProps> = observer(
  ({ className, children, ...restProps }) => {
    const { shareUIStore } = useStore();
    useEffect(() => {
      shareUIStore.addOrientationchange();
      shareUIStore.addWindowResizeEventListener();
      return () => {
        shareUIStore.removeOrientationchange();
        shareUIStore.removeWindowResizeEventListener();
      };
    }, []);
    return (
      <Layout className={classnames(className)} {...restProps}>
        {children}
      </Layout>
    );
  },
);

type Props = {
  children?: React.ReactNode;
};

export const LayoutContainer: FC<Props> = observer(({ children }) => {
  const {
    layoutUIStore: { h5ContainerCls },
    shareUIStore: { classroomViewportClassName },
  } = useStore();
  return (
    <section
      className={`h5-layout-container fcr-flex fcr-h-full ${h5ContainerCls} ${classroomViewportClassName}`}>
      {children}
    </section>
  );
});

export const RoomInfo = observer(() => {
  const {
    getters: { userCount, classStatusText },
    streamUIStore: { toolVisible },
    layoutUIStore: { isRecording },
  } = useStore();
  return toolVisible ? (
    <>
      {isRecording && (
        <div className="fcr-mobile-room-info-record-container">
          <SvgImg
            className="recording-icon"
            type={SvgIconEnum.FCR_RECORDING_STOP}
            size={18}
            colors={{ iconPrimary: 'red' }}></SvgImg>
          <span>REC</span>
        </div>
      )}

      {/* <div className="fcr-mobile-room-info-container">
        <div className="fcr-mobile-room-info-user-count-container">
          <SvgImg type={SvgIconEnum.USER_COUNT} size={18} />
          <span>{userCount} </span>
        </div>

        {classStatusText && (
          <div className="fcr-mobile-room-info-time-container">{classStatusText}</div>
        )}
      </div> */}
    </>
  ) : null;
});
