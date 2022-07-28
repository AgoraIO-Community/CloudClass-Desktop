import classNames from "classnames";
import { FC, useMemo, useState } from "react"
import './style.css';

type DropdownProps = {
    options: { text: string, value: string }[];
    value: string;
    onChange: (value: string) => void;
    width?: number
};

export const Dropdown: FC<DropdownProps> = ({ value, onChange, options, width }) => {
    const [expanded, setExpanded] = useState(false);

    const selectedText = useMemo(() => {
        const selectedOption = options.find(({ value: v }) => value === v);
        return !selectedOption ? '' : selectedOption.text;
    }, [value, options]);

    const handleBlur = () => {
        setExpanded(false);
    }

    const handleFocus = () => {
        setExpanded(true);
    }

    const containerCls = classNames('absolute top-0 w-full dropdown-list', {
        hidden: !expanded,
        'bg-white': expanded,
        'text-black': expanded
    })

    const textCls = classNames('dropdown-text hover:bg-white hover:text-black cursor-pointer inline-block text-center', {
        "expand": expanded,
    });

    return (
        <div className='relative' >
            <a href="#" onFocus={handleFocus} onBlur={handleBlur}>
                <span className={textCls} style={{ minWidth: width }}>{selectedText}</span>
            </a>
            <div className={containerCls} style={{ top: 30 }}>
                {
                    options.map(({ text, value: v }, index) => {
                        const cls = classNames("text-center cursor-pointer dropdown-item", {
                            selected: v === value
                        })
                        return (
                            <div key={index.toString()} className={cls} onMouseDown={() => {
                                onChange(v);
                            }}>
                                {text}
                            </div>
                        );
                    })
                }
            </div >
        </div >
    )
}