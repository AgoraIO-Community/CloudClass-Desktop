import { RoomInfo, RoomState } from '@/app/api/room';
import { EduRoomTypeEnum } from 'agora-edu-core';
import dayjs from 'dayjs';
import { FC, useCallback, useMemo } from 'react';
import { SvgIconEnum, SvgImg, useI18n } from '~ui-kit';
import './item.css';
import roomStateLive from '@/app/assets/fcr-room-state-live.svg';
import { formatRoomID } from '@/app/hooks';
import classNames from 'classnames';

type RoomListItemProps = {
  className?: string;
  data: RoomInfo;
  onShare?: (data: RoomInfo) => void;
  onJoin?: (data: RoomInfo) => void;
  onDetail?: (data: RoomInfo) => void;
};

const Format = 'YYYY-MM-DD,HH:mm';

const roomStateClassNames = {
  [RoomState.ENDED]: 'over',
  [RoomState.GOING]: 'live',
  [RoomState.NO_STARTED]: 'upcoming',
};

const roomStateMap = {
  [RoomState.ENDED]: 'fcr_home_status_over',
  [RoomState.GOING]: 'fcr_home_status_live',
  [RoomState.NO_STARTED]: 'fcr_home_status_upcoming',
};

const roomTypeMap = {
  [EduRoomTypeEnum.Room1v1Class]: 'fcr_home_label_1on1',
  [EduRoomTypeEnum.RoomSmallClass]: 'fcr_home_label_small_classroom',
  [EduRoomTypeEnum.RoomBigClass]: 'fcr_home_label_lecture_hall',
};

export const RoomListItem: FC<RoomListItemProps> = ({
  className = '',
  data,
  onShare,
  onDetail,
  onJoin,
}) => {
  const transI18n = useI18n();
  const dateStr = useMemo(() => {
    return `${dayjs(data.startTime).format(Format)}-${dayjs(data.endTime).format('HH:mm')}`;
  }, [data]);

  const roomState = useMemo(() => {
    return data.roomState;
  }, [data]);

  const roomId = useMemo(() => {
    const result = formatRoomID(data.roomId);
    return result;
  }, [data.roomId]);

  const shareHandle = useCallback(() => {
    onShare && onShare(data);
  }, [onShare, data]);

  const detailHandle = useCallback(() => {
    onDetail && onDetail(data);
  }, [onShare, data]);

  const joinHandle = useCallback(() => {
    onJoin && onJoin(data);
  }, [onShare, data]);

  return (
    <div className={`room-item-card ${roomStateClassNames[roomState]} ${className}`}>
      <div className="info">
        <div className="header">
          <span className="date">{dateStr}</span>
          <span className="id">{roomId}</span>
        </div>
        <div
          className={classNames({
            name: 1,
            'w-full': roomState === RoomState.ENDED,
            'w-2/3': roomState !== RoomState.ENDED,
          })}>
          {data.roomName}
        </div>
        <div className="footer">
          <span className="state">
            <img
              src={roomStateLive}
              alt="room-state-live"
              className={classNames({
                'live-icon': 1,
                hidden: roomState !== RoomState.GOING,
              })}
            />
            {transI18n(roomStateMap[roomState])}
          </span>
          <span className="type">
            <SvgImg
              className="label"
              type={SvgIconEnum.ROOM_LABEL}
              colors={{ color: roomState !== RoomState.GOING ? '#78787c' : '#abb2ff' }}
              size={19}
            />
            {transI18n(roomTypeMap[data.roomType])}
          </span>
        </div>
      </div>
      <div className="operation">
        {
          roomState !== RoomState.ENDED ? (
            <div className="btn enter">
              <span className="text" onClick={joinHandle}>
                {transI18n('fcr_home_button_enter')}
              </span>
              <span className="share" onClick={shareHandle} />
            </div>
          ) : null
          // <div className="btn replay" onClick={detailHandle}>
          //   <SvgImg type={SvgIconEnum.REPLAY} size={20} colors={{ iconPrimary: '#fff' }} />
          //   <span className="text">{transI18n('fcr_home_button_replay')}</span>
          // </div>
        }
      </div>
    </div>
  );
};
