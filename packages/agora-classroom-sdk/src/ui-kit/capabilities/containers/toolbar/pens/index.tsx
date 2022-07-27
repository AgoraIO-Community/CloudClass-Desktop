import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { Pens, SvgIconEnum, useI18n } from '~ui-kit';

export type PensContainerProps = {
  onClick: (pen: string) => void;
};

export const PensContainer = observer(() => {
  const { toolbarUIStore } = useStore();
  const t = useI18n();
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
      label={selectedPenTool ? t(mapLineSelectorToLabel[selectedPenTool]) : ''}
      icon={SvgIconEnum.PEN_CURVE}
      activePen={selectedPenTool}
      onClick={setTool}
      isActive={isPenToolActive}
      colorSliderMin={1}
      colorSliderMax={5}
      strokeWidthValue={strokeWidth}
      colorSliderStep={1}
      onSliderChange={changeStroke}
      activeColor={currentColor}
      onColorClick={(value) => {
        changeHexColor(value);
      }}
    />
  );
});
