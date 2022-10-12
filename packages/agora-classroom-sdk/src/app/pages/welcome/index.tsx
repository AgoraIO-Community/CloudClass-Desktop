import { RoomInfo } from '@/app/api/room';
import CreateClassIcon from '@/app/assets/fcr_create_class.svg';
import JoinClassIcon from '@/app/assets/fcr_join_class.svg';
import roomListEmptyImg from '@/app/assets/welcome-empty-list.png';
import { useAuthCallback, useJoinRoom } from '@/app/hooks';
import { RoomListItem } from '@/app/pages/welcome/room-list';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '@/app/stores';
import { token } from '@/app/utils';
import { Platform } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useHistory } from 'react-router-dom';
import {
  ADivider,
  AList,
  AListItem,
  AModal,
  ASkeleton,
  SvgIconEnum,
  SvgImg,
  useI18n,
} from '~ui-kit';
import './index.css';
import { Menu } from './menu';
import { RoomToast } from './room-toast';
import { Share, ShareInfo } from './share';

export const Welcome = observer(() => {
  const history = useHistory();
  const transI18n = useI18n();
  const { fetching, fetchMoreRoomList, refreshRoomList, clearRooms, rooms, total } =
    useContext(RoomStoreContext);
  const userStore = useContext(UserStoreContext);
  const [shareModal, setShareModal] = useState(false);
  const { setLoading } = useContext(GlobalStoreContext);
  const { quickJoinRoom } = useJoinRoom();
  const toJoinRoomPage = useAuthCallback(() => {
    history.push('/join-room');
  });
  const toCreateRoomPage = useAuthCallback(() => {
    history.push('/create-room');
  });
  const [shareRoomInfo, setShareRoomInfo] = useState<ShareInfo>({
    owner: '',
    startTime: 0,
    endTime: 0,
    roomId: '',
    roomName: '',
  });

  const onShare = useCallback(
    (data: RoomInfo) => {
      setShareRoomInfo({
        owner: userStore.nickName,
        startTime: data.startTime,
        endTime: data.endTime,
        roomId: data.roomId,
        roomName: data.roomName,
      });
      setShareModal(true);
    },
    [userStore.nickName],
  );

  const onJoin = useCallback(
    (data: RoomInfo) => {
      setLoading(true);
      quickJoinRoom({
        roomId: data.roomId,
        role: data.role,
        nickName: userStore.nickName,
        userId: userStore.userInfo!.companyId,
        platform: Platform.PC,
      }).finally(() => {
        setLoading(false);
      });
    },
    [userStore.nickName, userStore.userInfo, quickJoinRoom],
  );

  const onDetail = useCallback((data: RoomInfo) => {}, []);

  useEffect(() => {
    if (userStore.isLogin) {
      setLoading(true);
      refreshRoomList().finally(() => {
        setLoading(false);
      });
    } else {
      if (token.accessToken) {
        setLoading(true);
        clearRooms();
        userStore.getUserInfo().finally(() => {
          setLoading(false);
        });
      }
    }
  }, [userStore.isLogin]);

  return (
    <div className="welcome-container">
      <div className="header">{userStore.isLogin ? <Menu></Menu> : null}</div>
      <div className={`content ${rooms.size ? '' : 'room-list-empty'}`} id="scrollableDiv">
        <div className="welcome-title">{transI18n('fcr_home_label_welcome_message')}</div>
        <div className="room-list-empty-img">
          <img src={roomListEmptyImg} alt="" />
        </div>
        <div className={`room-entry`}>
          <div className="btn" onClick={toJoinRoomPage}>
            <span className="icon">
              <img src={JoinClassIcon} alt="join class" />
            </span>
            <span className="text">{transI18n('fcr_home_button_join')}</span>
          </div>
          <div className="btn" onClick={toCreateRoomPage}>
            <span className="icon">
              <img src={CreateClassIcon} alt="create class" />
            </span>
            <span className="text">{transI18n('fcr_home_button_create')}</span>
          </div>
        </div>
        <div className={`room-list flex-1`}>
          <div className="title">
            <span>{transI18n('fcr_home_label_roomlist')}</span>
          </div>
          <RoomToast />
          <InfiniteScroll
            dataLength={rooms.size}
            next={fetchMoreRoomList}
            hasMore={rooms.size < total}
            loader={
              <ASkeleton
                paragraph={{
                  rows: 3,
                }}
                active
              />
            }
            endMessage={
              <ADivider plain className="no-more">
                {transI18n('fcr_home_label_room_list_no_more')}
              </ADivider>
            }
            scrollableTarget="scrollableDiv">
            <AList<RoomInfo>
              className="list"
              dataSource={Array.from(rooms.values())}
              rowKey="roomId"
              loading={fetching}
              renderItem={(item: RoomInfo) => (
                <AListItem>
                  <RoomListItem data={item} onShare={onShare} onJoin={onJoin} onDetail={onDetail} />
                </AListItem>
              )}></AList>
          </InfiniteScroll>
        </div>
      </div>
      <div className="room-list-mask" />
      <AModal
        className="share-modal-container"
        open={shareModal}
        centered
        bodyStyle={{ padding: 0 }}
        width={730}
        closeIcon={<SvgImg type={SvgIconEnum.SHARE_CLOSE} size={40} className="share-close-icon" />}
        onCancel={() => {
          setShareModal(false);
        }}
        footer={false}>
        <Share data={shareRoomInfo} />
      </AModal>
    </div>
  );
});
