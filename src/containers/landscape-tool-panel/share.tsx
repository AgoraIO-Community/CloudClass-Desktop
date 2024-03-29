import { useStore } from '@classroom/hooks/ui-store';
import { SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { ComponentLevelRules } from '../../configs/config';
import ClipboardJS from 'clipboard';

import './index.css';
import { useEffect, useRef } from 'react';
import { AgoraEduSDK } from '@classroom/index';
export const ShareActionSheet = observer(() => {
  const ref = useRef<HTMLDivElement | null>(null);
  const transI18n = useI18n();

  const {
    layoutUIStore: { shareActionSheetVisible, setShareActionSheetVisible, landscapeToolBarVisible },
    shareUIStore: { addSingletonToast, isLandscape, forceLandscape },
  } = useStore();

  useEffect(() => {
    if (!ref.current) return;
    const clipboard = new ClipboardJS(ref.current);
    clipboard.on('success', () => {
      addSingletonToast(transI18n('fcr_copy_success'), 'normal');
      setShareActionSheetVisible(false);
    });
    () => clipboard.destroy;
  }, []);
  return (
    <>
      <div
        className="hands-up-action-sheet-mobile-prepare-options-item"
        style={{
          zIndex: ComponentLevelRules.Level2,
          visibility: 'visible',
        }}
        onClick={() => setShareActionSheetVisible(true)}>
        <SvgImgMobile
          landscape={isLandscape}
          forceLandscape={forceLandscape}
          type={SvgIconEnum.SHARE_MOBILE}
          size={32}></SvgImgMobile>
      </div>

      <div
        className="fcr-share-action-sheet-mobile-mask"
        style={{
          display: shareActionSheetVisible ? 'block' : 'none',
          zIndex: ComponentLevelRules.Level3,
        }}></div>
      <div
        className="fcr-share-action-sheet-mobile"
        style={{
          transform: `translate3d(0, ${shareActionSheetVisible ? '-100%' : 0}, 0)`,
          zIndex: ComponentLevelRules.Level3,
        }}>
        <div className="fcr-share-action-sheet-mobile-actions">
          <div
            className="fcr-share-action-sheet-mobile-actions-item"
            data-clipboard-text={`${AgoraEduSDK.shareUrl}`}
            ref={ref}>
            <div className="fcr-share-action-sheet-mobile-actions-item-icon">
              <SvgImg type={SvgIconEnum.LINK} size={36} colors={{ iconPrimary: '#fff' }}></SvgImg>
            </div>
            <div className="fcr-share-action-sheet-mobile-actions-item-text">
              {transI18n('fcr_copy_share_link_copy')}
            </div>
          </div>
        </div>
        <div
          className="fcr-share-action-sheet-mobile-cancel-btn"
          onClick={() => setShareActionSheetVisible(false)}>
          {transI18n('fcr_alert_cancel')}
        </div>
      </div>
    </>
  );
});
