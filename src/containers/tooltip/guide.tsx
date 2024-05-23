import 'rc-tooltip/assets/bootstrap_white.css';
import { CSSProperties, FC } from 'react';
import RcToolTip from 'rc-tooltip';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import './index.css';
import './arrow.css';

import classNames from 'classnames';
// import { ToolTip,  } from '.';

export interface ToolTipProps {
  /**
   * 卡片内容
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  content?: ReactNode;
  /**
   * 触发行为，可选 hover | focus | click | contextMenu
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */

  trigger?: ToolTipActionType;
  /**
   * 气泡框位置，可选 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  /**
   * 自定义箭头
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  arrowContent?: ReactNode;
  /**
   * 卡片内容区域的样式对象
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  overlayInnerStyle?: CSSProperties;
  /**
   * 气泡的显示状态
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  visible?: boolean;
  /**
   * 卡片类名
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  overlayClassName?: string;
  /**
   * 修改箭头的显示状态
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  showArrow?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  motion?: CSSMotionProps;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;
  children?: React.ReactNode;
  mouseEnterDelay?: number;
  overlayOffset?: number;
  mouseLeaveDelay?: number;
  afterVisibleChange?: (visible: boolean) => void;
}

const calcOverlayOffset = (placement: string, offset: number) => {
  if (placement.includes('top')) {
    return [0, -offset];
  }
  if (placement.includes('bottom')) {
    return [0, offset];
  }
  if (placement.includes('left')) {
    return [-offset, 0];
  }
  if (placement.includes('right')) {
    return [offset, 0];
  }
};

export const ToolTip: FC<ToolTipProps> = (props) => {
  const {
    content,
    children,
    trigger,
    placement = 'top',
    arrowContent,
    overlayInnerStyle,
    overlayClassName,
    showArrow = true,
    onVisibleChange,
    motion,
    getTooltipContainer,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayOffset = 12,
    afterVisibleChange,
    ...others
  } = props;

  const defaultOverlayInnerStyle: CSSProperties = {
    padding: '0 10px',
    fontStyle: 'normal',
    fontWeight: '300',
    fontSize: '14px',
    lineHeight: '32px',
    width: 'max-content',
  };

  return (
    <RcToolTip
      destroyTooltipOnHide
      afterVisibleChange={afterVisibleChange}
      mouseLeaveDelay={mouseLeaveDelay}
      mouseEnterDelay={mouseEnterDelay ?? 1}
      getTooltipContainer={getTooltipContainer}
      onVisibleChange={onVisibleChange}
      prefixCls="fcr-tooltip"
      overlayClassName={overlayClassName}
      arrowContent={
        showArrow === false
          ? null
          : arrowContent || (
              <SvgImg
                type={SvgIconEnum.FCR_TOOLTIP_ARROW}
                colors={{
                  iconPrimary: '#FFD952',
                  iconSecondary: '#FFD952',
                }}
                size={16}></SvgImg>
            )
      }
      align={{ offset: calcOverlayOffset(placement, overlayOffset) }}
      trigger={trigger}
      placement={placement}
      overlay={content}
      overlayInnerStyle={{ ...defaultOverlayInnerStyle, ...overlayInnerStyle }}
      motion={
        motion || {
          motionAppear: true,
          motionName: 'fcr-tooltip-anim',
        }
      }
      {...others}>
      {(children as ReactElement) || <></>}
    </RcToolTip>
  );
};

interface GuideToolTipProps extends ToolTipProps {
  /**
   * 是否显示关闭按钮
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  closable?: boolean;
  /**
   * 点击关闭按钮的回调
   */
  /** @en
   * Size of the input box:
   * medium
   * large
   */
  onClose?: () => void;
}
const GuideToolTipClosableOverlayWrap: FC<Pick<GuideToolTipProps, any>> = (props) => {
  const { content, closable, onClose } = props;

  return (
    <div className={classNames('fcr-guide-tooltip-overlay-content')}>
      <div
        style={{
          padding: closable ? '0px 8px' : '0px 24px',
        }}
        className={classNames('fcr-guide-tooltip-overlay-content-inner')}>
        {content}
      </div>
      {closable && (
        <div
          className={classNames('fcr-guide-tooltip-overlay-content-closable', 'fcr-divider')}
          onClick={onClose}>
          <SvgImg type={SvgIconEnum.FCR_CLOSE} colors={{ iconPrimary: 'white' }} size={24}></SvgImg>
        </div>
      )}
    </div>
  );
};
export const GuideToolTip: FC<GuideToolTipProps> = (props) => {
  const { closable, content, onClose, ...others } = props;
  const defaultGuideOverlayInnerStyle: CSSProperties = {
    padding: '0',
    background: `#FFD952`,
    border: `#FFD952`,
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '14px',
    lineHeight: '40px',
    color: 'white',
    borderRadius: `8px`,
  };
  const iconColor = props.overlayInnerStyle?.background || colors['brand'][6];
  return (
    <ToolTip
      arrowContent={
        <SvgImg
          type={SvgIconEnum.FCR_TOOLTIP_ARROW}
          colors={{
            iconPrimary: iconColor as string,
            iconSecondary: iconColor as string,
          }}
          size={16}></SvgImg>
      }
      content={
        <GuideToolTipClosableOverlayWrap
          content={content}
          onClose={onClose}
          closable={closable}></GuideToolTipClosableOverlayWrap>
      }
      overlayInnerStyle={{
        ...defaultGuideOverlayInnerStyle,
        ...props.overlayInnerStyle,
      }}
      {...others}></ToolTip>
  );
};
