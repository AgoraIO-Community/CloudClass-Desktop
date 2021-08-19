import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import { Tooltip } from '~components/tooltip';
import './index.css';
import { t } from '~components/i18n';
import { SvgImg } from '~ui-kit';

export type ZoomItemType = 'max' | 'min' | 'zoom-out' | 'zoom-in' | 'backward' | 'forward';

export interface ZoomControllerProps extends BaseProps {
  zoomValue?: number;
  currentPage?: number;
  totalPage?: number;
  maximum?: boolean;
  clickHandler?: (type: ZoomItemType) => void | Promise<void>;
}

export const ZoomController: FC<ZoomControllerProps> = ({
  zoomValue = 0,
  currentPage = 0,
  totalPage = 0,
  maximum = false,
  clickHandler = (e) => {
    console.log(e);
  },
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`zoom-controller`]: 1,
    [`${className}`]: !!className,
  });
  const fontSize = 28;
  const fontColor = '#7B88A0';
  return (
    <div className={cls} {...restProps}>
      {maximum ? (
        <Tooltip title={t('tool.fullScreen')} placement="top">
          <SvgImg
            style={{ color: fontColor }}
            canHover
            type="max"
            size={fontSize}
            onClick={() => clickHandler('max')}
          />
        </Tooltip>
      ) : (
        <Tooltip title={t('tool.reduction')} placement="top">
          <SvgImg
            style={{ color: fontColor }}
            canHover
            type="min"
            size={fontSize}
            onClick={() => clickHandler('min')}
          />
        </Tooltip>
      )}
      <Tooltip title={t('tool.zoomOut')} placement="top">
        <SvgImg
          style={{ color: fontColor }}
          canHover
          type="zoom-out"
          size={fontSize}
          onClick={() => clickHandler('zoom-out')}
        />
      </Tooltip>
      <span className="zoom-value">{zoomValue}%</span>
      <Tooltip title={t('tool.zoomIn')} placement="top">
        <SvgImg
          style={{ color: fontColor }}
          canHover
          type="zoom-in"
          size={fontSize}
          onClick={() => clickHandler('zoom-in')}
        />
      </Tooltip>
      <span className="line"></span>
      <Tooltip title={t('tool.prev')} placement="top">
        <SvgImg
          style={{ color: fontColor }}
          canHover
          type="backward"
          size={fontSize}
          onClick={() => clickHandler('backward')}
        />
      </Tooltip>
      <span className="page-info">
        {currentPage}/{totalPage}
      </span>
      <Tooltip title={t('tool.next')} placement="top">
        <SvgImg
          style={{ color: fontColor }}
          canHover
          type="forward"
          size={fontSize}
          onClick={() => clickHandler('forward')}
        />
      </Tooltip>
    </div>
  );
};
