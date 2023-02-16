import { useLectureH5UIStores, useStore } from '@classroom/infra/hooks/ui-store';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect } from 'react';
import { CameraPlaceHolder } from '@classroom/ui-kit';

import './index.mobile.css';
import { TrackPlayer } from '../stream/track-player';
import { AgoraRteMediaPublishState, AGRemoteVideoStreamType, AGRtcState } from 'agora-rte-sdk';

type StreamPlayerH5Props = {
  stream: EduStreamUI;
  className?: string;
  style?: CSSProperties;
};
export const StreamPlayerH5 = observer<FC<StreamPlayerH5Props>>(
  ({ stream, className = '', style }) => {
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
      <div className={`fcr-stream-player-h5 ${className}`} style={style}>
        <TrackPlayer stream={stream} />
      </div>
    );
  },
);
