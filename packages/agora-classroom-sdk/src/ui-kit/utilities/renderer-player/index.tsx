import type { IMediaRenderer } from 'agora-edu-core';
import classnames from 'classnames';
import * as React from 'react';
import { useRendererPlayer } from '~utilities/hooks';

export interface RendererPlayerProps {
  preview?: boolean;
  track?: IMediaRenderer;
  id?: string;
  className?: string;
  fitMode?: boolean;
  style?: React.CSSProperties;
  children?: any;
  mirror?: boolean;
  placeholderComponent?: React.ReactElement;
}

export const RendererPlayer = (props: RendererPlayerProps) => {
  const cls = classnames({
    [`mirror`]: !!props.mirror,
    [`${props.className}`]: !!props.className,
  });

  const ref = useRendererPlayer<HTMLDivElement>(props);

  return (
    <div
      className={cls}
      style={props.style}
      key={props.track && props.track.videoTrack ? props.track.videoTrack.getTrackId() : ''}
      id={props.id ? props.id : ''}
      ref={ref}>
      {props.children ? props.children : null}
    </div>
  );
};
