import { useStore } from '@classroom/hooks/ui-store';
import { EduStreamUI } from '@classroom/uistores/stream/struct';
import { observer } from 'mobx-react';
import { CSSProperties, FC, memo, useContext, useEffect, useRef } from 'react';

import './index.css';
import { TrackPlayer } from './track-player';
import { AgoraRteMediaPublishState, AGRemoteVideoStreamType, AGRtcState } from 'agora-rte-sdk';
import classNames from 'classnames';
import { EduClassroomConfig, EduRoleTypeEnum, RteRole2EduRole } from 'agora-edu-core';
import { toUpper } from 'lodash';

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
    } = useStore();
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
    const userName = stream.fromUser.userName;
    const [first, last] = splitName(userName)
    const roomType = EduClassroomConfig.shared.sessionInfo.roomType;
    const isTeacher = RteRole2EduRole(roomType, stream.fromUser.role) === EduRoleTypeEnum.teacher;
    return <div onClick={onClick} className={`fcr-stream-player-mobile ${className}`} style={style}>
      <div
        className={classNames('fcr-stream-player-mobil-placeholder', {
          'fcr-stream-player-mobil-placeholder-teacher': isTeacher,
        })}>
        {`${first}${last}`}
      </div>
      <TrackPlayer stream={stream} />
    </div>
  },
);
export const TeacherCameraPlaceHolderMobile = observer(() => {
  const {
    layoutUIStore: { toggleLandscapeToolBarVisible },
    streamUIStore: { teacherVideoStreamSize },
    classroomStore: {
      roomStore: { flexProps },
    },
  } = useStore();
  const [first, last] = splitName(flexProps['teacherName'])
  return (
    <div
      onClick={toggleLandscapeToolBarVisible}
      className="fcr-t-0 fcr-l-0"
      style={{
        background: 'rgba(39, 41, 47, 1)',
        ...teacherVideoStreamSize,
      }}>
      <div
        className="fcr-stream-placeholder-mobile fcr-rounded-full fcr-absolute fcr-t-0 fcr-b-0 fcr-l-0 fcr-r-0 fcr-m-auto fcr-text-center"
        style={{ background: 'rgba(66, 98, 255, 1)' }}>
        {`${first}${last}`}
      </div>
    </div>
  );
});
export const LocalTrackPlayerMobile = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { studentVideoStreamSize },
  } = useStore();
  const userName = stream.fromUser.userName;
  const [first, last] = splitName(userName)
  return (
    <div
      className="fcr-stream-player-mobile"
      style={{
        width: studentVideoStreamSize.width,
        height: studentVideoStreamSize.height,
      }}>
      <div className={classNames('fcr-stream-player-mobil-placeholder')}>
        {`${first}${last}`}
      </div>
      {!stream?.isCameraMuted && (
        <LocalTrackPlayer
          renderAt="Window"
          style={{
            width: studentVideoStreamSize.width,
            height: studentVideoStreamSize.height,
            position: 'relative',
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
});
export const LocalTrackPlayer = memo(
  observer(({ style, renderAt }: { style: CSSProperties; renderAt: 'Preview' | 'Window' }) => {
    const {
      streamUIStore: { setupLocalVideo, localVideoRenderAt },
      deviceSettingUIStore: { facingMode },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (ref.current && localVideoRenderAt === renderAt) {
        setupLocalVideo(ref.current, facingMode === 'user');
      }
    }, [setupLocalVideo, facingMode, localVideoRenderAt]);
    return <div style={style} ref={ref}></div>;
  }),
);
/**
 * 生成用户缩略姓名
 */
// export const generateShortUserName = (name: string) => {
//   const names = name.split(' ');
//   const [firstWord] = names;
//   const lastWord = names[names.length - 1];
//   const firstLetter = firstWord.split('')[0];
//   const secondLetter =
//     names.length > 1 ? lastWord.split('')[0] : lastWord.length > 1 ? lastWord.split('')[1] : '';
//   return `${firstLetter}${secondLetter}`.toUpperCase();
// };

export const splitName = (userName: string) => {
  const names = userName.split(' ');
  const [firstWord] = names;
  const lastWord = names[names.length - 1];
  const firstLetter = firstWord.split('')[0];
  const secondLetter =
    names.length > 1 ? lastWord.split('')[0] : lastWord.length > 1 ? lastWord.split('')[1] : '';
  return filterChineseWord([toUpper(firstLetter), toUpper(secondLetter)]);
}
const filterChineseWord = (word: string[]) => {
  const reg = /[\u4e00-\u9fa5]/;
  if (reg.test(word[1])) {
    return [word[0], ''];
  }
  return word;
}
