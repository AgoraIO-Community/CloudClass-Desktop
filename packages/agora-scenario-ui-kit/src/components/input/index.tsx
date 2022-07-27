import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/util/type';
import './index.css';

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
  min?: number;
  max?: number;
  width?: number;
  maxLength?: string | number;
  maxNumber?: number; // 配合type=number使用，最大值限制
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const Input: FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  prefix,
  suffix,
  disabled = false,
  value = '',
  inputPrefixWidth = 75,
  rule,
  errorMsg,
  errorMsgPositionLeft = 0,
  maxLength = 'infinite', // 调研后，数字字符串生效，非法字符串则无限制
  maxNumber = 0,
  width,
  onFocus = () => { },
  onBlur = () => { },
  onChange = () => { },
  className,
  ...restProps
}) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [showErrMsg, setShowErrMsg] = useState<boolean>(false);
  function _onFocus(e: any) {
    setFocused(true);
    onFocus && onFocus(e);
  }
  function _onBlur(e: any) {
    setFocused(false);
    onBlur && onBlur(e);
  }
  function _onChange(e: any) {
    if (rule) {
      if (e.target.value) {
        if (rule.test(e.target.value)) {
          setShowErrMsg(false);
        } else {
          setShowErrMsg(true);
        }
      } else {
        setShowErrMsg(false);
      }
    }
    if (type === 'number' && maxNumber) {
      if (Number(e.target.value) <= maxNumber) {
        setShowErrMsg(false);
      } else {
        setShowErrMsg(true);
      }
    }
    onChange && onChange(e);
  }
  const cls = classnames({
    [`fcr-input`]: 1,
    [`${className}`]: !!className,
  });
  const classNamesRule = {
    [`fcr-input-wrapper`]: 1,
    ['fcr-input-wrapper-focused']: focused,
    ['fcr-input-wrapper-disabled']: disabled,
    ['fcr-input-search-wrapper']: cls.includes('input-search'),
    ['fcr-input-wrapper-error']: showErrMsg,
  };
  return (
    <div style={{ position: 'relative', width: width ? width : '100%', height: '100%' }}>
      <span className={classnames(classNamesRule)}>
        {prefix ? (
          <span className="fcr-input-prefix" style={{ width: inputPrefixWidth }}>
            {prefix}
          </span>
        ) : (
          ''
        )}
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
        {suffix ? <span className="fcr-input-suffix">{suffix}</span> : ''}
      </span>
      {showErrMsg && errorMsg ? (
        <div
          className="fcr-input-error-msg"
          style={{
            transform: `translateX(${errorMsgPositionLeft}px)`,
          }}>
          {errorMsg}
        </div>
      ) : null}
    </div>
  );
};

export interface SearchProps extends InputProps {
  onSearch: (value: string) => void | Promise<void>;
  suffix?: any;
  prefix?: any;
}

export const Search: FC<SearchProps> = ({ onSearch, className, suffix, prefix, ...restProps }) => {
  const [searchStr, setSearchStr] = useState<string>('');
  const cls = classnames({
    [`input-search`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <Input
      className={cls}
      {...restProps}
      value={searchStr}
      onChange={(e) => {
        setSearchStr(e.target.value);
        onSearch(e.target.value);
      }}
      prefix={prefix}
      suffix={suffix}
    />
  );
};
