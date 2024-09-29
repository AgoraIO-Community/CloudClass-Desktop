import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { TeacherCameraPlaceHolder } from '../stream';
import { TeacherStreamContainer } from '../stream/player';
import { Layout } from '@classroom/ui-kit/components/layout';

export const TeacherStream = observer(() => {
  const {
    shareUIStore: { isLandscape },
    streamUIStore: {
      teacherCameraStream,
      containerH5VisibleCls,
      showTool,
      visibleStreams,
      subscribeMass,
      isPiP,
      teacherVideoStreamSize,
    },
  } = useStore();
  useEffect(() => {
    showTool();
  }, []);
  useEffect(() => {
    if (teacherCameraStream) {
      visibleStreams.set(teacherCameraStream.stream.streamUuid, teacherCameraStream.stream);
    }
    subscribeMass(visibleStreams);
  }, [teacherCameraStream]);
  
  const enabled =
    isLandscape || (teacherCameraStream && !teacherCameraStream.isCameraMuted && !isPiP);
  return (
    <Layout
      direction="col"
      style={{
        flexShrink: 0,
        height: enabled ? teacherVideoStreamSize.height : 0,
        // transition: 'height .2s',
        overflow: 'hidden',
      }}
      className={classnames(containerH5VisibleCls)}>
      {(!teacherCameraStream || teacherCameraStream.isCameraMuted) && isLandscape && (
        <TeacherCameraPlaceHolder></TeacherCameraPlaceHolder>
      )}
      {teacherCameraStream && !teacherCameraStream.isCameraMuted && (
        <TeacherStreamContainer stream={teacherCameraStream} />
      )}
    </Layout>
  );
});
