import { observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { CloudDriverContainer } from '@classroom/infra/capabilities/containers/cloud-driver';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { RosterContainer } from '../roster/user-list';
import { LectureRosterContainer } from '../roster/lecture-user-list';
import { Confirm } from './confirm';
import { GenericErrorDialog } from './error-generic';
import { KickOut } from './kick-out';
import { ScreenPickerDialog } from './screen-picker';
import { DialogCategory } from '@classroom/infra/stores/common/share';
import { BreakoutRoomDialog } from './breakout-room';
import { Quit } from './quit';
import { ScreenShareDialog } from './screen-share';
import { RemoteControlConfirm } from './remote-control-confirm';
import { RoomDeviceSettingContainer } from '../device-setting';
import { InviteConfirmContainer } from '../hand-up/invite-confirm';
import { InvitePodiumContainer } from '../hand-up/invite-container';
import { VideoGallery } from './video-gallery';

const getDialog = (category: DialogCategory, id: string, props?: any): ReactNode => {
  switch (category) {
    case DialogCategory.CloudDriver:
      return <CloudDriverContainer {...props} id={id} />;
    case DialogCategory.Roster:
      return <RosterContainer {...props} id={id} />;
    case DialogCategory.LectureRoster:
      return <LectureRosterContainer {...props} id={id} />;
    case DialogCategory.KickOut:
      return <KickOut {...props} id={id} />;
    case DialogCategory.ErrorGeneric:
      return <GenericErrorDialog id={id} {...props} />;
    case DialogCategory.Confirm:
      return <Confirm {...props} id={id} />;
    case DialogCategory.DeviceSetting:
      return <RoomDeviceSettingContainer {...props} id={id} />;
    case DialogCategory.ScreenPicker:
      return <ScreenPickerDialog {...props} id={id} />;
    case DialogCategory.BreakoutRoom:
      return <BreakoutRoomDialog {...props} id={id} />;
    case DialogCategory.Quit:
      return <Quit {...props} id={id} />;
    case DialogCategory.ScreenShare:
      return <ScreenShareDialog {...props} id={id} />;
    case DialogCategory.RemoteControlConfirm:
      return <RemoteControlConfirm {...props} id={id} />;
    case DialogCategory.VideoGallery:
      return <VideoGallery {...props} id={id} />;
    case DialogCategory.InvitePodium:
      return <InvitePodiumContainer {...props} id={id} />;
    case DialogCategory.InviteConfirm:
      return <InviteConfirmContainer {...props} id={id} />;
  }
};

export type BaseDialogProps = {
  id: string;
};

export const DialogContainer: React.FC<unknown> = observer(() => {
  const { shareUIStore } = useStore();
  const { dialogQueue } = shareUIStore;

  return (
    <React.Fragment>
      {dialogQueue.map(({ id, category, props }) => {
        const { showMask = true } = props as { showMask: boolean };

        return showMask ? (
          <div className="rc-mask" key={id}>
            <div className="fixed-container">{getDialog(category, id, props)}</div>
          </div>
        ) : (
          <React.Fragment key={id}>{getDialog(category, id, props)}</React.Fragment>
        );
      })}
    </React.Fragment>
  );
});
