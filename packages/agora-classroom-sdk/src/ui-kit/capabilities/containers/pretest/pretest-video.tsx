import { Field } from '@/app/components/form-field';
import { useStore } from '@/infra/hooks/ui-store';
import { BeautyType } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useRef, useEffect, useCallback } from 'react';

import tw, { styled, css } from 'twin.macro';
import { CameraPlaceHolder, SvgIconEnum, SvgImg, Tooltip, transI18n } from '~ui-kit';
import { ASlider } from '~ui-kit/components/slider';
import underline from './assets/underline.png';
import './pretest-video.css';

const DEFAULT_IMAGE_EFFECTS = require.context('./assets/effect/', false, /^.*\.jpg/);
const DEFAULT_VIDEO_EFFECTS = require.context('./assets/effect/', false, /^.*\.mp4/);
export const PretestVideo = () => {
  return (
    <VideoContainer>
      <VideoPreviewTest />
      <VideoOperatorTab />
    </VideoContainer>
  );
};

export const TrackPlayer = observer(() => {
  const {
    pretestUIStore: { setupLocalVideo, isMirror },
  } = useStore();

  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      setupLocalVideo(ref.current, isMirror);
    }
  }, [ref, isMirror]);
  return (
    <div
      style={{ width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}
      ref={ref}></div>
  );
});

export const PretestVideoPlayerLocalCameraPlaceholder = observer(() => {
  const {
    pretestUIStore: { localCameraPlaceholder },
  } = useStore();
  return (
    <CameraPlaceHolder
      style={{ position: 'absolute', top: 0, borderRadius: '14px' }}
      state={localCameraPlaceholder}
    />
  );
});

const VideoPreviewTest = observer(() => {
  return (
    <VideoPanel>
      <PretestVideoPlayerLocalCameraPlaceholder />
      <VideoPlayerOperator />
    </VideoPanel>
  );
});

const VideoPlayerOperator = observer(() => {
  const {
    pretestUIStore: { localCameraOff },
  } = useStore();
  return (
    <>
      <VideoDeviceList />
      {!localCameraOff ? (
        <>
          <TrackPlayer />
          <VideoSidler />
        </>
      ) : null}
    </>
  );
});

const VideoSidler = observer(() => {
  const {
    pretestUIStore: {
      activeBeautyValue,
      activeBeautyType,
      currentEffectType,
      setActiveBeautyValue,
      resetBeautyValue,
    },
  } = useStore();
  return activeBeautyType !== 'none' && currentEffectType === 'beauty' ? (
    <VideoSliderPanel>
      <Slider
        min={0}
        max={100}
        value={activeBeautyValue}
        step={1}
        onChange={setActiveBeautyValue}
        vertical={true}
      />
      <RefreshButton onClick={resetBeautyValue}>
        <SvgImg type={SvgIconEnum.CLOUD_REFRESH} colors={{ iconPrimary: '#fff' }} size={14} />
      </RefreshButton>
    </VideoSliderPanel>
  ) : null;
});

const VideoDeviceList = observer(() => {
  const {
    pretestUIStore: { setCameraDevice, currentCameraDeviceId, cameraDevicesList },
  } = useStore();

  return (
    <VideoDeviceListPanel>
      <Field
        label=""
        type="select"
        value={currentCameraDeviceId}
        options={cameraDevicesList.map((value) => ({
          text: value.label,
          value: value.value,
        }))}
        onChange={(value) => {
          setCameraDevice(value);
        }}
      />
    </VideoDeviceListPanel>
  );
});

const VideoOperatorTab = observer(() => {
  const {
    pretestUIStore: {
      currentEffectType,
      setCurrentEffectOption,
      cameraVirtualBackgroundProcessor,
      cameraBeautyProcessor,
      initVideoEffect,
      underlineLeft,
      setUnderlineLeft,
    },
  } = useStore();

  const handleTabClick = useCallback((event, type: 'virtualBackground' | 'beauty') => {
    setCurrentEffectOption(type);
    setUnderlineLeft(event.currentTarget.offsetLeft);
  }, []);

  useEffect(() => {
    if (!cameraVirtualBackgroundProcessor && !cameraBeautyProcessor) {
      initVideoEffect();
    }
  }, []);

  return (
    <>
      <TabHeader>
        <TabTitle
          activity={currentEffectType === 'virtualBackground'}
          onClick={(e) => handleTabClick(e, 'virtualBackground')}>
          {transI18n('media.virtualBackground')}
        </TabTitle>
        <TabTitle
          activity={currentEffectType === 'beauty'}
          onClick={(e) => handleTabClick(e, 'beauty')}>
          {transI18n('media.beauty')}
        </TabTitle>
        <ForceBar translateLeft={underlineLeft}></ForceBar>
      </TabHeader>
      <TabContent>
        {currentEffectType === 'virtualBackground' && <Background />}
        {currentEffectType === 'beauty' && <Beauty />}
      </TabContent>
    </>
  );
});

