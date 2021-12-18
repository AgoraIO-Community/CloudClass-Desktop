import React, { FC, useState, useRef } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import ReactSelect from 'react-select';
import { CSSTransition } from 'react-transition-group';
import './index.css';
import { transI18n } from '~components/i18n';

export type SelectOption = {
  label: string;
  value: any;
};
export interface SelectProps extends BaseProps {
  value?: string | undefined;
  placeholder?: string;
  options: SelectOption[];
  isSearchable?: boolean;
  defaultMenuIsOpen?: boolean;
  isMenuTextCenter?: boolean;
  prefix?: React.ReactNode;
  maxMenuHeight?: number;
  onChange?: (value: string) => unknown;
}

// 基于react-select封装 https://github.com/JedWatson/react-select/blob/master/README.md
export const Select: FC<SelectProps> = ({
  value,
  placeholder = '',
  options,
  isSearchable = false,
  defaultMenuIsOpen = false,
  isMenuTextCenter = false,
  prefix,
  maxMenuHeight = 300,
  onChange,
  className,
  ...restProps
}) => {
  const wrappedOptions = options.map((item: any) => ({
    label: item.i18n ? transI18n(item.label) : item.label,
    value: item.value,
  }));

  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const [showOption, setShowOpton] = useState<boolean>(defaultMenuIsOpen);

  const cls = classnames({
    [`select`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={'react-select-container'}>
      {prefix && <div className={'select-prefix'}>{prefix}</div>}
      <ReactSelect
        className={[cls, prefix ? 'react-select-prefix' : ''].join(' ')}
        classNamePrefix={['react-select'].join(' ')}
        value={wrappedOptions.find((item) => item.value === value)}
        placeholder={placeholder}
        options={wrappedOptions}
        isSearchable={isSearchable}
        onMenuClose={() => {
          timerRef.current && clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setShowOpton(false);
          }, 100);
        }}
        onMenuOpen={() => {
          setShowOpton(true);
        }}
        {...restProps}
      />
      <CSSTransition in={showOption} timeout={180} className="options-container" unmountOnExit>
        <div>
          {wrappedOptions.map((item) => {
            return (
              <div
                key={item.value}
                className={classnames({
                  'option-item': 1,
                  'text-center': isMenuTextCenter,
                  'is-select': item.value === value,
                })}
                onClick={() => {
                  onChange && onChange(item.value);
                }}>
                {item.label}
              </div>
            );
          })}
        </div>
      </CSSTransition>
    </div>
  );
};
