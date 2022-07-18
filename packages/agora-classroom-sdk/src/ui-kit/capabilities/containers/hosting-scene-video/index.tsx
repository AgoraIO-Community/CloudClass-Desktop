import { useStore } from '@/infra/hooks/ui-store';
import {
  AgoraEduClassroomEvent,
  ClassState,
  EduClassroomConfig,
  EduEventCenter,
  EduRoleTypeEnum,
} from 'agora-edu-core';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useRef } from 'react';
import { VideoLivePlayer, VideoLivePlayerRef } from '../stream/video-live-player';

// const testVideoURL =
//   'https://cloud.video.taobao.com//play/u/611232217/p/1/e/6/t/1/304659236072.mp4';

const testVideoURL = 'https://view.2amok.com/20220708/26bad18fdf6816ecc37e0fcef27d9c8f.mp4';

export const HostingSceneVideo = observer(() => {
  const { classroomStore, navigationBarUIStore } = useStore();
  const {
    roomStore: { updateHostingSceneProperties, hostingScene, classroomSchedule },
  } = classroomStore;

  const closeClass = useCallback(() => {
    runInAction(() => {
      classroomSchedule.state = ClassState.close;
    });
  }, [classroomSchedule]);

  const videoRef = useRef<VideoLivePlayerRef>(null);

  useEffect(() => {
    switch (classroomSchedule.state) {
      case ClassState.ongoing:
        videoRef.current?.play(Math.floor(navigationBarUIStore.classTimeDuration / 1000));
        break;
    }
  }, [classroomSchedule.state]);

  useEffect(() => {
    const isTeacher = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
    if (isTeacher) {
      EduEventCenter.shared.onClassroomEvents((event: AgoraEduClassroomEvent) => {
        if (event === AgoraEduClassroomEvent.Ready) {
          // 已经设置过了伪直播信息
          if (hostingScene && hostingScene.videoURL) {
            return;
          }
          updateHostingSceneProperties(
            {
              videoURL: testVideoURL,
              reserveVideoURL: testVideoURL,
              finishType: 0,
            },
            {},
          );
        }
      });
    }
  }, []);
  return (
    <VideoLivePlayer
      ref={videoRef}
      url={hostingScene?.videoURL}
      placeholderText="老师当前不在教室中"
      ended={closeClass}
      currentTime={Math.floor(navigationBarUIStore.classTimeDuration / 1000)}
    />
  );
});
