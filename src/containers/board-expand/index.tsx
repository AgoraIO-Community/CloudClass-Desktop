import { useStore } from '@classroom/hooks/ui-store';
import { SvgImgMobile, SvgIconEnum } from '@classroom/ui-kit';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import './index.css';

type Iprops = {
  iconEnum: SvgIconEnum;
  size?: number;
  iconColor?: string;
  style?: any;
  onClick?: (e: any) => void;
};

export const BoardExpand = observer((props: Iprops) => {
  const {
    shareUIStore: { isLandscape, forceLandscape },
  } = useStore();
  return (
    <div
      onClick={props.onClick}
      className={classnames(
        'fcr-mobile-board-expand fcr-t-0 fcr-l-0 fcr-h-full fcr-flex fcr-justify-center',
      )}
      style={props.style}>
      <div>
        <SvgImgMobile
          landscape={isLandscape}
          forceLandscape={forceLandscape}
          type={props.iconEnum}
          colors={{ iconPrimary: props.iconColor || '#151515' }}
          size={props.size || 32}></SvgImgMobile>
      </div>
    </div>
  );
});
