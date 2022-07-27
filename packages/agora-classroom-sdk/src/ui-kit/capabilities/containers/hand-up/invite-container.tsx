import React, { useEffect, useState, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { OverlayWrap, SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import { useDraggableDefaultCenterPosition } from '~ui-kit/utilities/hooks';
import { throttle } from 'lodash';
import { InviteTable } from './invite-table';
import './invite-container.css';
interface InvitePodiumContainerProps {
  onClose: () => void;
}
const bounds = 'classroom-track-bounds';
const modalSize = { width: 606, height: 402 };

export const InvitePodiumContainer: React.FC<InvitePodiumContainerProps> = ({ onClose }) => {
  const innerSize = useMemo(
    throttle(() => {
      if (bounds) {
        const innerEle = document.getElementsByClassName(bounds)[0];
        if (innerEle) {
          return {
            innerHeight: innerEle.clientHeight,
            innerWidth: innerEle.clientWidth,
          };
        }
      }
      return {
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      };
    }, 200),
    [window.innerHeight, window.innerWidth],
  );
  const defaultPos = useDraggableDefaultCenterPosition(
    {
      draggableWidth: modalSize.width,
      draggableHeight: modalSize.height,
    },
    innerSize,
  );
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        dragHandleClassName="inviteTitle"
        bounds={'.' + bounds}
        enableResizing={false}
        default={defaultPos}>
        <div className="inviteContainer">
          <div className="inviteTitle">
            {transI18n('invite.title')}
            <div className="btn-pin">
              <SvgImg
                type={SvgIconEnum.CLOSE}
                className="cursor-pointer"
                onClick={() => {
                  setOpened(false);
                }}
              />
            </div>
          </div>
          <InviteTable />
        </div>
      </Rnd>
    </OverlayWrap>
  );
};