const Background = observer(() => {
  const {
    pretestUIStore: { currentVirtualBackground, handleBackgroundChange },
  } = useStore();

  // const fileRef = useRef<HTMLInputElement | null>(null);

  // const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
  //   try {
  //     const files = evt.target.files || [];
  //     if (files?.length) {
  //       setShowUploadModal(true);
  //       setUploadState('uploading');
  //       const taskArr = [];
  //       uploadingRef.current = true;
  //       for (const file of files) {
  //         taskArr.push(
  //           uploadPersonalResource(file).finally(() => {
  //             debouncedFetchPersonalResources();
  //           }),
  //         );
  //       }
  //     }
  //   } catch (e) {
  //     setShowUploadModal(false);
  //     setUploadState('error');
  //     throw e;
  //   } finally {
  //     fileRef.current!.value = '';
  //   }
  // };

  return (
    <BackgroundContainer>
      <Tooltip
        title={transI18n('pretest.none')}
        placement="top"
        mouseEnterDelay={3}
        overlayClassName="pretestTooltip">
        <BackgroundItem
          activity={currentVirtualBackground === 'none'}
          onClick={() => handleBackgroundChange('none')}>
          <SvgImg
            type={SvgIconEnum.NONE}
            colors={{ iconPrimary: currentVirtualBackground === 'none' ? '#0056FD' : '#000' }}
            size={40}
          />
        </BackgroundItem>
      </Tooltip>
      <Tooltip
        title={transI18n('pretest.add')}
        placement="top"
        mouseEnterDelay={3}
        overlayClassName="pretestTooltip">
        <BackgroundItem>
          {/* <input
                ref={fileRef}
                id="upload-image"
                accept={imageTypes.map((item) => '.' + item).join(',')}
                onChange={handleUpload}
                multiple
                type="file"></input> */}
          <SvgImg type={SvgIconEnum.ADD} colors={{ iconPrimary: '#000' }} size={40} />
        </BackgroundItem>
      </Tooltip>
      {DEFAULT_IMAGE_EFFECTS.keys().map((item) => (
        <BackgroundItem
          activity={currentVirtualBackground === item}
          key={item}
          image={DEFAULT_IMAGE_EFFECTS(item)}
          onClick={() =>
            handleBackgroundChange(item, { type: 'img', url: DEFAULT_IMAGE_EFFECTS(item) })
          }>
          {currentVirtualBackground === item && (
            <SvgImg
              className="svg-mark"
              type={SvgIconEnum.MARK}
              colors={{ iconPrimary: '#0056FD' }}
            />
          )}
        </BackgroundItem>
      ))}
      {DEFAULT_VIDEO_EFFECTS.keys().map((item) => {
        return (
          <BackgroundItem
            key={item}
            activity={currentVirtualBackground === item}
            onClick={() =>
              handleBackgroundChange(item, { type: 'video', url: DEFAULT_VIDEO_EFFECTS(item) })
            }>
            <video autoPlay loop muted>
              <source src={DEFAULT_VIDEO_EFFECTS(item)} type="video/mp4" />
            </video>
            {currentVirtualBackground === item && (
              <SvgImg
                className="svg-mark"
                type={SvgIconEnum.MARK}
                colors={{ iconPrimary: '#0056FD' }}
              />
            )}
          </BackgroundItem>
        );
      })}
    </BackgroundContainer>
  );
});

const Beauty = observer(() => {
  const {
    pretestUIStore: {
      activeBeautyType,
      setActiveBeautyType,
      whiteningValue,
      ruddyValue,
      buffingValue,
    },
  } = useStore();

  return (
    <BeautyContainer>
      {[
        { id: 'none', icon: SvgIconEnum.NONE },
        { id: 'whitening', icon: SvgIconEnum.WHITENING, value: whiteningValue },
        { id: 'buffing', icon: SvgIconEnum.BUFFING, value: buffingValue },
        { id: 'ruddy', icon: SvgIconEnum.RUDDY, value: ruddyValue },
      ].map((item) => {
        return (
          <BeautyItem
            key={item.id}
            activity={activeBeautyType === item.id}
            onClick={() => {
              setActiveBeautyType(item.id as BeautyType | 'none');
            }}>
            <BeautyIcon icon={item.id} activity={!!item.value}>
              <SvgImg
                type={item.icon}
                colors={{
                  iconPrimary:
                    item.id === 'none'
                      ? activeBeautyType === item.id
                        ? '#0056FD'
                        : '#000'
                      : '#fff',
                }}
                size={40}
              />
            </BeautyIcon>
            <BeautyName activity={!!item.value}>{transI18n(`media.${item.id}`)}</BeautyName>
          </BeautyItem>
        );
      })}
    </BeautyContainer>
  );
});

