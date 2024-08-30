import { useEffect, useState } from 'react';
import { SvgIconEnum, Button } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { Drawer } from 'antd';
import { GuideToolTip } from '../../tooltip/guide';
import { BoardExpand } from '../../board-expand';

import 'antd/es/drawer/style/index.css';
import './index.css';

export const FixedBoardTips = () => {
  const transI18n = useI18n();
  const [warning, setWarn] = useState<boolean>(true);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setWarn(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toogleBoardTipsPopup = (e: { stopPropagation: () => void; }) => {
    e?.stopPropagation();
    setDrawerVisible((pre) => !pre);
  };

  return (
    <>
      <div className="fct-mobile-board-btn">
        <GuideToolTip
          placement="right"
          overlayOffset={8}
          visible={warning}
          overlayInnerStyle={{
            background: '#FFD952',
            border: '1px solid #FFD952',
            fontSize: '13px',
            color: '#000',
          }}
          content={transI18n('fcr_board_edit')}>
          <BoardExpand iconEnum={SvgIconEnum.WHITEBOARDEDIT} onClick={toogleBoardTipsPopup} />
        </GuideToolTip>
      </div>

      <Drawer
        placement="bottom"
        open={drawerVisible}
        mask={false}
        closable={false}
        maskClosable
        contentWrapperStyle={{
          height: 'auto',
          boxShadow: 'none',
        }}
        onClose={toogleBoardTipsPopup}
        className="fct-mobile-board-drawer"
        key="board-confirm-bottom">
        <div className="whiteboard-popup-container">
          <div className="whiteboard-popup-header fcr-flex">
            <BoardExpand
              iconEnum={SvgIconEnum.WHITEBOARDEDIT}
              size={48}
              style={{ width: '48px', height: '48px',backgroundColor:'#AE367E' }}
            />
            <div className="fcr-flex fcr-flex1 column pl-19">
              <div className="whiteboard-title">{transI18n('fcr_board_edit')}</div>
              <div className="whiteboard-instructions">{transI18n('fcr_board_rotate_tip')}</div>
            </div>
          </div>
          <div className="whiteboard-tips-container fcr-flex">
            <div>
              <BoardExpand
                iconEnum={SvgIconEnum.MOBILEROTATESCAPE}
                iconColor="#FB584E"
                size={48}
                style={{
                  background: '#E6E6E6',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                }}
              />
              <span>{transI18n('fcr_board_rotate_lock')}</span>
            </div>
            <div className='frc-arrow-enable-color'>
              <BoardExpand
                iconEnum={SvgIconEnum.RIGHTPOINT}
                iconColor="#F5F5F5"
                size={47}
                style={{ background: 'none' }}
              />
              <span style={{ transform: 'translateY(-20px)' }}>
                {transI18n('fcr_board_enable')}
              </span>
            </div>
            <div>
              <BoardExpand
                iconEnum={SvgIconEnum.MOBILEROTATESCAPE}
                iconColor="#151515"
                size={48}
                style={{
                  background: '#FFFFFF',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  transform: 'rotate(-45deg)',
                }}
              />

              <span>{transI18n('fcr_board_rotate_auto')}</span>
            </div>
          </div>
          <Button
            onClick={toogleBoardTipsPopup}
            type="primary"
            size="lg"
            style={{ width: '100%', fontSize: '15px', fontWeight: 700 }}>
            Got It
          </Button>
        </div>
      </Drawer>
    </>
  );
};
