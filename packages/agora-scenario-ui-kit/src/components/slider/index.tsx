import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';

import RCSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './index.css';

export interface SliderProps extends BaseProps {
    defaultValue: number;
    disabled?: boolean;
    max?: number;
    min?: number;
    step?: number;
    tooltipPlacement?: string;
    onChange?: (value: number) => void;
}

export const Slider: FC<SliderProps> = ({
    defaultValue = 0,
    disabled = false,
    max = 100,
    min = 0,
    step = 1,
    tooltipPlacement = 'tooltipPlacement',
    onChange = (value: number) => { console.log(value) },
    className,
    ...restProps
}) => {
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
            />
        </div>
    )
}
