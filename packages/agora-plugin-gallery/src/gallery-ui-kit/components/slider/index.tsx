import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';

import RCSlider, { SliderTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import './index.css';

const { Handle } = RCSlider


type tooltipPositionProps = 'top' | 'bottom'
export interface SliderProps extends BaseProps {
    defaultValue?: number;
    disabled?: boolean;
    max?: number;
    min?: number;
    step?: number;
    tooltipPosition?: tooltipPositionProps;
    onChange?: (value: number) => void;
}

export const Slider: FC<SliderProps> = ({
    defaultValue = 0,
    disabled = false,
    max = 100,
    min = 0,
    step = 1,
    tooltipPosition = 'bottom',
    onChange = (value: number) => { console.log(value) },
    className,
    ...restProps
}) => {
    const handle = (props: any) => {
        const { value, dragging, index, ...restProps } = props;
        return (
            <SliderTooltip
                prefixCls="rc-slider-tooltip"
                overlay={`${value}`}
                visible={dragging}
                placement={tooltipPosition}
                key={index}
                overlayClassName={'agora-slider-tooltip'}
            >
                <Handle value={value} {...restProps} />
            </SliderTooltip>
        );
    };
    const cls = classnames({
        [`slider`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <RCSlider
                defaultValue={defaultValue}
                disabled={disabled}
                max={max}
                min={min}
                step={step}
                onChange={onChange}
                handle={handle}
            />
        </div>
    )
}
