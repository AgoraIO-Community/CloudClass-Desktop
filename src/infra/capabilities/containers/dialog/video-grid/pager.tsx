import { useStore } from '@classroom/infra/hooks/ui-store';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { observer } from 'mobx-react';
import { FC } from 'react';
import './pager.css';

export type Props = {
  nextPage: () => void;
  prevPage: () => void;
  curPage: number;
  totalPageNum: number;
};

export const Pager: FC<Props> = ({ prevPage, curPage, totalPageNum, nextPage }) => {
  return (
    <div className="fcr-video-grid-pager">
      {/*  */}
      <div className="fcr-video-grid-pager__prev">
        <div className="fcr-video-grid-pager__button" onClick={prevPage}>
          <SvgImg
            type={SvgIconEnum.BACKWARD}
            colors={{
              iconPrimary: '#fff',
            }}
            size={32}
          />
        </div>
        <span className="fcr-video-grid-pager__label">
          {curPage + 1}/{totalPageNum}
        </span>
      </div>
      {/*  */}
      <div className="fcr-video-grid-pager__next">
        <div className="fcr-video-grid-pager__button" onClick={nextPage}>
          <SvgImg
            type={SvgIconEnum.FORWARD}
            colors={{
              iconPrimary: '#fff',
            }}
            size={32}
          />
        </div>
        <span className="fcr-video-grid-pager__label">
          {curPage + 1}/{totalPageNum}
        </span>
      </div>
    </div>
  );
};
