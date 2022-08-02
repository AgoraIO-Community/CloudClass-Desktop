import { FC, useCallback, useRef, useContext } from 'react';
import classnames from 'classnames';
import { SvgImg, SvgIconEnum } from '~ui-kit';
import { AutoSizer } from 'react-virtualized';
import './widget-modal.css';
import { themeContext } from '../theme';

type WidgetModalProps = {
  title: string;
  closable: boolean;
  minHeight?: number;
  minWidth?: number;
  onCancel: () => void;
  onResize?: ({ width, height }: { width: number; height: number }, initial: boolean) => void;
  header?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  showFullscreen?: boolean;
  showRefresh?: boolean;
  onFullScreen?: () => void;
  onReload?: () => void;
};

export const WidgetModal: FC<WidgetModalProps> = ({
  title,
  closable,
  onCancel,
  onResize,
  minHeight,
  minWidth,
  children,
  header,
  className,
  showFullscreen,
  showRefresh,
  onFullScreen,
  onReload,
}) => {
  const cls = classnames('widget-modal', 'relative', 'w-full', 'h-full', className);
  const resizeTimes = useRef(0);
  const { textLevel1 } = useContext(themeContext);
  const handleResize = useCallback(
    (dimensions: { width: number; height: number }) => {
      if (onResize) {
        onResize(dimensions, resizeTimes.current === 0);
      }
      resizeTimes.current += 1;
    },
    [onResize],
  );

  return (
    <div className={cls} style={{ minHeight, minWidth }}>
      <AutoSizer onResize={handleResize}>
        {() => <div className="w-full h-full absolute" style={{ zIndex: -1 }} />}
      </AutoSizer>
      <div className="modal-title">
        <div className="modal-title-text">{title}</div>
        {header && <div className="modal-header-slot">{header}</div>}
        <div className="modal-action-group">
          {showRefresh ? (
            <div className="modal-title-action" onClick={onReload}>
              <SvgImg
                type={SvgIconEnum.CLOUD_REFRESH}
                size={20}
                colors={{ iconPrimary: textLevel1 }}
              />
            </div>
          ) : null}
          {showFullscreen ? (
            <div className="modal-title-action" onClick={onFullScreen}>
              <SvgImg
                type={SvgIconEnum.FULLSCREEN}
                size={20}
                colors={{ iconPrimary: textLevel1 }}
              />
            </div>
          ) : null}
          {closable ? (
            <div
              className="modal-title-action modal-title-close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
              }}>
              <SvgImg type={SvgIconEnum.CLOSE} size={20} colors={{ iconPrimary: textLevel1 }} />
            </div>
          ) : null}
        </div>
      </div>
      <div className={'modal-content'}>{children}</div>
    </div>
  );
};
