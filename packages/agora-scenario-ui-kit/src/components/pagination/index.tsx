//@ts-nocheck
import { FC } from 'react';
import RcPagination, { PaginationProps } from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import './index.css';

export const Pagination: FC<PaginationProps> = (props) => {
  return <RcPagination {...props} className="agora-pagination"></RcPagination>;
};
