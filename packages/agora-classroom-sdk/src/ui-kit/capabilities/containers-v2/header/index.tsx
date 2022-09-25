import classNames from 'classnames';
import { useState } from 'react';
import { SvgIconEnum, SvgImg, useI18n } from '~components';
import './index.css';
export const Header = () => {
    const transI18n = useI18n();
    return <div className='fcr-pretest-logo'>{transI18n('StudyRoom')}|{transI18n("Tracy’s study room")}</div>;
}

export const ViewSwitch = () => {
    const [on, setOn] = useState(false);

    const indicatorCls = classNames('fcr-view-switch__indicator absolute', {
        'fcr-view-switch__indicator--on': on
    });

    const handleClick = () => {
        setOn(v => !v);
    }

    return (
        <div className='fcr-view-switch inline-flex relative cursor-pointer' onClick={handleClick} >
            <SvgImg size={22} type={SvgIconEnum.GRID_2} style={{ margin: '8px 12px', zIndex: 2 }} />
            <SvgImg size={22} type={SvgIconEnum.GRID_1} style={{ margin: '8px 12px', zIndex: 2 }} />
            <div className={indicatorCls} />
        </div>
    );
}