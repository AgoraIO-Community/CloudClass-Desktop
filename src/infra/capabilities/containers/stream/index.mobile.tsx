import { useLectureH5UIStores, useStore } from '@classroom/infra/hooks/ui-store';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect } from 'react';
import { CameraPlaceHolder } from '@classroom/ui-kit';

import './index.mobile.css';
import { TrackPlayer } from '../stream/track-player';
import { AgoraRteMediaPublishState, AGRemoteVideoStreamType, AGRtcState } from 'agora-rte-sdk';

type StreamPlayerMobileProps = {
  stream: EduStreamUI;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};
export const StreamPlayerMobile = observer<FC<StreamPlayerMobileProps>>(
  ({ stream, className = '', style, onClick }) => {
    const {
      shareUIStore: { isLandscape },
      classroomStore: {
        streamStore: { setRemoteVideoStreamType },
        connectionStore: { rtcState },
      },
    } = useLectureH5UIStores();
    useEffect(() => {
      if (
        rtcState === AGRtcState.Connected &&
        stream.stream.videoState === AgoraRteMediaPublishState.Published
      ) {
        if (isLandscape) {
          setRemoteVideoStreamType(stream.stream.streamUuid, AGRemoteVideoStreamType.HIGH_STREAM);
        } else {
          setRemoteVideoStreamType(stream.stream.streamUuid, AGRemoteVideoStreamType.LOW_STREAM);
        }
      }
    }, [isLandscape, stream.stream.videoState, rtcState]);
    return (
      <div onClick={onClick} className={`fcr-stream-player-h5 ${className}`} style={style}>
        <TrackPlayer stream={stream} />
      </div>
    );
  },
);
export const TeacherCameraPlaceHolderMobile = observer(() => {
  const {
    layoutUIStore: { toggleLandscapeToolBarVisible },
    streamUIStore: { teacherVideoStreamSize },
    classroomStore: {
      roomStore: { flexProps },
    },
  } = useLectureH5UIStores();
  return (
    <div
      onClick={toggleLandscapeToolBarVisible}
      className="t-0 l-0"
      style={{
        background: 'rgba(39, 41, 47, 1)',
        ...teacherVideoStreamSize,
      }}>
      <div
        className="fcr-stream-placeholder-mobile rounded-full absolute top-0 bottom-0 left-0 right-0 m-auto text-center"
        style={{ background: 'rgba(66, 98, 255, 1)' }}>
        {generateShortUserName(flexProps['teacherName'] || 'teacher')}
      </div>
    </div>
  );
});
/**
 * 生成用户缩略姓名
 */
const generateShortUserName = (name: string) => {
  const names = name.split(' ');
  const [firstWord] = names;
  const lastWord = names[names.length - 1];
  const firstLetter = firstWord.split('')[0];
  const secondLetter =
    names.length > 1 ? lastWord.split('')[0] : lastWord.length > 1 ? lastWord.split('')[1] : '';
  return `${firstLetter}${secondLetter}`.toUpperCase();
};
