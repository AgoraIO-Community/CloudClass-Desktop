import { FC, useCallback, useRef } from 'react';
import classnames from 'classnames';
import { AutoSizer } from 'react-virtualized';
import './widget-modal.css';
import { SvgImg } from '../svg-img';

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

  const handleResize = useCallback((dimensions: { width: number, height: number }) => {
    if (onResize) {
      onResize(dimensions, resizeTimes.current === 0);
    }
    resizeTimes.current += 1;
  }, [onResize]);

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
              <SvgImg type="cloud-refresh" size={20} style={{ color: '#586376' }} />
            </div>
          ) : null}
          {showFullscreen ? (
            <div className="modal-title-action" onClick={onFullScreen}>
              <SvgImg type="fullscreen" size={20} style={{ color: '#586376' }} />
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
              <SvgImg type="close" size={20} style={{ color: '#586376' }} />
            </div>
          ) : null}
        </div>
      </div>
      <div className={'modal-content'}>{children}</div>
    </div>
  );
};
