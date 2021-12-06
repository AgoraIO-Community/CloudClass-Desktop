import { useMemo } from 'react';
import {
  defaultColumns,
  kickOutColumn,
  podiumColumn,
  grantBoardColumn,
  starsColumn,
} from './columns';
import { Column } from './';
import { SupportedFunction } from '~ui-kit';
import { sortBy } from 'lodash';

export const useColumns = (functions: SupportedFunction[]) => {
  const showKickOut = functions.includes('kick');

  const cols = useMemo(() => {
    const cols = ([] as Column[]).concat(defaultColumns);
    if (functions.includes('kick')) {
      cols.push(kickOutColumn);
    }
    if (functions.includes('podium')) {
      cols.push(podiumColumn);
    }

    if (functions.includes('grant-board')) {
      cols.push(grantBoardColumn);
    }

    if (functions.includes('stars')) {
      cols.push(starsColumn);
    }

    return sortBy(cols, ['order']);
  }, [showKickOut]);

  return cols;
};
