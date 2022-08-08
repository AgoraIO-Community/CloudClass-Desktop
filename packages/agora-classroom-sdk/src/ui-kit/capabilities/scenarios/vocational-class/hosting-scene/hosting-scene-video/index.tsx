import { useStore } from '@/infra/hooks/ui-store';
import {
  VideoLivePlayer,
  VideoLivePlayerRef,
} from '@/ui-kit/capabilities/containers/stream/video-live-player';
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
import { transI18n } from '~ui-kit';

const testVideoURL =
  'https://cloud.video.taobao.com//play/u/611232217/p/1/e/6/t/1/304659236072.mp4';

// const testVideoURL = 'https://view.2amok.com/20220708/26bad18fdf6816ecc37e0fcef27d9c8f.mp4';

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

  const currentTimeRef = useRef(0);
  useEffect(() => {
    const t =
      navigationBarUIStore.classTimeDuration >= 0 ? navigationBarUIStore.classTimeDuration : 0;
    currentTimeRef.current = Math.floor(t / 1000);
  }, [navigationBarUIStore.classTimeDuration]);

  const getLiveTime = useCallback(() => {
    return currentTimeRef.current;
  }, []);

  useEffect(() => {
    switch (classroomSchedule.state) {
      case ClassState.ongoing:
        videoRef.current?.play(currentTimeRef.current);
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

  useEffect(() => {
    const visibilitychange = () => {
      if (!document.hidden) {
        if (classroomSchedule.state === ClassState.ongoing) {
          videoRef.current?.play(currentTimeRef.current);
        }
      }
    };
    document.addEventListener('visibilitychange', visibilitychange);
    return () => {
      document.removeEventListener('visibilitychange', visibilitychange);
    };
  }, [classroomSchedule.state]);

  return (
    <VideoLivePlayer
      ref={videoRef}
      url={hostingScene?.videoURL}
      placeholderText={transI18n('fcr_vocational_teacher_absent')}
      ended={closeClass}
      getLiveTime={getLiveTime}
    />
  );
});
