import React, { FC, useMemo, useState } from 'react';
import './index.css';
import classNames from 'classnames';
import { SvgIconEnum, SvgImg } from '~components';



type Props = {
    options: { label: string, value: string }[];
    value: string;
    onChange: (value: string) => void;
    headSlot?: React.ReactNode;
    minWidth?: number
};

export const Dropdown: FC<Props> = ({ value, onChange, options, headSlot, minWidth }) => {
    const [expanded, setExpanded] = useState(false);

    const selectedText = useMemo(() => {
        const selectedOption = options.find(({ value: v }) => value === v);
        return !selectedOption ? '' : selectedOption.label;
    }, [value, options]);

    const handleBlur = () => {
        setExpanded(false);
    }

    const handleFocus = () => {
        setExpanded(true);
    }

    const containerCls = classNames('absolute top-0 w-full fcr-dropdown-list', {
        hidden: !expanded,
        'bg-white': expanded,
        'text-black': expanded
    });

    const textCls = classNames('fcr-dropdown-btn__text cursor-pointer inline-block text-center', {
        "fcr-dropdown-btn__text--expand": expanded,
    });

    const preventClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
    }
    return (
        <div className='fcr-dropdown relative' style={{ minWidth }}>
            <div className='fcr-dropdown-btn flex items-center justify-between'>
                {headSlot}
                <a onClick={preventClick} href="#" onFocus={handleFocus} onBlur={handleBlur}>
                    <span className={textCls}>{selectedText}</span>
                </a>
                <SvgImg type={SvgIconEnum.DOWN} colors={{ iconPrimary: '#030303' }} size={9} style={expanded ? { transform: 'rotate(180deg)', transition: 'all .2s' } : { transition: 'all .2s', transform: 'rotate(0deg)' }} />
            </div>
            <div className={containerCls} style={{ top: 30 }}>
                {
                    options.map(({ label, value: v }, index) => {
                        const cls = classNames("fcr-dropdown-item text-center cursor-pointer", {
                            selected: v === value
                        })
                        return (
                            <div key={index.toString()} className={cls} onMouseDown={() => {
                                onChange(v);
                            }}>
                                {label}
                            </div>
                        );
                    })
                }
            </div>

        </div>
    )
}