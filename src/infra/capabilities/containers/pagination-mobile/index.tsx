import React, { FC, PropsWithChildren, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';

import './index.css';
import { StreamToolContext } from '../stream/context';
type PaginationProps = {
  current: number;
  total: number;
  onChange?: (current: number) => void;
};
interface PaginationMobileProps extends PaginationProps {
  wrapperCls?: string;
  direction?: 'row' | 'col';
}
const usePageCounter = (context: { current: number; total: number }) => {
  const [current, setCurrent] = useState(context.current);
  const [isNext, setIsNext] = useState(false);
  useEffect(() => {
    setCurrent(context.current);
  }, [context.current]);

  const handlePrev = () => {
    if (current <= 1) {
      return;
    }
    setIsNext(false);
    setCurrent(current - 1);
  };

  const handleNext = () => {
    if (current >= context.total) {
      return;
    }
    setIsNext(true);
    setCurrent(current + 1);
  };

  return {
    current,
    handlePrev,
    handleNext,
    isNext
  };
};
export const PaginationMobile: FC<PropsWithChildren<PaginationMobileProps>> = ({
  wrapperCls,
  current,
  total,
  onChange = () => { },
  direction = 'row',
  children,
}) => {
  const { current: innerCurrent, handleNext, handlePrev, isNext } = usePageCounter({ current, total });
  const streamToolContext = useContext(StreamToolContext);

  useEffect(() => {
    onChange(innerCurrent);
  }, [innerCurrent]);
  const prevBtnDisabled = innerCurrent <= 1;
  const prevCls = classNames(
    'fcr-pagination-mobile-float__btn',
    prevBtnDisabled ? 'fcr-pagination_btn--disabled' : 'fcr-btn-click-effect',
    streamToolContext?.toolVisible ? null : 'fcr-pagination_btn--opacity'
  );
  const nextBtnDisabled = innerCurrent >= total;
  const nextCls = classNames(
    'fcr-pagination-mobile-float__btn',
    nextBtnDisabled ? 'fcr-pagination_btn--disabled' : 'fcr-btn-click-effect',
    streamToolContext?.toolVisible ? null : 'fcr-pagination_btn--opacity'
  );

  return (
    <div
      className={classNames(
        'fcr-pagination-mobile-list',
        `fcr-pagination-mobile-list-${direction}`,
        isNext ? 'fcr-pagination-mobile-list-right' : 'fcr-pagination-mobile-list-left',
        wrapperCls,
      )}
    >
      {!prevBtnDisabled && (
        <div className="fcr-pagination-mobile-list__prev">
          <button className={prevCls} onClick={handlePrev}>
            <SvgImg type={SvgIconEnum.FCR_MOBILE_LEFT} size={16} colors={{ iconPrimary: '#000000' }} />
          </button>
        </div>
      )}
      <div className={classNames(
        'fcr-pagination-mobile-list-container',
        nextBtnDisabled && !prevBtnDisabled ? 'fcr-pagination-mobile-list-kepp-right' : null,
      )}>
        {children}
      </div>
      {!nextBtnDisabled && (
        <div className="fcr-pagination-mobile-list__next">
          <button className={nextCls} onClick={handleNext}>
            <SvgImg type={SvgIconEnum.FCR_MOBILE_RIGHT} size={16} colors={{ iconPrimary: '#000000' }} />
          </button>
        </div>
      )}
    </div>
  );
}