import { useStore } from '@classroom/hooks/ui-store';
import { SvgImgMobile, SvgIconEnum } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect } from 'react';

export const AutoPlayFailedTip = observer(() => {
  const {
    shareUIStore: { isLandscape, forceLandscape },
    streamUIStore: { showAutoPlayFailedTip, closeAutoPlayFailedTip, teacherCameraStream },
    boardUIStore: { mounted },
  } = useStore();
  const transI18n = useI18n();
  useEffect(() => {
    if (showAutoPlayFailedTip) {
      window.addEventListener('touchstart', closeAutoPlayFailedTip, { once: true });
    }
    return () => window.removeEventListener('touchstart', closeAutoPlayFailedTip);
  }, [showAutoPlayFailedTip]);
  return showAutoPlayFailedTip ? (
    <div
      className={classnames(
        'fcr-mobile-auto-play-failed fcr-t-0 fcr-l-0 fcr-w-full fcr-h-full fcr-flex fcr-justify-center',
        { 'fcr-mobile-auto-play-failed-landscape': isLandscape },
        {
          'fcr-mobile-auto-play-failed-no-board':
            (!mounted || !teacherCameraStream) && !isLandscape,
        },
      )}>
      <div>
        <SvgImgMobile
          landscape={isLandscape}
          forceLandscape={forceLandscape}
          type={SvgIconEnum.AUTO_PLAY_FAILED}
          size={130}></SvgImgMobile>
        <div className="fcr-mobile-auto-play-failed-btn">{transI18n('fcr_H5_click_to_play')}</div>
      </div>
    </div>
  ) : null;
});
