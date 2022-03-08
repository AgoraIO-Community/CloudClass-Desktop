import { FC, useContext, useMemo, cloneElement, useState, createContext } from 'react';
import { Popover } from '~ui-kit';

export const PanelStateContext = createContext<{
  visiblePanelId: number;
  onTrigger: (panelId: number) => void;
  getNextPanelId: () => number;
}>({
  visiblePanelId: 0,
  onTrigger: () => {},
  getNextPanelId: () => 0,
});

export const usePanelState = () => {
  const [visiblePanelId, setVisiblePanelId] = useState(0);

  const panelState = useMemo(() => {
    let nextId = 0;
    return {
      visiblePanelId,
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
    };
  }, [visiblePanelId]);

  return panelState;
};

type PanelProps = {
  trigger: React.ReactElement;
  className?: string;
};

export const Panel: FC<PanelProps> = ({ children, trigger, className }) => {
  const { visiblePanelId, onTrigger, getNextPanelId } = useContext(PanelStateContext);

  const panelId = useMemo(() => getNextPanelId(), []);

  const childBtn = cloneElement(trigger, {
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      onTrigger(panelId);
    },
  });

  return (
    <Popover
      overlayClassName={className}
      visible={visiblePanelId === panelId}
      placement="rightTop"
      content={children}>
      {childBtn}
    </Popover>
  );
};
