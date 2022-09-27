import { range } from 'lodash';

export const calculateGridMatrix = (totalOfCells: number) => {
  const matrix: Array<Array<number>> = [[]];
  const sequence: { x: number; y: number }[] = [];
  const pointer = { x: 0, y: 0 };

  const getMaxRow = () => {
    return matrix[0].length === 0 ? 0 : matrix.length;
  };

  const getMaxCol = () => {
    return matrix[0]?.length || 0;
  };

  const appendToRow = () => {
    matrix[pointer.y].push(0);
    pointer.x += 1;
    sequence.push({ x: pointer.x, y: pointer.y });
  };

  const appendToCol = () => {
    matrix[pointer.y + 1].push(0);
    pointer.y += 1;
    sequence.push({ x: pointer.x, y: pointer.y });
  };

  const appendToNext = () => {
    const isLastRow = pointer.y === getMaxRow() - 1;
    const isLastCol = pointer.x === getMaxCol() - 1;
    if (isLastRow) {
      appendToRow();
    } else if (isLastCol) {
      appendToCol();
    }
  };

  const addRow = () => {
    matrix.push([0]);
    pointer.y = matrix.length - 1;
    pointer.x = 0;
    sequence.push({ x: pointer.x, y: pointer.y });
  };

  const addCol = () => {
    matrix[0].push(0);
    pointer.y = 0;
    pointer.x = matrix[0].length - 1;
    sequence.push({ x: pointer.x, y: pointer.y });
  };

  range(totalOfCells).forEach((_, idx) => {
    const maxRow = getMaxRow();
    const maxCol = getMaxCol();
    // complete means it is a complete N * N matrix, next row or col will start
    const complete = maxRow * maxCol === idx;

    if (complete) {
      if (maxRow >= maxCol) {
        addCol();
        return;
      }
      if (maxRow <= maxCol) {
        addRow();
        return;
      }
    } else {
      appendToNext();
    }
  });

  return {
    matrix,
    sequence,
    numOfRows: getMaxRow(),
    numOfCols: getMaxCol(),
  };
};
