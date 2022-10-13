import { useStore } from "@/infra/hooks/ui-store";
import { EduStudyRoomUIStore } from "@/infra/stores/study-room";
import { EduClassroomConfig } from "agora-edu-core";
import classNames from "classnames";
import { observer } from "mobx-react";
import React, { useCallback, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { DeviceState, SvgIconEnum, SvgImg, useI18n } from "~components";
import { SearchInput } from "~components-v2"
import './index.css';

const nameColorPalette = [
    '#F5655C',
    '#6A79FF',
    '#377E22',
    '#75FB8D',
    '#FF8654',
    '#A5CC4F',
    '#FFC700',
    '#FF61B3',
    '#F9FF01',
    '#EA3323',
    '#FF9F83',
    '#458EF7',
    '#99CEFF',
    '#EC7065'
];

const getNameColor = (userName: string) => {
    const arr = [];
    for (let i = 0; i < userName.length; i++) {
        arr[i] = userName.charCodeAt(i).toString(16).slice(-4);
    }
    return nameColorPalette[parseInt(arr.join(""), 16) % nameColorPalette.length];
}


type ListItemActionsProps = {
    item: {
        uid: string;
        cameraState: DeviceState,
        microphoneState: DeviceState,
    };
    onMoreClick: (uid: string) => void;
}

export const ListItemActions = ({ item: { cameraState, microphoneState, uid }, onMoreClick }: ListItemActionsProps) => {
    const colorMute = '#F5655C';
    const colorUnmute = '#fff';

    const cameraColor = cameraState === DeviceState.enabled ? colorUnmute : colorMute;
    const cameraIcon = cameraState === DeviceState.enabled ? SvgIconEnum.CAMERA_FACE_SMILE : SvgIconEnum.CAMERA_FACE_CRY;
    const microphoneColor = microphoneState === DeviceState.enabled ? colorUnmute : colorMute;
    const microphoneIcon = microphoneState === DeviceState.enabled ? SvgIconEnum.MIC_ON : SvgIconEnum.MIC_OFF_1;

    const [hoverMore, setHoverMore] = useState(false);

    const handleMouseEnter = useCallback(() => {
        if (uid !== EduClassroomConfig.shared.sessionInfo.userUuid) {
            setHoverMore(true);
        }
    }, []);
    const handleMouseLeave = useCallback(() => {
        setHoverMore(false);
    }, []);

    const handleMoreClick = useCallback(() => {
        onMoreClick(uid);
    }, []);

    const cls = classNames("fcr-roster-v2__list-item-state-icon", {
        'fcr-roster-v2__hover-more': hoverMore
    });

    const transI18n = useI18n();

    return (
        <div className="fcr-roster-v2__list-item-action">
            <div className={cls} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <SvgImg className="fcr-roster-v2__list-item-state-icon" type={microphoneIcon} size={32} colors={{ iconPrimary: microphoneColor }} />
                <SvgImg className="fcr-roster-v2__list-item-state-icon" type={cameraIcon} size={32} style={{ marginRight: 8 }} colors={{ iconPrimary: cameraColor }} />
                <div className="fcr-roster-v2__list-item-more" onClick={handleMoreClick}>{transI18n('fcr_studyroom_roster_more')}</div>
            </div>
        </div>
    );
}


type ListItemProps = {
    item: {
        uid: string;
        name: string,
        cameraState: DeviceState,
        microphoneState: DeviceState,
    };
    onMoreClick: (uid: string) => void;
}

export const ListItem = ({ item, onMoreClick }: ListItemProps) => {
    const { name } = item;
    const color = getNameColor(name);
    const names = name.split(' ');
    const [firstWord] = names;
    const lastWord = names[names.length - 1];
    const firstLetter = firstWord.split('')[0];
    const secondLetter = names.length > 1 ?
        lastWord.split('')[0] :
        lastWord.length > 1 ?
            lastWord.split('')[1] : '';
    const isSelf = item.uid === EduClassroomConfig.shared.sessionInfo.userUuid;

    return (
        <div className="fcr-roster-v2__list-item">
            <div className="fcr-roster-v2__nameplate">
                <div className="fcr-roster-v2__shortname" style={{ background: color }}>
                    {`${firstLetter}${secondLetter}`.toUpperCase()}
                </div>
                <div className="fcr-roster-v2__fullname" style={{ color }}>{name}{isSelf && '(You)'}</div>
            </div>
            <ListItemActions item={item} onMoreClick={onMoreClick} />
        </div>
    );
};


export const UserList = observer(() => {
    const { rosterUIStore, layoutUIStore } = useStore() as EduStudyRoomUIStore;
    const { togglePinUser, toggleUserBlackList } = layoutUIStore;
    const { userList } = rosterUIStore;
    const [expanded, setExpanded] = useState('');

    const handleMoreClick = useCallback((uid: string) => {
        setExpanded((expanded) => {
            if (expanded === uid) {
                return '';
            }
            return uid;
        });
    }, []);


    const transI18n = useI18n();


    return (
        <ul className="fcr-roster-v2__list">
            {
                userList.map((item) => {

                    const pinText = item.pinned ? transI18n('fcr_studyroom_roster_actions_unpin') : transI18n('fcr_studyroom_roster_actions_pin');
                    const eyeText = item.eyeClosed ? transI18n('fcr_studyroom_roster_actions_unhide') : transI18n('fcr_studyroom_roster_actions_hide');
                    const pinIcon = item.pinned ? SvgIconEnum.UNPIN : SvgIconEnum.PIN;
                    const eyeIcon = item.eyeClosed ? SvgIconEnum.EYE_OPEN : SvgIconEnum.EYE_CLOSE;

                    const handlePinClick = () => {
                        togglePinUser(item.uid);
                        setExpanded('');
                    };

                    const handleEyeClick = () => {
                        toggleUserBlackList(item.uid);
                        setExpanded('');
                    };

                    return (
                        <div className="fcr-roster-v2__list-item-wrapper" key={item.uid}>
                            <ListItem key={item.uid} item={item} onMoreClick={handleMoreClick} />
                            {
                                item.uid === expanded && <div className="fcr-roster-v2__list-item-dropdown">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={handlePinClick}>{pinText} <SvgImg type={pinIcon} size={32} /></div>
                                    <div className="flex justify-between items-cetner cursor-pointer" onClick={handleEyeClick}>{eyeText} <SvgImg type={eyeIcon} size={32} /></div>
                                </div>
                            }
                        </div>
                    );
                })
            }
        </ul>
    );
});

export const Roster = observer(() => {
    const { rosterUIStore } = useStore() as EduStudyRoomUIStore;
    const handleChange = useCallback((val: string) => {
        rosterUIStore.setSearchKeyword(val);
    }, []);

    const transI18n = useI18n();

    return (
        <div className="fcr-roster-v2">
            <SearchInput placeholder={transI18n("fcr_studyroom_roster_search_placeholder")} onChange={handleChange} />
            <UserList />
        </div>
    );
});

export const StudyRosterWindow = observer(() => {
    const { layoutUIStore } = useStore() as EduStudyRoomUIStore;
    const y = (window.innerHeight - 80 - 530) / 2;
    const x = (window.innerWidth - 300) / 2 / 2;

    const style = useMemo(() => {
        return layoutUIStore.rosterVisibility ? {
            cursor: 'auto',

        } : { cursor: 'auto', display: 'none' };
    }, [layoutUIStore.rosterVisibility]);

    return (
        <Rnd default={{ x, y, width: 'auto', height: 'auto' }} enableResizing={false} style={style} className="z-50">
            <Roster />
        </Rnd>
    )
});
