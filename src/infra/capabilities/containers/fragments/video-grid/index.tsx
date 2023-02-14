import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { useCallback } from 'react';
import { FC } from 'react';
import { VideoGalleryPortal } from '../../dialog/video-gallery';
import { RtcEngineContext } from './context';
import { useRtcEngine, useVideoGalleryState } from './hooks';
import { RemoteRenderer } from './renderer';

type Props = {
  //
};

export const VideoGallery: FC<Props> = () => {
  const {
    options,
    pageSize,
    curPage,
    totalPageNum,
    setPageSize,
    nextPage,
    prevPage,
    streamList,
    stageUserUuids,
    onStage,
    offStage,
  } = useVideoGalleryState();

  const { rtcEngine } = useRtcEngine();

  const renderVideo = useCallback(
    (stream: EduStreamUI) => <RemoteRenderer uid={parseInt(stream.stream.streamUuid)} />,
    [],
  );

  return (
    <RtcEngineContext.Provider value={{ rtcEngine }}>
      <div className="w-full h-full flex flex-col">
        <VideoGalleryPortal
          className="main-content"
          streamList={streamList}
          options={options}
          pageSize={pageSize}
          setPageSize={setPageSize}
          curPage={curPage}
          nextPage={nextPage}
          prevPage={prevPage}
          totalPageNum={totalPageNum}
          renderVideo={renderVideo}
          stageUserUuids={stageUserUuids}
          onStageClick={onStage}
          offStageClick={offStage}
        />
      </div>
    </RtcEngineContext.Provider>
  );
};
