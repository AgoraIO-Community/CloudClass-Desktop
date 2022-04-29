import classnames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import './index.css';
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
  const loadResource = useCallback(
    async (canvas: HTMLCanvasElement | null) => {
      if (canvas) {
        const parser = new Parser();
        const player = new Player(canvas);
        parser.load(url, (videoItem) => {
          player.setVideoItem(videoItem);
          player.loops = loops ? 0 : 1;
          player.onFinished(() => {
            onFinish && onFinish();
          });
          player.startAnimation();
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
  }, [ref.current]);

  return <canvas width={width} height={height} ref={ref}></canvas>;
};
