import { useBoardContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { Pens, t } from '~components';

export type PensContainerProps = {
  onClick: (pen: string) => void;
};

export const PensContainer = observer((props: PensContainerProps) => {
  const { lineSelector, boardPenIsActive, setTool, updatePen, currentColor, changeHexColor } =
    useBoardContext();

  const onClick = (pen: any) => {
    setTool(pen);
    updatePen(pen);
    changeHexColor(currentColor);
  };

  const mapLineSelectorToLabel: Record<string, string> = {
    pen: 'scaffold.pencil',
    square: 'scaffold.rectangle',
    circle: 'scaffold.circle',
    line: 'scaffold.straight',
  };

  return (
    <Pens
      value="pen"
      label={t(mapLineSelectorToLabel[lineSelector])}
      icon="pen"
      activePen={lineSelector}
      onClick={onClick}
      isActive={boardPenIsActive}
    />
  );
});
