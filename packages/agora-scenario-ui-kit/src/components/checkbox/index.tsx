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
};

export const CheckBox: FC<CheckboxProps> = ({
  text,
  value,
  checked = false,
  disabled = false,
  indeterminate = false,
  ...restProps
}) => {
  const checkboxRef = useRef<null | HTMLInputElement>(null);
  useEffect(() => {
    const checkboxEl = checkboxRef.current;
    if (checkboxEl) {
      checkboxEl.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return (
    <label className="pure-material-checkbox">
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
