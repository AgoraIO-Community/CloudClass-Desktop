import { useStore } from '@/infra/hooks/ui-store';
import { iterateMap } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { RemoteControlActionBar } from '~ui-kit';
import './index.css';
export const RemoteControlToolbar = observer(() => {
  const {
    classroomStore: {
      remoteControlStore: { currentStudent, quitControlRequest },
      userStore: { studentList },
    },
    remoteControlUIStore: { remoteControlToolBarActive, sendControlRequst },
  } = useStore();
  const { list } = iterateMap(studentList, {
    onMap: (_key, item) => {
      return item;
    },
  });

  return remoteControlToolBarActive && currentStudent ? (
    <div className="remote-control-tool-bar">
      <RemoteControlActionBar
        value={currentStudent.userUuid}
        studentList={list}
        onChange={sendControlRequst}
        onClose={quitControlRequest}></RemoteControlActionBar>
    </div>
  ) : null;
});
