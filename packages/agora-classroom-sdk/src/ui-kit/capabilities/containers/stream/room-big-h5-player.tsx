import { useLectureH5UIStores } from '@/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import { StreamPlayerH5, StreamPlaceholder, CarouselGroup } from '.';
import { FC, useCallback, useState } from 'react';
import { Layout } from '~components/layout';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react-lite';
import { NavGroup } from '.';
import classnames from 'classnames';
import { SvgImg } from '~ui-kit';

export const RoomBigTeacherStreamH5Container: FC = observer(() => {
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
        <StreamPlayerH5 stream={teacherCameraStream} style={teacherVideoStreamSize} />
      ) : (
        <StreamPlaceholder role={EduRoleTypeEnum.teacher} style={teacherVideoStreamSize} />
      )}
      <SvgImg
        type={iconZoomType}
        size={18}
        className={classnames('stream-zoom-status', iconZoomVisibleCls)}
        onClick={handleZoomStatus}
      />
    </Layout>
  );
});

export const RoomBigStudentStreamsH5Container: FC = observer(() => {
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
