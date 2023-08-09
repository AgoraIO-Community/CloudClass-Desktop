import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { OverlayWrap, SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useDraggableDefaultCenterPosition } from '@classroom/ui-kit/utilities/hooks';
import { InviteTable } from './invite-table';
import './invite-container.css';
import { useI18n } from 'agora-common-libs';
interface InvitePodiumContainerProps {
  onClose: () => void;
}
const bounds = '.classroom-track-bounds';
const modalSize = { width: 606, height: 402 };

export const InvitePodiumContainer: React.FC<InvitePodiumContainerProps> = ({ onClose }) => {
  const defaultRect = useDraggableDefaultCenterPosition({
    draggableWidth: modalSize.width,
    draggableHeight: modalSize.height,
    bounds,
  });
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);
  const transI18n = useI18n();

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        dragHandleClassName="inviteTitle"
        bounds={bounds}
        enableResizing={false}
        default={defaultRect}>
        <div className="inviteContainer">
          <div className="inviteTitle">
            {transI18n('invite.title')}
            <div className="btn-pin">
              <SvgImg
                type={SvgIconEnum.CLOSE}
                className="fcr-cursor-pointer"
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
