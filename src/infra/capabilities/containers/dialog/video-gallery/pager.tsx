import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import classNames from 'classnames';
import { FC } from 'react';
import './pager.css';

export type Props = {
  nextPage: () => void;
  prevPage: () => void;
  curPage: number;
  totalPageNum: number;
};

export const Pager: FC<Props> = ({ prevPage, curPage, totalPageNum, nextPage }) => {
  const prevCls = classNames('fcr-video-grid-pager__prev', {
    hidden: curPage === 0,
  });

  const nextCls = classNames('fcr-video-grid-pager__next', {
    hidden: curPage + 1 === totalPageNum,
  });

  return (
    <div className="fcr-video-grid-pager">
      {/*  */}
      <div className={prevCls}>
        <div className="fcr-video-grid-pager__button" onClick={prevPage}>
          <SvgImg
            type={SvgIconEnum.CHEVRON_RIGHT}
            size={32}
            style={{ transform: 'rotate(180deg)' }}
          />
        </div>
        <span className="fcr-video-grid-pager__label">
          {curPage + 1}/{totalPageNum}
        </span>
      </div>
      {/*  */}
      <div className={nextCls}>
        <div className="fcr-video-grid-pager__button" onClick={nextPage}>
          <SvgImg type={SvgIconEnum.CHEVRON_RIGHT} size={32} />
        </div>
        <span className="fcr-video-grid-pager__label">
          {curPage + 1}/{totalPageNum}
        </span>
      </div>
    </div>
  );
};
