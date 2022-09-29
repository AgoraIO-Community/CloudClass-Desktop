import { useStore } from '@/infra/hooks/ui-store';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { SvgIconEnum, SvgImg } from '~components';

import { useTranslation } from 'react-i18next';
import './index.css';
import logoCN from './assets/st-logo-cn.svg';
import logoEN from './assets/st-logo-en.svg';

export const Header = () => {
    const { i18n } = useTranslation();

    const logo = i18n.language === 'en' ? logoEN : logoCN;

    return (
        <div className='fcr-header-logo flex items-center'>
            <img src={logo} />
            <div className='fcr-header-divider' />
            <span className='ml-4'>
                {EduClassroomConfig.shared.sessionInfo.roomName}
            </span>
        </div>
    );
}

export const ViewSwitch = observer(() => {
    const { streamUIStore, shareUIStore } = useStore() as EduStudyRoomUIStore;
    const { toggleViewMode } = streamUIStore;
    const { viewMode } = shareUIStore;

    const indicatorCls = classNames('fcr-view-switch__indicator absolute', {
        'fcr-view-switch__indicator--on': viewMode === 'surrounded'
    });

    return (
        <div className='fcr-view-switch inline-flex relative cursor-pointer' onClick={toggleViewMode} >
            <SvgImg size={22} type={SvgIconEnum.GRID_2} style={{ margin: '8px 12px', zIndex: 2 }} colors={{ iconPrimary: '#D9D9D9' }} />
            <SvgImg size={22} type={SvgIconEnum.GRID_1} style={{ margin: '8px 12px', zIndex: 2 }} colors={{ iconPrimary: '#D9D9D9' }} />
            <div className={indicatorCls} />
        </div>
    );
});