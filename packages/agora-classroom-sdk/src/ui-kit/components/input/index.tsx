import React, { FC, ReactNode, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Button } from '~components/button'
import './index.css';
import { transI18n } from '../i18n';
import { ReactElement } from 'react';

export interface InputProps extends BaseProps {
    type?: string;
    placeholder?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
    value?: any;
    inputPrefixWidth?: number;
    rule?: RegExp;
    errorMsg?: string;
    errorMsgPositionLeft?: number;
    maxLength?: string | number;
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
    inputPrefixWidth = 75,
    rule,
    errorMsg,
    errorMsgPositionLeft = 0,
    maxLength = 'infinite', // 调研后，数字字符串生效，非法字符串则无限制
    onFocus = () => {},
    onBlur = () => {},
    onChange = () => {},
    className,
    ...restProps
}) => {
    const [focused, setFocused] = useState<boolean>(false)
    const [showErrMsg, setShowErrMsg] = useState<boolean>(false)
    function _onFocus (e: any) {
        setFocused(true)
        onFocus && onFocus(e)
    }
    function _onBlur (e: any) {
        setFocused(false)
        onBlur && onBlur(e)
    }
    function _onChange (e: any) {
        if (rule) {
            if (e.target.value) {
                if (rule.test(e.target.value)) {
                    setShowErrMsg(false)
                } else {
                    setShowErrMsg(true)
                }
            } else {
                setShowErrMsg(false)
            }
        }
        onChange && onChange(e)
    }
    const cls = classnames({
        [`input`]: 1,
        [`${className}`]: !!className,
    });
    const classNamesRule = {
        [`input-wrapper`]: 1, 
        ['input-wrapper-focused']: focused, 
        ['input-wrapper-disabled']: disabled,
        ['input-search-wrapper']: cls.includes('input-search'),
        ['input-wrapper-error']: showErrMsg
    }
    return (
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <span className={classnames(classNamesRule)}>
                {prefix ? (<span className="input-prefix" style={{width: inputPrefixWidth}}>
                    {prefix}
                </span>) : ""}
                <input
                    type={type} 
                    className={cls} 
                    placeholder={placeholder}
                    disabled={disabled}
                    value={value}
                    maxLength={maxLength as any}
                    onFocus={_onFocus}
                    onBlur={_onBlur}
                    onChange={_onChange}
                    {...restProps}
                />
                {suffix ? (
                    <span className="input-suffix">
                        {suffix}
                    </span>
                ) : ""}
            </span>
            {(showErrMsg && errorMsg) ? (
                <div className='input-error-msg' style={{
                    left: errorMsgPositionLeft
                }}>
                    {errorMsg}
                </div>
            ) : null}
        </div>
    )
}

export interface SearchProps extends InputProps {
    onSearch: (value: string) => void | Promise<void>;
    suffix?: any
    prefix?: any
}

export const Search: FC<SearchProps> = ({
    onSearch,
    className,
    suffix,
    prefix,
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
                onSearch(e.target.value)
            }}
            prefix={prefix}
            suffix={suffix
            }
        />
    )
}