import React from 'react'
import { useSelector } from 'react-redux'
import { SET_ALL_MUTE_MSG, REMOVE_ALL_MUTE_MSG } from '../../contants'
import icon_cautions from '../../themes/img/icon-cautions.png'

import './index.css'
export const CmdMsg = ({ item }) => {
    const state = useSelector(state => state)
    const roomUsersInfo = state?.room.roomUsersInfo
    const isSetMuteMsg = item?.action === "setAllMute"
    const isRemoveMuteMsg = item?.action === "removeAllMute"
    const idDeleteMsg = item?.action === "DEL"
    return (
        <div className="mute-msg">
            <img src={icon_cautions} />
            {isSetMuteMsg && <div>
                <span>{SET_ALL_MUTE_MSG}</span>
            </div>}
            {isRemoveMuteMsg && <div>
                <span>{REMOVE_ALL_MUTE_MSG}</span>
            </div>}
            {idDeleteMsg && <div>
                {Object.keys(roomUsersInfo).length > 0 && roomUsersInfo[item.from].nickname} 删除了一条消息
            </div>}
        </div>
    )
}