import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { OverlayWrap, SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import { useDraggableDefaultCenterPosition } from '~ui-kit/utilities/hooks';
import { StreamPlayer } from '../stream';

interface IstudentViewProps {
  id: string;
}

export const StudentStream: FC<IstudentViewProps> = observer(({ id }) => {
  const {
    rosterUIStore: { getStudentStream, closeStudentView },
    shareUIStore: { removeDialog },
  } = useStore();
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);

  const onClose = useCallback(() => {
    removeDialog(id);
    closeStudentView();
  }, [id]);

  const defaultPos = useDraggableDefaultCenterPosition(
    {
      draggableWidth: 400,
      draggableHeight: 225,
    },
    {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    },
  );

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd dragHandleClassName="main-title" enableResizing={false} default={defaultPos}>
        <div className="supervise-container">
          <div className="btn-pin">
            <SvgImg
              type={SvgIconEnum.CLOSE}
              className="cursor-pointer"
              onClick={() => {
                setOpened(false);
              }}
            />
          </div>
          <div className="main-title">{transI18n('roster.supervise_student')}</div>
          {getStudentStream(id) ? (
            <div className="supervise-student" style={{ width: '400px', height: '225px' }}>
              <StreamPlayer
                renderAt="Bar"
                stream={getStudentStream(id)}
              />
            </div>
          ) : (
            <div style={{ width: '400px', height: '225px' }}>supervise...</div>
          )}
        </div>
      </Rnd>
    </OverlayWrap>
  );
});
