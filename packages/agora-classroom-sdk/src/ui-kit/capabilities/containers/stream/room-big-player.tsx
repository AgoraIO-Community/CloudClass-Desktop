import { useMemo, useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLectureUIStores } from '~hooks/use-edu-stores';
import { StreamPlayer, StreamPlaceholder } from '.';
import { EduRoleTypeEnum, EduStreamUI } from 'agora-edu-core';
import { EduLectureUIStore } from '@/infra/stores/lecture';

export const RoomBigTeacherStreamContainer = observer(({ children }: any) => {
  const [videoPlayerHeight, setVideoPlayerHeight] = useState(0);
  const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;
  const { teacherCameraStream } = streamUIStore;
  const teacherStreamContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = parseFloat(getComputedStyle(teacherStreamContainer.current as HTMLDivElement).width);
    const h = (9 * w) / 16;
    setVideoPlayerHeight(h);
  }, []);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column' }}
      className="teacher-stream-container"
      ref={teacherStreamContainer}>
      {teacherCameraStream ? (
        <StreamPlayer
          stream={teacherCameraStream}
          style={{ height: videoPlayerHeight }}></StreamPlayer>
      ) : (
        <StreamPlaceholder
          role={EduRoleTypeEnum.teacher}
          style={{ width: '100%', height: videoPlayerHeight }}
        />
      )}
    </div>
  );
});

export const RoomBigStudentStreamsContainer = observer(() => {
  const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;
  const { carouselStreams, videoStreamSize, gap } = streamUIStore;

  const videoStreamStyle = useMemo(
    () => ({
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    }),
    [videoStreamSize.width, videoStreamSize.height],
  );

  return (
    <div className="flex-grow">
      <div className="h-full flex justify-center items-center">
        {carouselStreams.map((stream: EduStreamUI, idx: number) => (
          <div
            style={{ marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2 }}
            key={stream.stream.streamUuid}>
            <StreamPlayer stream={stream} style={videoStreamStyle}></StreamPlayer>
          </div>
        ))}
      </div>
    </div>
  );
});
