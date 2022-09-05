import { FC } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { SvgImg, SvgIcon, SvgIconEnum } from '~components/svg-img';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';


export interface ToolCabinetProps {
  label: string,
  visible: boolean,
  onVisibilityChange: (visible: boolean) => void
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
  label,
  children,
  visible,
  onVisibilityChange
}) => {

  const content = () => (
    <div className={`expand-tools tool-cabinet`}>
      {children}
    </div>
  );


  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip" mouseLeaveDelay={0}>
      <Popover
        visible={visible}
        onVisibleChange={onVisibilityChange}
        overlayClassName="tool-cabinet-popover"
        trigger="hover"
        content={content}
        placement="left">
        <div className="tool">
          <SvgIcon
            type={SvgIconEnum.TOOLS}
            hoverType={SvgIconEnum.TOOLS}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
          />
          <SvgImg size={6} type={SvgIconEnum.TRIANGLE_DOWN} className="triangle-icon" />
        </div>
      </Popover>
    </Tooltip>
  );
};
