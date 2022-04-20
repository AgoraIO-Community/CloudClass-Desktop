import { FC, useContext, useMemo, cloneElement, useState, createContext, useEffect } from 'react';
import { Popover } from '~ui-kit';

export const PanelStateContext = createContext<{
  visiblePanelId: number | string;
  onTrigger: (panelId: number | string) => void;
  getNextPanelId: () => number | string;
  closeAll: () => void;
}>({
  visiblePanelId: 0,
  onTrigger: () => {},
  getNextPanelId: () => 0,
  closeAll: () => {},
});

export const usePanelState = () => {
  const [visiblePanelId, setVisiblePanelId] = useState<string | number>(0);

  const panelState = useMemo(() => {
    let nextId = 0;
    return {
      visiblePanelId,
      onTrigger: (panelId: number | string) => {
        setVisiblePanelId((prevPanelId) => {
          if (prevPanelId === panelId) {
            return 0;
          }
          return panelId;
        });
      },
      getNextPanelId: () => {
        return Date.now() + nextId++;
      },
      closeAll: () => {
        setVisiblePanelId(0);
      },
    };
  }, [visiblePanelId]);

  return panelState;
};

type PanelProps = {
  trigger: React.ReactElement;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  panelId?: string;
  children?: React.ReactNode;
};

export const Panel: FC<PanelProps> = ({
  children,
  trigger,
  className,
  onOpen,
  onClose,
  panelId: pid,
}) => {
  const { visiblePanelId, onTrigger, getNextPanelId } = useContext(PanelStateContext);

  const panelId = useMemo(() => pid || getNextPanelId(), [pid]);

  const visible = visiblePanelId === panelId;

  const childBtn = cloneElement(trigger, {
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      onTrigger(panelId);
    },
  });

  useEffect(() => {
    if (visible) {
      onOpen && onOpen();
    } else {
      onClose && onClose();
    }
  }, [visible]);

  return (
    <Popover overlayClassName={className} visible={visible} placement="rightTop" content={children}>
      {childBtn}
    </Popover>
  );
};
