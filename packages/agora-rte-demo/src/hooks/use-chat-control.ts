import {useEffect, useRef, useMemo} from 'react';

export default function useChatControl () {

  const lock = useRef<boolean>(false);

  useEffect(() => {
    lock.current = false;
    return () => {
      lock.current = true;
    }
  }, []);

  const me: any = {}
  const course: any = {}
  // const me = roomStore.state.me;
  // const course = roomStore.state.course;

  const muteControl = me.role === 1;

  const muteChat = Boolean(course.muteChat);

  const chat =  Boolean(me.chat);

  const disableChat: boolean = useMemo(() => {
    if (+me.role === 2 && (muteChat || !chat)) return true;
    return false;
  }, [muteChat, chat, me.role]);

  return {
    chat,
    disableChat,
    muteControl,
    muteChat,
    handleMute (type: string) {
      if (!lock.current) {
        lock.current = true;
        // roomStore.updateCourse({
        //   muteChat: type === 'mute' ? 1 : 0
        // }).then(() => {
        //   BizLogger.info("update success");
        // }).catch(BizLogger.warn)
        // .finally(() => {
        //   lock.current = false;
        // })
      }

    }
  }
}