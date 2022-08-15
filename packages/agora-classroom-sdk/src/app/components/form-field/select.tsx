import React, { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { CommonProps } from '.';
import { SvgIconEnum, SvgImg } from '~ui-kit';

type SelectProps = {

} & CommonProps

export const Select: FC<SelectProps> = ({ placeholder, value, onChange = () => { }, options = [], error, onBlur }) => {
    const [expanded, setExpanded] = useState(false);

    const selectedText = useMemo(() => {
        const selectedOption = options.find(({ value: v }) => value === v);
        return !selectedOption ? placeholder ?? '' : selectedOption.text;
    }, [value, options]);

    useEffect(() => {
        if (expanded) {
            const handler = () => {
                setExpanded(false);
            }
            document.addEventListener('mousedown', handler);
            return () => {
                document.removeEventListener('mousedown', handler);
            }
        }
    }, [expanded]);

    const handleBlur = () => {
        setExpanded(false);
        if (onBlur) {
            onBlur();
        }
    }

    const handleFocus = () => {
        setExpanded(true);
    }

    const optionsCls = classNames('options w-full', {
        hidden: !expanded
    });

    const textCls = classNames('inline-block w-full flex items-center justify-between', {
        'placeholder-text': !value,
    });

    const containerCls = classNames('absolute top-0 w-full select', {
        'expand': expanded,
        error: !!error
    });

    return (
        <div className='relative w-full'>
            <div className={containerCls}>
                <a className={textCls} style={{ padding: '14px 20px 14px 12px' }} href="#" onMouseDown={handleFocus} onFocus={handleFocus} onBlur={handleBlur}>
                    {selectedText}
                    <SvgImg type={SvgIconEnum.DOWN} colors={{ iconPrimary: '#030303' }} size={9} style={expanded ? { transform: 'rotate(180deg)', transition: 'all .2s' } : { transition: 'all .2s', transform: 'rotate(0deg)' }} />
                </a>
                <span className="error-text absolute block right-0">{error}</span>
                <div className={optionsCls}>
                    {
                        options.map(({ text, value: v }, index) => {
                            const cls = classNames('option cursor-pointer', {
                                selected: value === v
                            });
                            return (
                                <div key={index.toString()} className={cls} onMouseDown={() => {
                                    onChange(v)
                                }}>
                                    {text}
                                </div>
                            );
                        })
                    }
                </div>
            </div >
        </div>
    )
}