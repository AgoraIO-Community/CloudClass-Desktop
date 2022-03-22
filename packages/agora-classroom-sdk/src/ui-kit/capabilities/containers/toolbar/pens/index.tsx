import { useStore } from '~hooks/use-edu-stores';

import { observer } from 'mobx-react';
import { Pens, t } from '~ui-kit';

export type PensContainerProps = {
  onClick: (pen: string) => void;
};

export const PensContainer = observer((props: PensContainerProps) => {
  const { toolbarUIStore } = useStore();
  const {
    setTool,
    selectedPenTool,
    isPenToolActive,
    currentColor,
    strokeWidth,
    changeStroke,
    changeHexColor,
    defaultPens,
    defaultColors,
    paletteMap,
  } = toolbarUIStore;

  const mapLineSelectorToLabel: Record<string, string> = {
    pen: 'scaffold.pencil',
    square: 'scaffold.rectangle',
    circle: 'scaffold.circle',
    line: 'scaffold.straight',
    arrow: 'scaffold.arrow',
    pentagram: 'scaffold.pentagram',
    rhombus: 'scaffold.rhombus',
    triangle: 'scaffold.triangle',
  };

  return (
    <Pens
      pens={defaultPens}
      colors={defaultColors}
      paletteMap={paletteMap}
      value="pen"
      label={t(mapLineSelectorToLabel[selectedPenTool])}
      icon="pen"
      activePen={selectedPenTool}
      onClick={setTool}
      isActive={isPenToolActive}
      colorSliderMin={1}
      colorSliderMax={5}
      strokeWidthValue={strokeWidth}
      colorSliderStep={1}
      onSliderChange={changeStroke}
      activeColor={currentColor}
      onColorClick={(value: any) => {
        changeHexColor(value);
      }}
    />
  );
});
