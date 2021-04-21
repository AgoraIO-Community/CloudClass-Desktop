import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import ReactSelect from 'react-select'

import './index.css'
import { boolean } from 'joi';

export type SelectOption = {
    label: string;
    value: string;
}
export interface SelectProps extends BaseProps {
    value?: string | undefined;
    placeholder?: string;
    options: SelectOption[],
    isSearchable?: boolean,
    onChange?: (value: string) => void | Promise<void>
}

// 基于react-select封装 https://github.com/JedWatson/react-select/blob/master/README.md
export const Select: FC<SelectProps> = ({
    value,
    placeholder,
    options,
    isSearchable = false,
    onChange,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`select`]: 1,    
        [`${className}`]: !!className,
    });
    return (
        <ReactSelect
            classNamePrefix={'react-select'}
            className={cls}
            value={options.find(item => item.value === value)}
            placeholder={placeholder}
            options={options}
            isSearchable={isSearchable}
            onChange={(option: SelectOption)  => {
                onChange && onChange(option.value)
            }}
            {...restProps}
        />
    )
}
