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
import './index.css';
import { EduStreamUI } from '@classroom/uistores/stream/struct';
export const VerticalStreamsContainer = () => {
  return (
    <>
      {/* <StreamCollapse></StreamCollapse> */}
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
    layoutUIStore: { landscapeToolBarVisible },
    shareUIStore: { landscapeInnerHeight },
    boardUIStore: { grantedUsers },
  } = useStore();
  const [current, setCurrent] = useState(0);
  const {
    studentVideoStreamSize,
    studentCameraStreams,
    containerH5VisibleCls,
    containerH5Extend,
    swapperRight,
    studentStreamsVisible,
    visibleStreams,
    subscribeMass,
    allVerticalStreams,
    toolVisible,

    toggleTool,
  } = streamUIStore;
  const viewHeight = landscapeInnerHeight;
  const visible = landscapeToolBarVisible && studentStreamsVisible;
  const swiperRef = useRef<SwiperType | null>(null);
  const sliderCount = Math.floor(viewHeight / studentVideoStreamSize.height);
  const handlePrev = () => {
    swiperRef.current?.slideTo(current - sliderCount);
    setCurrent(current - sliderCount);
  };
  const handleNext = () => {
    swiperRef.current?.slideTo(current + sliderCount);
    setCurrent(current + sliderCount);
  };
  useEffect(() => {
    swiperRef.current?.update();
  }, [studentCameraStreams]);
  return (
    <div
      className={classnames(
        'fcr-items-center',
        // 'fcr-relative',
        'streams-swiper-vert',
        containerH5Extend,
        containerH5VisibleCls,
      )}
      style={{
        overflow: 'hidden',
        transition: 'width .2s',
        height: landscapeInnerHeight,
        width: swapperRight,
        flexShrink: 0,
        background: 'rgba(56, 56, 67, 1)',
      }}>
      {visible && (
        <div
          className="pagination-buttons"
          style={{
            height: landscapeInnerHeight,
          }}>
          {current !== 0 && (
            <div
              className={classnames('vert-swiper-button-prev vertical-streams-button', {
                'fcr-pagination-mobile-float__btn__lowlight': !toolVisible,
              })}
              style={{ transform: 'rotateZ( 90deg)' }}
              onClick={handlePrev}>
              <SvgImg
                type={SvgIconEnum.FCR_MOBILE_LEFT}
                size={16}
                colors={{ iconPrimary: '#000000' }}
              />
            </div>
          )}
          {current + sliderCount < studentCameraStreams.length && (
            <div
              className={classnames('vert-swiper-button-next vertical-streams-button', {
                'fcr-pagination-mobile-float__btn__lowlight': !toolVisible,
              })}
              onClick={handleNext}
              style={{
                transform: 'rotateZ( 90deg)',
              }}>
              <SvgImg
                type={SvgIconEnum.FCR_MOBILE_RIGHT}
                size={16}
                colors={{ iconPrimary: '#000000' }}
              />
            </div>
          )}
        </div>
      )}

      <Swiper
        style={{
          height: '100%',
        }}
        watchSlidesProgress
        onActiveIndexChange={(swiper: SwiperType) => {
          setCurrent(swiper.activeIndex);
        }}
        allowTouchMove={false}
        onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
        slidesPerView={viewHeight / studentVideoStreamSize.height}
        spaceBetween={1}
        direction="vertical">
        {allVerticalStreams.map((stream) => {
          // const isLocal = stream.stream.isLocal;
          // if (!stream) return;
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
                  <div onClick={toggleTool}>
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

                    <div
                      className="fcr-stream-mobile-stu-top-left"
                      style={{
                        opacity: visible ? 1 : 0,
                        visibility: visible ? 'visible' : 'hidden',
                        background: 'transparent',
                        paddingLeft: 0,
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
const StreamCollapse = observer(() => {
  const {
    streamUIStore: { toggleStudentStreamsVisible, studentStreamsVisible, swapperRight },
    shareUIStore: { landscapeInnerHeight },
  } = useStore();
  return (
    <>
      {
        <div
          className="fcr-stream-collapse-mobile-wrapper-vert"
          style={{
            height: landscapeInnerHeight,
          }}>
          <div
            className="fcr-stream-collapse-mobile-vert"
            style={{
              right: swapperRight,
            }}>
            <SvgImgMobile
              onClick={toggleStudentStreamsVisible}
              style={{ transform: `rotateY(${studentStreamsVisible ? '0deg' : '180deg'})` }}
              type={SvgIconEnum.FCR_RIGHT2}
              size={40}
              landscape={false}
              forceLandscape={false}></SvgImgMobile>
          </div>
        </div>
      }
    </>
  );
});
