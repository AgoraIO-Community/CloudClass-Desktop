import React, { FC, useState, useRef } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/util/type';
import ReactSelect from 'react-select';
import { CSSTransition } from 'react-transition-group';
import './index.css';
import { transI18n } from '~components/i18n';

export type SelectOption = {
  label: string;
  value: any;
};
export interface SelectProps extends BaseProps {
  defaultValue?: any;
  value?: any;
  placeholder?: string;
  options: SelectOption[];
  isSearchable?: boolean;
  defaultMenuIsOpen?: boolean;
  isMenuTextCenter?: boolean;
  prefix?: React.ReactNode;
  maxMenuHeight?: number;
  onChange?: (value: any) => unknown;
  size?: 'sm';
  direction?: 'up' | 'down';
  onOpen?: () => void;
  onClose?: () => void;
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
  size,
  direction = 'down',
  defaultValue,
  onOpen = () => {},
  onClose = () => {},
  ...restProps
}) => {
  const wrappedOptions = options.map((item: any) => ({
    label: item.i18n ? transI18n(item.label) : item.label,
    value: item.value,
  }));
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const [showOption, setShowOpton] = useState<boolean>(defaultMenuIsOpen);

  const containerCls = classnames('react-select-container', {
    ['react-select-sm']: size === 'sm',
  });

  const cls = classnames({
    [`${className}`]: !!className,
    ['react-select-prefix']: prefix,
  });

  return (
    <div className={containerCls}>
      {prefix && <div className={'select-prefix'}>{prefix}</div>}
      <ReactSelect
        defaultValue={defaultValue}
        className={cls}
        classNamePrefix="react-select"
        value={wrappedOptions.find((item) => item.value === value)}
        placeholder={placeholder}
        options={wrappedOptions}
        isSearchable={isSearchable}
        onMenuClose={() => {
          timerRef.current && clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setShowOpton(false);
            onClose();
          }, 100);
        }}
        onMenuOpen={() => {
          setShowOpton(true);
          onOpen();
        }}
        {...restProps}
      />
      <CSSTransition
        in={showOption}
        timeout={180}
        className={`options-container direction-${direction}`}
        unmountOnExit>
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {wrappedOptions.map((item) => {
            const optionCls = classnames('option-item', {
              'text-center': isMenuTextCenter,
              'is-select': item.value === value,
            });

            return (
              <div
                key={item.value}
                className={optionCls}
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
