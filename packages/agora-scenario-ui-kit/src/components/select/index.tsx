import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import RcSelect, { Option } from 'rc-select';
import { Icon } from '~components/icon'

import './index.css'

export interface SelectProps extends BaseProps {
    defaultValue?: string;
    value?: string | number;
    placeholder?: string;
    listHeight?: number;
    size?: 'large' | 'middle' | 'small';
    onChange?: (value: string | number) => void;
}

export const Select: FC<SelectProps> = ({
    defaultValue,
    value,
    placeholder,
    listHeight,
    size = 'middle',
    onChange = value => { console.log('change', value) },
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`select select-${size}`]: 1,    
        [`${className}`]: !!className,
    });
    return (
        <div className={`select-wrap select-${size}`}>
            <RcSelect
                className={cls}
                dropdownClassName={'select-dropdown'}
                defaultValue={defaultValue}
                value={value}
                placeholder={placeholder}
                listHeight={listHeight}
                onChange={onChange}
                {...restProps}
            />
            <Icon type="forward" color="red" size={16} className={'select-arrow-icon'}/>
        </div>
    )
}

Select.Option = Option