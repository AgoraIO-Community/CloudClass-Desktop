import { FC } from 'react';
import classNames from 'classnames';
import { BaseProps } from '~ui-kit/components/util/type';

type RadioElement = {
  label: string;
  value: any;
  onChange?: () => void;
  name?: string;
  checked?: boolean;
};

type RadioProps = RadioElement & BaseProps;

type RadioGroupProps = {
  gap?: number;
  direction?: 'horizontal' | 'vertical';
  name: string;
  radios: RadioElement[];
  value?: any;
  onChange?: (val: any) => void;
};

export const Radio: FC<RadioProps> = ({ label, onChange, className, name, checked = false }) => {
  const cls = classNames('inline-flex items-center cursor-pointer', className);

  return (
    <div className={cls}>
      <input type="radio" className="mr-1" name={name} checked={checked} onChange={onChange} />
      <span onClick={onChange}>{label}</span>
    </div>
  );
};

export const RadioGroup: FC<RadioGroupProps> = ({
  gap = 1,
  direction = 'horizontal',
  radios,
  name,
  value,
  onChange,
}) => {
  const isHorizontal = direction === 'horizontal';

  const cls = classNames('inline-flex', {
    'flex-col': !isHorizontal,
  });

  const radioCls = classNames(isHorizontal ? `mr-${gap}` : `mb-${gap}`);

  return (
    <div className={cls}>
      {radios.map(({ label, value: optionVal }) => (
        <Radio
          key={optionVal}
          className={radioCls}
          label={label}
          value={optionVal}
          name={name}
          onChange={() => {
            onChange && onChange(optionVal);
          }}
          checked={optionVal === value}
        />
      ))}
    </div>
  );
};
