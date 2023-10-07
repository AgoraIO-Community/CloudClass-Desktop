import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { useCallback } from 'react';
import { FC } from 'react';
import { VideoGalleryPortal } from '../../dialog/video-gallery';
import { RtcEngineContext } from './context';
import { useRtcEngine, useVideoGalleryState } from './hooks';
import { VideoRenderer } from './renderer';

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

  const renderVideo = useCallback((stream: EduStreamUI) => <VideoRenderer stream={stream} />, []);

  return (
    <RtcEngineContext.Provider value={{ rtcEngine }}>
      <div className="fcr-w-full fcr-h-full fcr-flex fcr-flex-col">
        <VideoGalleryPortal
          className="main-content fcr-h-full"
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
