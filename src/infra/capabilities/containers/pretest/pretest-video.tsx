import { AgoraEduSDK } from '@classroom/infra/api';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { BeautyType } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useRef, useEffect, useCallback, useState, FC, useContext } from 'react';
import { CameraPlaceHolder, SvgIconEnum, SvgImg, Tooltip } from '@classroom/ui-kit';
import { themeContext, useI18n } from 'agora-common-libs';
import { ASlider } from '@classroom/ui-kit/components/slider';
import { Field } from './form-field';
import './index.css';

export const PretestVideo = () => {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        paddingTop: 40,
        paddingLeft: 21,
        paddingRight: 21,
      }}>
      <VideoPreviewTest />
      <VideoOperatorTab />
    </div>
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
    <div
      className="relative"
      style={{
        height: 254,
        borderRadius: 14,
        width: 450,
      }}>
      <PretestVideoPlayerLocalCameraPlaceholder />
      <VideoPlayerOperator />
    </div>
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
      setActiveBeautyType,
    },
  } = useStore();

  const handleReset = useCallback(() => {
    setActiveBeautyType('none');
  }, []);

  return activeBeautyType !== 'none' && currentEffectType === 'beauty' ? (
    <VideoSliderPanel>
      <ASlider
        className="fcr-pretest-slider flex-grow"
        min={0}
        max={100}
        value={activeBeautyValue}
        step={1}
        onChange={setActiveBeautyValue}
        vertical={true}
      />
      <RefreshButton onClick={handleReset}>
        <SvgImg type={SvgIconEnum.RESET} colors={{ iconPrimary: '#fff' }} size={20} />
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
      virtualBackgroundSupported,
      beautySupported,
    },
  } = useStore();

  const transI18n = useI18n();

  const [indicatorPos, setIndicatorPos] = useState(0);
  const { textLevel1 } = useContext(themeContext);
  const handleTabClick = useCallback((event, type: 'virtualBackground' | 'beauty') => {
    setCurrentEffectOption(type);
    setIndicatorPos(event.currentTarget.offsetLeft);
  }, []);

  return (
    <>
      <TabHeader>
        {virtualBackgroundSupported && (
          <TabTitle
            activity={currentEffectType === 'virtualBackground'}
            onClick={(e) => handleTabClick(e, 'virtualBackground')}>
            {transI18n('media.virtualBackground')}
          </TabTitle>
        )}
        {beautySupported && (
          <TabTitle
            activity={currentEffectType === 'beauty'}
            onClick={(e) => handleTabClick(e, 'beauty')}>
            {transI18n('media.beauty')}
          </TabTitle>
        )}
        <SvgImg
          type={SvgIconEnum.INDICATOR}
          colors={{ iconPrimary: textLevel1 }}
          style={{
            top: 13,
            left: 21,
            width: 76,
            height: 17,
            transition: '0.3s all ease',
            transform: `translate3d(${indicatorPos}px, 0, 0)`,
            position: 'absolute',
          }}
        />
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

  const transI18n = useI18n();
  const { iconPrimary, brand } = useContext(themeContext);
  return (
    <BackgroundContainer>
      <Tooltip
        title={transI18n('pretest.none')}
        placement="top"
        mouseEnterDelay={3}
        overlayClassName="fcr-pretest-tooltip">
        <BackgroundItem
          activity={currentVirtualBackground === 'none'}
          onClick={() => handleBackgroundChange('none')}>
          <SvgImg
            type={SvgIconEnum.NONE}
            colors={{ iconPrimary: currentVirtualBackground === 'none' ? brand : iconPrimary }}
            size={40}
          />
        </BackgroundItem>
      </Tooltip>
      {AgoraEduSDK.virtualBackgroundImages.map((item) => {
        const assetURL = item;
        return (
          <BackgroundItem
            activity={currentVirtualBackground === assetURL}
            key={assetURL}
            image={assetURL}
            onClick={() => handleBackgroundChange(assetURL, { type: 'img', url: assetURL })}>
            {currentVirtualBackground === assetURL && (
              <SvgImg
                className="svg-mark"
                type={SvgIconEnum.MARK}
                colors={{ iconPrimary: brand }}
              />
            )}
          </BackgroundItem>
        );
      })}
      {AgoraEduSDK.virtualBackgroundVideos.map((item) => {
        const assetURL = item;
        return (
          <BackgroundItem
            key={assetURL}
            activity={currentVirtualBackground === assetURL}
            onClick={() => handleBackgroundChange(assetURL, { type: 'video', url: assetURL })}>
            <video autoPlay loop muted>
              <source src={assetURL} type="video/mp4" />
            </video>
            {currentVirtualBackground === assetURL && (
              <SvgImg
                className="svg-mark"
                type={SvgIconEnum.MARK}
                colors={{ iconPrimary: brand }}
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

  const transI18n = useI18n();

  return (
    <BeautyContainer>
      {[
        { id: 'none', icon: SvgIconEnum.NONE },
        { id: 'whitening', icon: SvgIconEnum.WHITENING, value: whiteningValue },
        { id: 'buffing', icon: SvgIconEnum.BUFFING, value: buffingValue },
        { id: 'ruddy', icon: SvgIconEnum.RUDDY, value: ruddyValue },
      ].map((item) => {
        const { iconPrimary, brand } = useContext(themeContext);

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
                        ? brand
                        : iconPrimary
                      : '#fff',
                }}
                size={40}
              />
            </BeautyIcon>
            <BeautyName activity={activeBeautyType === item.id}>
              {transI18n(`media.${item.id}`)}
            </BeautyName>
          </BeautyItem>
        );
      })}
    </BeautyContainer>
  );
});

const VideoSliderPanel: FC = ({ children }) => (
  <div
    className="absolute h-full flex flex-col items-center"
    style={{
      padding: '18px 0',
      top: 0,
      right: 24,
      gap: 18,
    }}>
    {children}
  </div>
);

const RefreshButton: FC<{ onClick: () => void }> = ({ children, onClick }) => (
  <span
    onClick={onClick}
    className="flex justify-center align-items"
    style={{
      width: 28,
      height: 28,
      flexShrink: 0,
      flexGrow: 0,
      borderRadius: 1000,
      background: 'rgba(52, 52, 52, 0.9)',
      cursor: 'pointer',
      alignItems: 'center',
    }}>
    {children}
  </span>
);

const VideoDeviceListPanel: FC = ({ children }) => {
  return (
    <div
      className="fcr-pretest-camera-list absolute"
      style={{
        left: 10,
        bottom: 10,
        width: 240,
        height: 48,
        borderRadius: 12,
        zIndex: 9,
      }}>
      {' '}
      {children}
    </div>
  );
};

const TabHeader: FC = ({ children }) => (
  <div
    className="flex w-full relative"
    style={{
      borderBottom: '1px solid rgba(220, 234, 254, 1)',
      marginTop: '20px',
    }}>
    {children}
  </div>
);

const TabTitle: FC<{ activity: boolean; onClick: (e: React.MouseEvent<HTMLDivElement>) => void }> =
  ({ children, activity, onClick }) => {
    const fontWeight = activity ? 800 : 400;
    return (
      <div
        onClick={onClick}
        className="text-center cursor-pointer text-level1"
        style={{
          width: 92,
          marginRight: 36,
          fontSize: 14,
          padding: 2,
          fontWeight,
        }}>
        {' '}
        {children}
      </div>
    );
  };

const TabContent: FC = ({ children }) => {
  return (
    <div
      style={{
        padding: '15px 2px',
        flex: 1,
        alignSelf: 'flex-start',
      }}>
      {' '}
      {children}
    </div>
  );
};

const BeautyContainer: FC = ({ children }) => (
  <div style={{ gap: 7 }} className="flex">
    {children}
  </div>
);

const BeautyItem: FC<{ activity: boolean; onClick: () => void }> = ({
  children,
  activity,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-component ${
        activity ? 'fcr-pretest__beauty-item--active' : 'fcr-pretest__beauty-item'
      }`}
      style={{
        width: 82,
        height: 82,
        borderRadius: 8,
        padding: '6px 6px 0 6px',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}>
      {children}
    </div>
  );
};

const BeautyIcon: FC<{
  icon: string;
  activity: boolean;
}> = ({ children, icon, activity }) => {
  const { background: backgroundColor } = useContext(themeContext);
  let background = '';
  if (activity) {
    background = '#E5EEFF';
  } else {
    background = backgroundColor;
  }

  return (
    <div
      className="flex justify-center items-center"
      style={{
        height: 56,
        borderRadius: 6,
        background,
      }}>
      {children}
    </div>
  );
};

const BeautyName: FC<{ activity: boolean }> = ({ children, activity }) => {
  const color = activity ? '#0056fd' : '#757575';
  return (
    <span
      style={{
        margin: '0 auto',
        color,
        fontSize: 12,
        display: 'block',
        marginTop: 1,
        textAlign: 'center',
      }}>
      {children}
    </span>
  );
};

const BackgroundContainer: FC = ({ children }) => (
  <div
    className="flex"
    style={{
      flexWrap: 'wrap',
      gap: 10,
    }}>
    {children}
  </div>
);

const BackgroundItem: FC<{ image?: string; activity?: boolean; onClick: () => void }> = ({
  children,
  image,
  activity,
  onClick,
}) => {
  const styleProps = image && {
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
  };

  return (
    <div
      onClick={onClick}
      className={`${
        activity ? 'fcr-pretest-background--active' : 'fcr-pretest-background'
      } relative flex justify-center items-center cursor-pointer bg-component`}
      style={{
        width: 82,
        height: 60,
        borderRadius: 8,
        ...styleProps,
      }}>
      {children}
    </div>
  );
};
