import { clamp } from 'lodash';
import { Dimensions, Margin, Point, ResizeBounds } from './type';
export const convertRatioToLocalPosition = (
  diffRatio: { ratioX: number; ratioY: number },
  sizeRatio: { ratioWidth: number; ratioHeight: number },
  outerSize: { width: number; height: number },
  margin: Margin,
  resizeBounds: ResizeBounds,
) => {
  const dimensions = {
    width: sizeRatio.ratioWidth * outerSize.width,
    height: sizeRatio.ratioHeight * outerSize.height,
  };
  dimensions.width = clamp(dimensions.width, resizeBounds.minWidth, resizeBounds.maxWidth);

  dimensions.height = clamp(dimensions.height, resizeBounds.minHeight, resizeBounds.maxHeight);

  const medX = outerSize.width - dimensions.width;
  const medY = outerSize.height - dimensions.height;

  return {
    position: {
      x: medX * diffRatio.ratioX,
      y: medY * diffRatio.ratioY + margin.top,
    },
    dimensions,
  };
};

export const convertLocalPositionToRatio = (
  position: Point,
  dimensions: Dimensions,
  medX: number,
  medY: number,
  outerSize: Dimensions,
  margin: Margin,
) => {
  const diffRatioX = clamp(medX === 0 ? 0 : position.x / medX, 0, 1);
  const diffRatioY = clamp(medY === 0 ? 0 : (position.y - margin.top) / medY, 0, 1);
  // clamp by bounds
  const x = clamp(position.x, 0, outerSize.width);
  const y = clamp(position.y, 0, outerSize.height);

  const ratioWidth = clamp(dimensions.width / outerSize.width, 0, 1);
  const ratioHeight = clamp(dimensions.height / outerSize.height, 0, 1);

  const width = clamp(dimensions.width, 0, outerSize.width);
  const height = clamp(dimensions.height, 0, outerSize.height);

  return {
    originPosition: { x, y },
    originDimensions: { width, height },
    ratioPosition: { x: diffRatioX, y: diffRatioY },
    ratioDimensions: { width: ratioWidth, height: ratioHeight },
  };
};

export const getRootDimensions = (containerNode: Window | HTMLElement) => {
  const height =
    containerNode instanceof Window ? containerNode.innerHeight : containerNode.clientHeight;
  const width =
    containerNode instanceof Window ? containerNode.innerWidth : containerNode.clientWidth;
  return { width, height };
};
