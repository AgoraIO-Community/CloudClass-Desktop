import { formatRoomID } from '@/app/hooks';
import { useElementWithI18n } from '@/app/hooks/useComWithI18n';
import { GlobalStoreContext } from '@/app/stores';
import { shareLink } from '@/app/utils/share';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { FC, useContext, useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AButton, aMessage, useI18n } from '~ui-kit';
import './index.css';

export type ShareInfo = {
  owner: string;
  startTime: number;
  endTime: number;
  roomId: string;
  roomName: string;
};

export type ShareProps = {
  data: ShareInfo;
};

export const Share: FC<ShareProps> = observer(({ data }) => {
  const { owner, startTime, endTime, roomId, roomName } = data;
  const transI18n = useI18n();
  const globalStore = useContext(GlobalStoreContext);
  const link = useMemo(() => {
    const url = shareLink.generateUrl({ roomId, owner, region: globalStore.region });
    return url;
  }, [owner, roomId, globalStore.region]);

  const roomInfoCopy = useElementWithI18n({
    en: `${owner} invites you to a classroomRoom
Room Name：${roomName}
Time：${dayjs(startTime).format('YYYY/MM/DD HH:mm')}-${dayjs(endTime).format(
      'HH:mm',
    )} (GMT+08:00) China Standard Time - Beijing

Click the link to join the room or to add it to your room list：${link}

Or copy the room ID to join the room：${formatRoomID(roomId)}`,
    zh: `${owner} 邀请你加入课堂
课堂名称：${roomName}
课堂时间：${dayjs(startTime).format('YYYY/MM/DD HH:mm')}-${dayjs(endTime).format(
      'HH:mm',
    )} (GMT+08:00) 中国标准时间 - 北京

点击链接加入课堂：${link}

或复制课堂ID加入课堂：${formatRoomID(roomId)}`,
  });

  const roomLinkCopy = useElementWithI18n({
    en: `Link：${link}
Room ID：${formatRoomID(roomId)}`,
    zh: `链接：${link}
房间ID：${formatRoomID(roomId)}`,
  });

  return (
    <div className="share-container">
      <header>
        <span>{transI18n('fcr_share_label_room_id')}</span>
        <span>{formatRoomID(roomId)}</span>
      </header>
      <section className="body">
        <div className="text">{roomInfoCopy}</div>
      </section>
      <footer>
        {/**@ts-ignore**/}
        <CopyToClipboard
          text={roomInfoCopy}
          onCopy={(_, result) => {
            if (result) {
              aMessage.success(transI18n('fcr_share_tips_copy_all_success'));
              return;
            }
            aMessage.error(transI18n('fcr_share_tips_copy_all_fault'));
          }}>
          <AButton className="btn btn-copy-all">{transI18n('fcr_share_button_')}</AButton>
        </CopyToClipboard>
        {/**@ts-ignore**/}
        <CopyToClipboard
          text={roomLinkCopy}
          onCopy={(_, result) => {
            if (result) {
              aMessage.success(transI18n('fcr_share_tips_copy_id_success'));
              return;
            }
            aMessage.error(transI18n('fcr_share_tips_copy_id_fault'));
          }}>
          <AButton className="btn btn-copy-link">{transI18n('fcr_create_button_')}</AButton>
        </CopyToClipboard>
      </footer>
    </div>
  );
});
