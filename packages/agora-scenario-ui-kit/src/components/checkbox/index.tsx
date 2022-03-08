import classNames from 'classnames';
import { FC, SyntheticEvent, useEffect, useRef } from 'react';
import { BaseProps } from '../interface/base-props';
import './index.css';

type CheckboxProps = BaseProps & {
  text?: string;
  value?: any;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (e: SyntheticEvent<HTMLElement>) => void;
  gap?: number;
};

export const CheckBox: FC<CheckboxProps> = ({
  text,
  value,
  checked = false,
  disabled = false,
  indeterminate = false,
  gap,
  ...restProps
}) => {
  const checkboxRef = useRef<null | HTMLInputElement>(null);
  useEffect(() => {
    const checkboxEl = checkboxRef.current;
    if (checkboxEl) {
      checkboxEl.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const cls = classNames('pure-material-checkbox', {
    [`gap-${gap}`]: !!gap,
  });

  return (
    <label className={cls}>
      <input
        ref={checkboxRef}
        type="checkbox"
        value={value}
        checked={checked}
        disabled={disabled}
        {...restProps}
      />
      <span>{text}</span>
    </label>
  );
};
