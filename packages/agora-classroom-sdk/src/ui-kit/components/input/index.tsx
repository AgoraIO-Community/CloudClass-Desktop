import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface InputProps extends BaseProps {
    type?: string;
    placeholder?: string;
    prefix?: React.ReactNode;
    disabled?: boolean;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const Input: FC<InputProps> = ({
    type = "text",
    placeholder = "",
    prefix,
    disabled = false,
    value = "",
    onFocus = () => {console.log('focus')},
    onBlur = () => {console.log('blur')},
    onChange = () => {console.log('change')},
    className,
    ...restProps
}) => {
    const [focused, setFocused] = useState<boolean>(false)
    function _onFocus (e: any) {
        setFocused(true)
        onFocus && onFocus(e)
    }
    function _onBlur (e: any) {
        setFocused(false)
        onBlur && onBlur(e)
    }
    const cls = classnames({
        [`input`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <span className={classnames({[`input-wrapper`]: 1, ['input-wrapper-focused']: focused})}>
            {prefix ? (<span className="input-prefix">
                {prefix}
            </span>) : ""}
            <input 
                className={cls} 
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onFocus={_onFocus}
                onBlur={_onBlur}
                onChange={onChange}
                {...restProps}
            />
        </span>
    )
}