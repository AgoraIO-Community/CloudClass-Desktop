import { WidgetTrackStruct } from '../type';
import { StreamWindow, StreamWindowBounds } from './type';

export function isNum(num: unknown): boolean {
  return typeof num === 'number' && !isNaN(num);
}

/**
 * 计算 8 宫格布局
 * 当数量小于等于 3 的时候一行展示
 *
 *	 ┌───────┐
 *	 │   1   │
 *	 └───────┘
 *
 *	 ┌───────┬───────┐
 *	 │   1   │   2   │
 *	 └───────┴───────┘
 *
 *	 ┌───────┬───────┬───────┐
 *	 │   1   │   2   │   3   │
 *	 └───────┴───────┴───────┘
 *
 *
 *	 当数量大于3的时候
 *
 *	 ┌───────┬───────┐
 *	 │   3   │   4   │
 *	 ├───────┼───────┤
 *	 │   1   │   2   │
 *	 └───────┴───────┘
 *
 *	┌───────────┬───────────┐
 *	│     4     │     5     │
 *	├───────┬───┴───┬───────┤
 *	│   1   │   2   │   3   │
 *	└───────┴───────┴───────┘
 *
 *	┌───────┬───────┬───────┐
 *	│   4   │   5   │   6   │
 *	├───────┼───────┼───────┤
 *	│   1   │   2   │   3   │
 *	└───────┴───────┴───────┘
 *
 *	┌───────────┬─────────┬─────────┐
 *	│     5     │    6    │    7    │
 *	├───────┬───┴───┬─────┴─┬───────┤
 *	│   1   │   2   │   3   │   4   │
 *	└───────┴───────┴───────┴───────┘
 *
 *	┌───────┬───────┬───────┬───────┐
 *	│   5   │   6   │   7   │   8   │
 *	├───────┼───────┼───────┼───────┤
 *	│   1   │   2   │   3   │   4   │
 *	└───────┴───────┴───────┴───────┘
 *
 * @param length
 * @param width
 * @param height
 * @returns
 */
export const calculateSize = (length: number, width: number, height: number) => {
  let rectSize: Array<Array<StreamWindowBounds>> = [];
  const baseLength = 3,
    maxRow = 2;
  if (!length) {
    return rectSize;
  }
  // 窗口不大于 3 的时候
  if (length <= baseLength) {
    const perWidth = width / length;
    let rect = Array(length).fill({});
    rect = rect.map((_, index) => {
      const perRect: StreamWindowBounds = {
        width: perWidth,
        height: height,
        x: index * perWidth,
        y: 0,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
    rectSize.push(rect as StreamWindowBounds[]);
    return rectSize;
  }

  // 窗口数大于 3 的时候
  if (length > baseLength) {
    const column = Math.ceil(length / maxRow),
      topColumn = length - column,
      bottomPerWidth = width / column,
      topPerWidth = width / topColumn,
      perHeight = height / maxRow;
    let topRects = Array(topColumn).fill({}),
      bottomRects = Array(column).fill({});
    topRects = topRects.map((value, index) => {
      const perRect: StreamWindowBounds = {
        width: topPerWidth,
        height: perHeight,
        x: index * topPerWidth,
        y: 0,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
    bottomRects = bottomRects.map((value, index) => {
      const perRect: StreamWindowBounds = {
        width: bottomPerWidth,
        height: perHeight,
        x: index * bottomPerWidth,
        y: height / 2,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });

    rectSize = [bottomRects, topRects];
  }
  return rectSize;
};

/**
 * 计算 9 宫格布局
 * 计算规则为 1^2  2^2 3^2
 */
export const calculateSizeSquare = (length: number, width: number, height: number) => {
  let perCountsInRow = 1; // 当行最大数量
  let rectSize: Array<Array<StreamWindowBounds>> = [];
  if (length <= Math.pow(1, 2)) {
    perCountsInRow = 1;
  } else if (length <= Math.pow(2, 2)) {
    perCountsInRow = 2;
  } else if (length <= Math.pow(3, 3)) {
    perCountsInRow = 3;
  }
  const remainder = length % perCountsInRow; // 取余数
  const column = Math.floor(length / perCountsInRow); // 满行的行数
  const totalColumn = Math.ceil(length / perCountsInRow); // 总共的行数
  const perHeight = height / totalColumn; // 每项的高度
  const initialArr = Array(column).fill(Array(perCountsInRow).fill({}));

  remainder && initialArr.push(Array(remainder).fill({}));

  rectSize = initialArr.map((line, lineIndex) => {
    return line.map((_: any, itemIndex: number, arr: any[]) => {
      const perWidth = width / arr.length;
      const perRect: StreamWindowBounds = {
        width: perWidth,
        height: perHeight,
        x: itemIndex * perWidth,
        y: (height * (totalColumn - lineIndex - 1)) / totalColumn,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
  });

  return rectSize;
};

/**
 * 需要把 x, y 为可移动距离的比例
 * 最大有效移动范围（Maximum Effective Distance, MED）：在不超出教室布局的前提下，分别能够在 X 轴、Y 轴方向移动的最大距离
 * 移动偏移量：
 * @param rect
 */
export const convertToWidgetTrackPos = (
  rect: StreamWindow,
  bigRect: { width: number; height: number },
) => {
  const { x, y, width, height } = rect;
  const { width: containerWidth, height: containerHeight } = bigRect;
  const MEDx = containerWidth - width,
    MEDy = containerHeight - height;
  let widgetx = x / MEDx,
    widgety = y / MEDy;
  const widgetWidth = width / containerWidth,
    widgetHeight = height / containerHeight;
  widgetx = isNaN(widgetx) ? 0 : widgetx;
  widgety = isNaN(widgety) ? 0 : widgety;
  return {
    position: {
      xaxis: widgetx,
      yaxis: widgety,
    },
    size: {
      width: widgetWidth,
      height: widgetHeight,
    },
    extra: {
      contain: rect.contain,
      zIndex: rect.zIndex,
    },
  };
};

/**
 * 把 widget 坐标转换为目前的用的坐标
 * @param rect
 * @param bigRect
 */
export const convertToRelativePos = (
  rect: WidgetTrackStruct,
  streamWindowRect: { width: number; height: number },
) => {
  const {
    position: { xaxis, yaxis },
    size: { width: widgetWidth, height: widgetHeight },
    extra,
  } = rect;
  const width = streamWindowRect.width * widgetWidth,
    height = streamWindowRect.height * widgetHeight;
  const posX = xaxis * (streamWindowRect.width - width);
  const posY = yaxis * (streamWindowRect.height - height);

  return {
    x: posX,
    y: posY,
    width,
    height,
    zIndex: extra.zIndex,
    contain: extra.contain,
  };
};
