import { EduStream, EduUserStruct } from 'agora-edu-core';
import { AgoraRteVideoSourceType } from 'agora-rte-sdk';
import { EduStreamUI } from '../stores/common/stream/struct';

export const extractUserStreams = (
  users: Map<string, EduUserStruct>,
  streamByUserUuid: Map<string, Set<string>>,
  streamByStreamUuid: Map<string, EduStream>,
) => {
  const streams = new Set<EduStream>();
  for (const user of users.values()) {
    const streamUuids = streamByUserUuid.get(user.userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      const stream = streamByStreamUuid.get(streamUuid);
      if (stream) {
        streams.add(stream);
      }
    }
  }
  return streams;
};

export const extractStreamBySourceType = (
  streams: Set<EduStreamUI>,
  sourceType: AgoraRteVideoSourceType,
) => {
  for (const stream of streams) {
    if (stream.stream.videoSourceType === sourceType) {
      return stream;
    }
  }
};
