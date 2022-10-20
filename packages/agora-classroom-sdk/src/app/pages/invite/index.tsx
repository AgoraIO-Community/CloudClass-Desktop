import { useJoinRoom } from '@/app/hooks/useJoinRoom';
import { GlobalStoreContext, UserStoreContext } from '@/app/stores';
import { ErrorCode, i18nError, messageError } from '@/app/utils';
import { ShareContent, shareLink } from '@/app/utils/share';
import { EduRoleTypeEnum, Platform } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ModalMethod } from '~ui-kit';

export const InviteRoom = observer(() => {
  const { setLoading } = useContext(GlobalStoreContext);
  const history = useHistory();
  const location = useLocation();
  const { quickJoinRoom } = useJoinRoom();
  const userStore = useContext(UserStoreContext);

  // 根据分享信息初始化`
  useEffect(() => {
    if (!userStore.userInfo) {
      return;
    }

    const data: ShareContent | null = shareLink.parseSearch(location.search);
    if (!data) {
      ModalMethod.confirm({
        content: i18nError(ErrorCode.INVALID_SHARE_LINK),
        onOk: () => {
          history.push('/');
        },
      });
      return;
    }

    setLoading(true);
    quickJoinRoom({
      role: data.role || EduRoleTypeEnum.student,
      roomId: data.roomId,
      userId: userStore.userInfo.companyId,
      nickName: userStore.nickName,
      platform: Platform.PC,
    })
      .catch((error) => {
        console.warn('invite page quickJoinRoom failed. error:%o', error);
        if (error.code) {
          messageError(error.code);
        } else {
          messageError(ErrorCode.FETCH_ROOM_INFO_FAILED);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      ModalMethod.destroyAll();
    };
  }, [quickJoinRoom]);

  return <div></div>;
});
