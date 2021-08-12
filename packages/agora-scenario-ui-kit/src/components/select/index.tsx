import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import ReactSelect from 'react-select';

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
        // @ts-ignore
        onChange={(option: SelectOption) => {
          onChange && onChange(option.value);
        }}
        defaultMenuIsOpen={defaultMenuIsOpen}
        maxMenuHeight={maxMenuHeight}
        {...restProps}
      />
    </div>
  );
};