const VideoContainer = styled.div`
  padding-top: 40px;
  padding-left: 21px;
  padding-right: 21px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const VideoPanel = styled.div`
  position: relative;
  height: 254px;
  border-radius: 14px;
`;

const VideoSliderPanel = styled.div`
  position: absolute;
  padding: 18px 0;
  top: 0px;
  right: 24px;
  height: 100%;
  gap: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Slider = styled(ASlider)`
  flex: 1;
  & .ant-slider-vertical {
    width: 16px;
  }
  &.slider .ant-slider-track,
  &.slider .ant-slider-step,
  &.slider .ant-slider-rail {
    width: 10px;
    border-radius: 8px;
  }
  &.slider .ant-slider-handle {
    width: 16px;
    height: 16px;
    border: none;
    box-shadow: 0 0 0px 5px rgb(255 255 255 / 79%);
  }
  & .ant-slider-vertical .ant-slider-handle {
    margin-left: -3px;
  }
`;
const RefreshButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  flex-grow: 0;
  border-radius: 1000px;
  background: rgba(52, 52, 52, 0.9);
  cursor: pointer;
`;

const VideoDeviceListPanel = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 240px;
  height: 48px;
  border-radius: 12px;
  z-index: 9;
  & .form-field .select {
    background: rgba(61, 64, 75, 0.8);
    color: #fff;
    border-color: transparent;
  }
  & .form-field .select a:link,
  .form-field .select a:hover,
  .form-field .select a:active,
  .form-field .select a:visited,
  & .form-field .option {
    color: #fff;
  }
  & .form-field .option:hover {
    background: transparent;
    color: #fff;
    font-weight: 800;
  }
`;

const TabHeader = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  border-bottom: 1px solid rgba(220, 234, 254, 1);
  ${tw`border-divider`};
`;
const TabTitle = styled.div<{ activity: boolean }>`
  width: 92px;
  text-align: center;
  margin-right: 36px;
  font-weight: ${(props) => (props.activity ? 800 : 400)};
  font-size: 14px;
  padding: 2px;
  ${tw`text-level2`}
  cursor: pointer;
`;

const ForceBar = styled.span<{ translateLeft: number }>`
  display: block;
  position: absolute;
  top: 13px;
  left: 21px;
  width: 76px;
  height: 17px;
  transform: translate3d(0, 0, 0);
  background: url(${underline}) no-repeat center/contain;
  transition: 0.3s all ease;
  transform: ${(props) => `translate3d(${props.translateLeft}px, 0, 0)`};
`;
const TabContent = styled.div`
  padding-top: 15px;
  padding-left: 2px;
  padding-right: 2px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const BeautyContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 7px;
`;

const BeautyItem = styled.div<{ activity: boolean }>`
  width: 82px;
  height: 82px;
  position: relative;
  ${tw`bg-background`}
  border-radius: 8px;
  padding: 6px 6px 0 6px;
  box-sizing: border-box;
  cursor: pointer;
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    display: block;
    width: 88px;
    height: 88px;
    border: 2px solid transparent;
    border-radius: 6px;
    border-color: ${(props) => (props.activity ? '#0056fd' : 'transparent')};
  }
`;

const BeautyIcon = styled.div<{
  icon: string;
  activity: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 56px;
  border-radius: 6px;
  background: ${(props) => {
    if (props.icon === 'none') return 'transparent';
    return props.activity ? '#E5EEFF' : '#fff';
  }};
`;

const BeautyName = styled.span<{ activity: boolean }>`
  margin: 0 auto;
  color: ${(props) => (props.activity ? '#0056fd' : '#757575')};
  font-size: 12px;
  display: block;
  margin-top: 1px;
  text-align: center;
`;

const BackgroundContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 10px;
`;

const BackgroundItem = styled.div<{ image?: string; activity?: boolean }>`
  width: 82px;
  height: 60px;
  border-radius: 8px;
  ${tw`bg-background`}
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${(props) =>
    props.image &&
    css`
      background-image: url(${props.image});
      background-size: cover;
    `}

  &:before {
    content: '';
    display: block;
    left: -3px;
    top: -3px;
    position: absolute;
    width: 88px;
    height: 66px;
    border-radius: 12px;
    ${(props) =>
      props.activity &&
      css`
        border: 2px solid #0056fd;
      `}
  }
  & .svg-mark {
    position: absolute;
    left: 33%;
    top: 33%;
  }
`;
