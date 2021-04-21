import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Button } from '~components/button'
import './index.css';

export interface InputProps extends BaseProps {
    type?: string;
    placeholder?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
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
    suffix,
    disabled = false,
    value = "",
    onFocus = () => {},
    onBlur = () => {},
    onChange = () => {},
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
        <span className={classnames({[`input-wrapper`]: 1, ['input-wrapper-focused']: focused, ['input-search-wrapper']: cls.includes('input-search')})}>
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
            {suffix ? (
                <span className="input-suffix">
                    {suffix}
                </span>
            ) : ""}
        </span>
    )
}

export interface SearchProps extends InputProps {
    onSearch: (value: string) => void | Promise<void>
}

export const Search: FC<SearchProps> = ({
    onSearch,
    className,
    ...restProps
}) => {
    const [searchStr, setSearchStr] = useState<string>('')
    const cls = classnames({
        [`input-search`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <Input
            className={cls}
            {...restProps}
            value={searchStr}
            onChange={e => {
                setSearchStr(e.target.value)
            }}
            suffix={<Button onClick={e => {
                onSearch(searchStr)
            }}>Search</Button>}
        />
    )
}