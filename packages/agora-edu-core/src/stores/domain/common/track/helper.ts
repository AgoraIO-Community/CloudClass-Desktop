import { clamp } from 'lodash';
import { Dimensions, Margin, Point, ResizeBounds } from './type';

export const convertRatioToLocal = (
  diffRatio: { ratioX: number; ratioY: number },
  sizeRatio: { ratioWidth: number; ratioHeight: number },
  outerSize: { width: number; height: number },
  margin: Margin,
  resizeBounds: ResizeBounds,
) => {
  const { position } = convertRatioToLocalPosition(
    diffRatio,
    sizeRatio,
    outerSize,
    margin,
    resizeBounds,
  );
  const { dimensions } = convertRatioToLocalDimensions(sizeRatio, outerSize, resizeBounds);
  return {
    position,
    dimensions,
  };
};

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
  };
};

export const convertRatioToLocalDimensions = (
  sizeRatio: { ratioWidth: number; ratioHeight: number },
  outerSize: { width: number; height: number },
  resizeBounds: ResizeBounds,
) => {
  const dimensions = {
    width: sizeRatio.ratioWidth * outerSize.width,
    height: sizeRatio.ratioHeight * outerSize.height,
  };
  dimensions.width = clamp(dimensions.width, resizeBounds.minWidth, resizeBounds.maxWidth);

  dimensions.height = clamp(dimensions.height, resizeBounds.minHeight, resizeBounds.maxHeight);

  return {
    dimensions,
  };
};

export const convertLocalToRatio = (
  position: Point,
  dimensions: Dimensions,
  medX: number,
  medY: number,
  outerSize: Dimensions,
  margin: Margin,
) => {
  const { ratioPosition } = convertLocalPositionToRatio(position, medX, medY, margin);
  const { ratioDimensions } = convertLocalDimensionsToRatio(dimensions, outerSize);
  return {
    ratioPosition,
    ratioDimensions,
  };
};

export const convertLocalPositionToRatio = (
  position: Point,
  medX: number,
  medY: number,
  margin: Margin,
) => {
  const diffRatioX = clamp(medX === 0 ? 0 : position.x / medX, 0, 1);
  const diffRatioY = clamp(medY === 0 ? 0 : (position.y - margin.top) / medY, 0, 1);

  return {
    ratioPosition: { x: diffRatioX, y: diffRatioY },
  };
};

export const convertLocalDimensionsToRatio = (dimensions: Dimensions, outerSize: Dimensions) => {
  const ratioWidth = clamp(dimensions.width / outerSize.width, 0, 1);
  const ratioHeight = clamp(dimensions.height / outerSize.height, 0, 1);

  return {
    ratioDimensions: { width: ratioWidth, height: ratioHeight },
  };
};
