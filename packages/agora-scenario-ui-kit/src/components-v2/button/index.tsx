import React from 'react';
import classNames from 'classnames';
import { SvgIconEnum, SvgImg } from '~components/svg-img';
import './index.css';

type ButtonProps = {
    text: string;
    disabled?: boolean;
    onClick?: () => void;
};

export const Button = ({ text, onClick, disabled }: ButtonProps) => {
    const cls = classNames('fcr-button', `cursor-${disabled ? 'not-allowed' : 'pointer'}`);
    return <div className={cls} onClick={onClick}>{text}</div>
}

type IconButtonProps = {
    icon: SvgIconEnum;
    iconColor?: string;
    backgroundColor?: string;
    opacity?: number;
    disabled?: boolean;
    onClick?: () => void;
};

export const IconButton = ({ onClick, icon, backgroundColor, iconColor, opacity, disabled }: IconButtonProps) => {
    const cls = classNames('fcr-icon-button', `cursor-${disabled ? 'not-allowed' : 'pointer'}`);

    return (
        <div className={cls} onClick={onClick} style={{ backgroundColor, opacity }}>
            <SvgImg type={icon} colors={{ iconPrimary: iconColor }} />
        </div>
    );
}