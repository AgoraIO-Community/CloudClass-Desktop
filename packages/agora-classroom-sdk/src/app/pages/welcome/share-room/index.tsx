import { useHomeStore } from '@/app/hooks';
import { formatRoomID, ShareLink } from '@/app/utils';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { FC, useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getI18n } from 'react-i18next';
import { AButton, aMessage, useI18n } from '~ui-kit';
import './index.css';

export type ShareRoomInfo = {
  owner: string;
  startTime: number;
  endTime: number;
  roomId: string;
  roomName: string;
};

export type ShareRoomProps = {
  data: ShareRoomInfo;
};

export const ShareRoom: FC<ShareRoomProps> = observer(({ data }) => {
  const { owner, startTime, endTime, roomId, roomName } = data;
  const transI18n = useI18n();
  const homeStore = useHomeStore();
  const link = useMemo(() => {
    const url = ShareLink.instance.generateUrl({ roomId, owner, region: homeStore.region });
    return url;
  }, [owner, roomId, homeStore.region]);

  const allText = useMemo(() => {
    const i18n = getI18n();
    if (i18n.language === 'en') {
      return `${owner} invites you to a classroomRoom
Room Name：${roomName}
Time：${dayjs(startTime).format('YYYY/MM/DD HH:mm')}-${dayjs(endTime).format(
        'HH:mm',
      )} (GMT+08:00) China Standard Time - Beijing

Click the link to join the room or to add it to your room list：${link}

Or copy the room ID to join the room：${formatRoomID(roomId)}`;
    }
    return `${owner} 邀请你加入课堂
课堂名称：${roomName}
课堂时间：${dayjs(startTime).format('YYYY/MM/DD HH:mm')}-${dayjs(endTime).format(
      'HH:mm',
    )} (GMT+08:00) 中国标准时间 - 北京

点击链接加入课堂：${link}

或复制课堂ID加入课堂：${formatRoomID(roomId)}`;
  }, [data]);

  const linkText = useMemo(() => {
    const i18n = getI18n();
    if (i18n.language === 'en') {
      return `Link：${link}
Room ID：${formatRoomID(roomId)}`;
    }
    return `链接：${link}
房间ID：${formatRoomID(roomId)}`;
  }, [roomId, link]);

  return (
    <div className="share-container">
      <header>
        <span>{transI18n('fcr_share_label_room_id')}</span>
        <span>{formatRoomID(roomId)}</span>
      </header>
      <section className="body">
        <div className="text">{allText}</div>
      </section>
      <footer>
        {/**@ts-ignore**/}
        <CopyToClipboard
          text={allText}
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
          text={linkText}
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
