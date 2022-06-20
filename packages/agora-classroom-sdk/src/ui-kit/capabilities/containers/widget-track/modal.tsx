import { FC } from 'react';
import classnames from 'classnames';
import './index.css';
import { SvgImg } from '~ui-kit';
import { AutoSizer } from 'react-virtualized';

type ModalProps = {
  title: string;
  closable: boolean;
  minHeight?: number;
  minWidth?: number;
  onCancel: () => void;
  onResize?: ({ width, height }: { width: number; height: number }) => void;
  header?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  showFullscreen?: boolean;
  showRefresh?: boolean;
  onFullScreen?: () => void;
  onReload?: () => void;
};

export const Modal: FC<ModalProps> = ({
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
  const cls = classnames('modal', 'relative', 'w-full', 'h-full', className);

  return (
    <div className={cls} style={{ minHeight, minWidth }}>
      <AutoSizer onResize={onResize}>
        {() => <div className="w-full h-full absolute" style={{ zIndex: -1 }} />}
      </AutoSizer>
      <div className="modal-title">
        <div className="modal-title-text">{title}</div>
        {header && <div className="modal-header-slot">{header}</div>}
        <div className="modal-action-group">
          {showRefresh ? (
            <div className="modal-title-close" onClick={onReload}>
              <SvgImg type="cloud-refresh" size={20} style={{ color: '#586376' }} />
            </div>
          ) : null}
          {showFullscreen ? (
            <div className="modal-title-close" onClick={onFullScreen}>
              <SvgImg type="fullscreen" size={20} style={{ color: '#586376' }} />
            </div>
          ) : null}
          {closable ? (
            <div
              className="modal-title-close"
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
