import { useLectureH5UIStores } from '~hooks/use-edu-stores';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import { StreamPlayer, StreamPlaceholder, CarouselGroup } from '.';
import React, { FC, useCallback, useState } from 'react';
import { Layout } from '~components/layout';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react-lite';
import { NavGroup } from '.';
import { Icon, IconTypes } from '~ui-kit';
import classnames from 'classnames';

export const RoomBigTeacherStreamH5Container: FC<any> = observer(() => {
  const { streamUIStore } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    teacherCameraStream,
    teacherVideoStreamSize,
    iconZoomType,
    handleZoomStatus,
    streamLayoutContainerDimensions,
    streamLayoutContainerCls,
    iconZoomVisibleCls,
  } = streamUIStore;
  return (
    <Layout
      className={classnames('relative', streamLayoutContainerCls)}
      style={streamLayoutContainerDimensions}>
      {teacherCameraStream ? (
        <StreamPlayer stream={teacherCameraStream} style={teacherVideoStreamSize}></StreamPlayer>
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.teacher} style={teacherVideoStreamSize} />
      )}
      <Icon
        type={iconZoomType as IconTypes}
        size={18}
        className={classnames('stream-zoom-status', iconZoomVisibleCls)}
        onClick={handleZoomStatus}
      />
    </Layout>
  );
});

export const RoomBigStudentStreamsH5Container: FC<any> = observer(() => {
  const {
    streamUIStore,
    boardUIStore: { containerH5VisibleCls: addtionalContainerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    studentVideoStreamSize,
    scrollable,
    carouselPrev,
    carouselNext,
    gap,
    carouselStreams,
    containerH5VisibleCls,
    studentVideoStreamContainerHeight,
    containerH5Extend,
  } = streamUIStore;

  const [navigationVisible, setNavigationVisible] = useState(false);

  const mouseHandler = useCallback(
    (visible: boolean) => () => {
      setNavigationVisible(visible);
    },
    [],
  );
  return (
    <div
      onMouseEnter={mouseHandler(true)}
      onMouseLeave={mouseHandler(false)}
      className={classnames(
        'items-center',
        containerH5Extend,
        containerH5VisibleCls,
        addtionalContainerH5VisibleCls,
      )}
      style={{ height: studentVideoStreamContainerHeight }}>
      {scrollable && (
        <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
      )}
      <CarouselGroup
        gap={gap}
        videoWidth={studentVideoStreamSize.width}
        videoHeight={studentVideoStreamSize.height}
        carouselStreams={carouselStreams}
      />
    </div>
  );
});
