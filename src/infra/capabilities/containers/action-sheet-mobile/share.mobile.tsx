import { useLectureH5UIStores } from '@classroom/infra/hooks/ui-store';
import { SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { EduClassroomConfig } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { ComponentLevelRulesMobile } from '../../config';
import ClipboardJS from 'clipboard';

import './index.mobile.css';
import { useEffect, useRef } from 'react';
import { AgoraEduSDK } from '@classroom/infra/api';
export const ShareActionSheetMobile = observer(() => {
  const ref = useRef<HTMLDivElement | null>(null);
  const transI18n = useI18n();

  const {
    layoutUIStore: { shareActionSheetVisible, setShareActionSheetVisible, landscapeToolBarVisible },
    shareUIStore: { addSingletonToast, isLandscape, forceLandscape },
  } = useLectureH5UIStores();

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
        className="fcr-share-action-sheet-mobile-trigger"
        style={{
          zIndex: ComponentLevelRulesMobile.Level2,
          opacity: landscapeToolBarVisible && isLandscape ? 1 : 0,
          visibility: landscapeToolBarVisible && isLandscape ? 'visible' : 'hidden',
        }}
        onClick={() => setShareActionSheetVisible(true)}>
        <SvgImgMobile
          landscape={isLandscape}
          forceLandscape={forceLandscape}
          type={SvgIconEnum.SHARE_MOBILE}
          size={24}></SvgImgMobile>
      </div>

      <div
        className="fcr-share-action-sheet-mobile-mask"
        style={{
          display: shareActionSheetVisible ? 'block' : 'none',
          zIndex: ComponentLevelRulesMobile.Level3,
        }}></div>
      <div
        className="fcr-share-action-sheet-mobile"
        style={{
          transform: `translate3d(0, ${shareActionSheetVisible ? '-100%' : 0}, 0)`,
          zIndex: ComponentLevelRulesMobile.Level3,
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
