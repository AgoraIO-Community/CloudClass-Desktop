import Slider, { SliderSingleProps } from 'antd/lib/slider';
import classnames from 'classnames';
import { FC } from 'react';
import { BaseProps } from '../util/type';
import './index.css';
type tooltipPositionProps = 'top' | 'bottom' | '';
export interface ASliderProps extends BaseProps {
  defaultValue?: number;
  value?: number;
  disabled?: boolean;
  max?: number;
  min?: number;
  step?: number;
  tooltipPosition?: tooltipPositionProps;
  onChange?: (value: number) => void;
}

export const ASlider: FC<ASliderProps & Pick<SliderSingleProps, 'vertical'>> = ({
  defaultValue = 0,
  value = 0,
  disabled = false,
  max = 100,
  min = 0,
  step = 1,
  tooltipPosition = 'bottom',
  onChange = (value: number) => {
    console.log(value);
  },
  className,
  vertical,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-theme`]: 1,
    [`slider`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps}>
      <Slider
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        max={max}
        min={min}
        step={step}
        vertical={vertical}
        onChange={onChange}
      />
    </div>
  );
};
