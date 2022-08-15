import classNames from "classnames"
import { ChangeEvent, FC, useRef, useState } from "react"
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { Select } from './select';
import './style.css';


export type CommonProps = {
    placeholder?: string,
    value: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onKeyDown?: () => void;
    onKeyUp?: () => void;
    options?: { text: string, value: string }[]
    readOnly?: boolean,
    error?: string
}

export type FieldProps = {
    label: string,
    type: 'text' | 'select',
    width?: number,
} & CommonProps


export const Field: FC<FieldProps> = ({ label, type, width, ...resetProps }) => {
    const clsn = classNames('form-field-wrap flex flex-col', {
        [type]: type ?? 'text'
    });
    const style = { width };

    return (
        <label className={clsn} style={style}>
            <span className="form-field-label mb-1">{label}</span>
            <div className="form-field flex items-start w-full">
                {type === "text" && <TextInput {...resetProps} />}
                {type === "select" && <Select {...resetProps} />}
            </div>
        </label>
    )
}


export const TextInput: FC<CommonProps> = ({ placeholder, value, onChange = () => { }, readOnly, error, onBlur, onKeyDown, onKeyUp }) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFocus = () => {
        setFocused(true);
    }

    const handleBlur = () => {
        setFocused(false);
        if (onBlur) {
            onBlur();
        }
    }

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        onChange('');

    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }

    const iconCls = classNames("absolute cursor-pointer", {
        'invisible': readOnly || !focused
    });


    const cls = classNames("relative w-full h-full", {
        error: !!error
    });

    return (
        <div className={cls}>
            <input ref={inputRef} readOnly={readOnly} className="w-full" placeholder={placeholder} style={{ padding: '14px 32px 14px 12px' }} onFocus={handleFocus} onBlur={handleBlur} value={value} onChange={handleChange} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
            <span className="error-text absolute block right-0">{error}</span>
            <SvgImg className={iconCls} type={SvgIconEnum.CLOSE} size={20} style={{ top: 14, right: 10 }} colors={{ iconPrimary: '#030303' }} onMouseDown={handleClear} />
        </div>
    );
}
