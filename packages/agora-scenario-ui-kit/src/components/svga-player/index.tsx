import classnames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import { BaseProps } from '../util/type';
export type { SvgaTypes } from './svga-types';
import { Parser, Player } from 'svgaplayerweb';

export interface SvgaPlayerProps extends BaseProps {
  width?: number;
  height?: number;
  url: string;
  onFinish?: () => void;
  loops?: boolean;
}

export const SvgaPlayer: React.FC<SvgaPlayerProps> = ({
  width,
  height,
  style,
  className,
  url,
  id,
  onFinish,
  loops = false,
  ...restProps
}) => {
  const cls = classnames({
    [`svga-player`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <div
      className={cls}
      style={{
        width: width ? width : 'auto',
        height: height ? height : 'auto',
        ...style,
      }}>
      <SvgaResource
        width={width}
        height={height}
        loops={loops}
        url={url}
        onFinish={onFinish}
        {...restProps}
      />
    </div>
  );
};

type SvgaResourceProps = {
  url: string;
  onFinish?: () => void;
  loops?: boolean;
  width?: number | string;
  height?: number | string;
};

const SvgaResource: React.FC<SvgaResourceProps> = ({
  url,
  onFinish,
  loops = false,
  width = 'auto',
  height = 'auto',
}) => {
  const playerRef = useRef<Player>();
  const loadResource = useCallback(
    async (canvas: HTMLCanvasElement | null) => {
      if (canvas) {
        const parser = new Parser();
        playerRef.current = new Player(canvas);
        parser.load(url, (videoItem) => {
          playerRef.current?.setVideoItem(videoItem);
          playerRef.current?.onFinished(() => {
            onFinish && onFinish();
          });
          if (playerRef.current) playerRef.current.loops = loops ? 0 : 1;

          playerRef.current?.startAnimation();
        });
      }
    },
    [url],
  );

  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      loadResource(ref.current);
    }
    return () => playerRef.current?.clear();
  }, []);

  return <canvas width={width} height={height} ref={ref}></canvas>;
};
