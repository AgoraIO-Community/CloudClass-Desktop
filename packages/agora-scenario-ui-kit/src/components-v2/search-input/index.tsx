

import React, { ChangeEvent, useCallback } from 'react';
import classNames from 'classnames';
import { SvgIconEnum } from '~components/svg-img';
import './index.css';
import { IconButton } from '~components-v2/button';

type SearchInputProps = {
    placeholder: string;
    onChange?: (val: string) => void;
};

export const SearchInput = ({ placeholder, onChange }: SearchInputProps) => {
    const cls = classNames('fcr-search-input');

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    }, [onChange]);

    return (
        <div className={cls}>
            <input placeholder={placeholder} onChange={handleChange} />
            <IconButton icon={SvgIconEnum.FIND} iconColor={"#000"} iconSize={30} />
        </div>
    );
}
