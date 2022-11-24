import { SvgIconEnum } from '../svg-img';

export const getPenIcon = (penTool: string) => {
  switch (penTool) {
    case 'square':
      return SvgIconEnum.PEN_SQUARE;
    case 'circle':
      return SvgIconEnum.PEN_CIRCLE;
    case 'line':
      return SvgIconEnum.PEN_LINE;
    case 'arrow':
      return SvgIconEnum.PEN_ARROW;
    case 'pentagram':
      return SvgIconEnum.PEN_PENTAGRAM;
    case 'rhombus':
      return SvgIconEnum.PEN_RHOMBUS;
    case 'triangle':
      return SvgIconEnum.PEN_TRIANGLE;
    case 'pen':
    default:
      return SvgIconEnum.PEN_CURVE;
  }
};

export const getPenShapeIcon = (penTool: string) => {
  switch (penTool) {
    case 'square':
      return SvgIconEnum.SQUARE;
    case 'circle':
      return SvgIconEnum.CIRCLE;
    case 'line':
      return SvgIconEnum.LINE;
    case 'arrow':
      return SvgIconEnum.ARROW;
    case 'pentagram':
      return SvgIconEnum.PENTAGRAM;
    case 'rhombus':
      return SvgIconEnum.RHOMBUS;
    case 'triangle':
      return SvgIconEnum.TRIANGLE;
    case 'pen':
    default:
      return SvgIconEnum.PEN;
  }
};
