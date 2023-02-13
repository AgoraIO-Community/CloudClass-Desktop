import { EduStream, EduUserStruct } from 'agora-edu-core';
import { AgoraRteVideoSourceType } from 'agora-rte-sdk';

/**
 * 提取流列表
 */
export const extractUserStreams = (
  users: Map<string, EduUserStruct>,
  streamByUserUuid: Map<string, Set<string>>,
  streamByStreamUuid: Map<string, EduStream>,
  sourceTypes: AgoraRteVideoSourceType[],
) => {
  const streams = new Set<EduStream>();
  for (const user of users.values()) {
    const streamUuids = streamByUserUuid.get(user.userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      const stream = streamByStreamUuid.get(streamUuid);

      if (stream && sourceTypes.includes(stream.videoSourceType)) {
        streams.add(stream);
      }
    }
  }
  return streams;
};
