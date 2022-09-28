import { useStore } from '@/infra/hooks/ui-store';
import {
  VideoLivePlayer,
  VideoLivePlayerRef,
} from '@/ui-kit/capabilities/containers/stream/video-live-player';
import {  ClassState } from 'agora-edu-core';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useRef } from 'react';
import { transI18n } from '~ui-kit';

export const HostingSceneVideo = observer(() => {
  const { classroomStore, navigationBarUIStore } = useStore();
  const {
    roomStore: { hostingScene, classroomSchedule },
  } = classroomStore;

  const closeClass = useCallback(() => {
    runInAction(() => {
      classroomSchedule.state = ClassState.close;
    });
  }, [classroomSchedule.state]);

  const videoRef = useRef<VideoLivePlayerRef>(null);

  const currentTimeRef = useRef(0);
  useEffect(() => {
    const t =
      navigationBarUIStore.classTimeDuration >= 0 ? navigationBarUIStore.classTimeDuration : 0;
    currentTimeRef.current = Math.floor(t / 1000);
  }, [navigationBarUIStore.classTimeDuration]);

  // 获取直播课堂的进度时间
  const getLiveTime = useCallback(() => {
    return currentTimeRef.current;
  }, []);

  // 课堂开始后播放视频
  useEffect(() => {
    switch (classroomSchedule.state) {
      case ClassState.ongoing:
        videoRef.current?.play(currentTimeRef.current);
        break;
    }
  }, [classroomSchedule.state]);

  // 当窗口visibility状态变更的时候更新播放进度
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
