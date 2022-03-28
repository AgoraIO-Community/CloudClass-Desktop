import { FC, useContext, useMemo, cloneElement, useState, createContext, useEffect } from 'react';
import { Popover } from '~ui-kit';

export const PanelStateContext = createContext<{
  visiblePanelId: number;
  state: unknown;
  onTrigger: (panelId: number) => void;
  getNextPanelId: () => number;
  setState: (state: unknown) => void;
  closeAll: () => void;
}>({
  visiblePanelId: 0,
  state: {},
  onTrigger: () => {},
  getNextPanelId: () => 0,
  setState: () => {},
  closeAll: () => {},
});

export const usePanelState = () => {
  const [visiblePanelId, setVisiblePanelId] = useState(0);
  const [state, setState] = useState<unknown>({});

  const panelState = useMemo(() => {
    let nextId = 0;
    return {
      visiblePanelId,
      state,
      onTrigger: (panelId: number) => {
        setVisiblePanelId((prevPanelId: number) => {
          if (prevPanelId === panelId) {
            return 0;
          }
          return panelId;
        });
      },
      getNextPanelId: () => {
        return Date.now() + nextId++;
      },
      setState: (state: unknown) => {
        setState(state);
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
};

export const Panel: FC<PanelProps> = ({ children, trigger, className, onOpen, onClose }) => {
  const { visiblePanelId, onTrigger, getNextPanelId } = useContext(PanelStateContext);

  const panelId = useMemo(() => getNextPanelId(), []);

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
