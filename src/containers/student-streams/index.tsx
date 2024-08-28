import { useStore } from '@classroom/hooks/ui-store';
import { SvgImg, SvgIconEnum, SvgImgMobile } from '@classroom/ui-kit';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import Award from '../award';
import { LocalTrackPlayerContainer, StreamPlayer } from '../stream';
import { StreamContext, convertStreamUIStatus } from '../stream/context';
import { AudioRecordinDeviceIcon } from '../stream/player';

export const StudentStreamsContainer = () => {
  return (
    <>
      {/* <StudentStreamCollapse></StudentStreamCollapse> */}
      <StudentStreams></StudentStreams>
    </>
  );
};
const StudentStreams = observer(() => {
  const {
    streamUIStore,
    classroomStore: {
      userStore: { rewards },
    },
    layoutUIStore: {},
    boardUIStore: { grantedUsers },
  } = useStore();
  const [current, setCurrent] = useState(0);
  const {
    studentVideoStreamSize,
    studentCameraStreams,
    containerH5VisibleCls,
    studentVideoStreamContainerHeight,
    containerH5Extend,
    studentStreamsVisible,
    visibleStreams,
    subscribeMass,
    toolVisible,
    toggleTool,
  } = streamUIStore;
  const visible = toolVisible && studentStreamsVisible;
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = () => {
    swiperRef.current?.slideTo(current - 3);
  };
  const handleNext = () => {
    swiperRef.current?.slideTo(current + 3);
  };
  useEffect(() => {
    swiperRef.current?.update();
  }, [studentCameraStreams]);

  return (
    <div
      className={classnames(
        'fcr-student-streams',
        'fcr-items-center',
        'fcr-relative',
        containerH5Extend,
        containerH5VisibleCls,
      )}
      style={{
        overflow: 'hidden',
        transition: 'height .2s',
        height: studentVideoStreamContainerHeight,
        width: '100vw',
        flexShrink: 0,
        background: 'rgba(56, 56, 67, 1)',
      }}>
      {current !== 0 && (
        <div
          className={classnames(
            'fcr-pagination-mobile-float__btn fcr-pagination-mobile-list__prev',
            {
              'fcr-pagination-mobile-float__btn__lowlight': !toolVisible,
            },
          )}
          onClick={handlePrev}>
          <SvgImg
            type={SvgIconEnum.FCR_MOBILE_LEFT}
            size={16}
            colors={{ iconPrimary: '#000000' }}
          />
        </div>
      )}
      {current + 3 < studentCameraStreams.length && (
        <div
          className={classnames(
            'fcr-pagination-mobile-float__btn fcr-pagination-mobile-list__next',
            {
              'fcr-pagination-mobile-float__btn__lowlight': !toolVisible,
            },
          )}
          onClick={handleNext}>
          <SvgImg
            type={SvgIconEnum.FCR_MOBILE_RIGHT}
            size={16}
            colors={{ iconPrimary: '#000000' }}
          />
        </div>
      )}

      <Swiper
        watchSlidesProgress
        onActiveIndexChange={(swiper: SwiperType) => {
          setCurrent(swiper.activeIndex);
        }}
        allowTouchMove={false}
        onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
        slidesPerView={3.2}
        spaceBetween={1}>
        {studentCameraStreams.map((stream) => {
          const isLocal = stream.stream.isLocal;
          const reward = rewards.get(stream.fromUser.userUuid);
          const hasBoardOption = grantedUsers.has(stream.fromUser.userUuid);
          return (
            <SwiperSlide key={stream.stream.streamUuid}>
              {({ isVisible }) => {
                if (isVisible) {
                  visibleStreams.set(stream.stream.streamUuid, stream.stream);
                } else {
                  visibleStreams.delete(stream.stream.streamUuid);
                }
                subscribeMass(visibleStreams);

                return (
                  <div onClick={toggleTool} className="fcr-relative">
                    {isLocal ? (
                      <LocalTrackPlayerContainer
                        key={stream.stream.streamUuid}
                        stream={stream}></LocalTrackPlayerContainer>
                    ) : (
                      <StreamContext.Provider value={convertStreamUIStatus(stream)}>
                        <StreamPlayer
                          visible={isVisible}
                          key={stream.stream.streamUuid}
                          style={{
                            height: studentVideoStreamSize.height,
                            position: 'relative',
                            flexShrink: 0,
                          }}
                          stream={stream}></StreamPlayer>
                      </StreamContext.Provider>
                    )}
                    <div
                      className="fcr-stream-mobile-stu-top-left"
                      style={{
                        opacity: visible ? 1 : 0,
                        visibility: visible ? 'visible' : 'hidden',
                        background: 'transparent',
                      }}>
                      {hasBoardOption && (
                        <div className="fcr-stream-mobile-stu-bgwhite width20">
                          <SvgImg
                            type={SvgIconEnum.FCR_HOST}
                            colors={{ iconPrimary: '#FFC700' }}
                            size={20}
                          />
                        </div>
                      )}
                      <div
                        className="fcr-stream-mobile-stu-bgwhite"
                        style={{ paddingRight: '4px' }}>
                        <SvgImg type={SvgIconEnum.FCR_REWARD} size={20}></SvgImg>
                        <span className="fcr-stream-mobile-stu-x">x</span>
                        <span>{reward || 0}</span>
                      </div>
                    </div>
                    <div
                      className="fcr-stream-mobile-stu-bottom-left"
                      style={{
                        opacity: visible ? 1 : 0,
                        visibility: visible ? 'visible' : 'hidden',
                      }}>
                      <AudioRecordinDeviceIcon stream={stream} size={20} />
                      <span>{stream.fromUser.userName}</span>
                    </div>
                    <Award stream={stream} />
                  </div>
                );
              }}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
});
const StudentStreamCollapse = observer(() => {
  const {
    streamUIStore: { studentCameraStreams, toggleStudentStreamsVisible, studentStreamsVisible },
    shareUIStore: { isLandscape },
  } = useStore();
  return (
    <>
      {studentCameraStreams.length > 0 && (
        <div className="fcr-stream-collapse-mobile-wrapper">
          <div className="fcr-stream-collapse-mobile">
            <SvgImgMobile
              onClick={toggleStudentStreamsVisible}
              style={{ transform: `rotateX(${studentStreamsVisible ? '0deg' : '180deg'})` }}
              type={SvgIconEnum.COLLAPSE_STREAM_MOBILE}
              size={40}
              landscape={isLandscape}
              forceLandscape={false}></SvgImgMobile>
          </div>
        </div>
      )}
    </>
  );
});
