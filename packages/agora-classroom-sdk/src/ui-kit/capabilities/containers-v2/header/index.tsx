import { useStore } from '@/infra/hooks/ui-store';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { EduClassroomConfig } from 'agora-edu-core';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { SvgIconEnum, SvgImg, useI18n } from '~components';
import './index.css';
export const Header = () => {
    const transI18n = useI18n();
    return (
        <div className='fcr-header-logo flex items-center'>
            {transI18n('StudyRoom')}<div className='fcr-header-divider' />{EduClassroomConfig.shared.sessionInfo.roomName}
        </div>
    );
}

export const ViewSwitch = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;
    const { viewMode, toggleViewMode } = streamUIStore;

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