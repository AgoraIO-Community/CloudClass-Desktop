import _ from 'lodash'
import { setUserInfo } from './userInfo';
let qaReadMsgs = {}
let nowTime
export const saveReadMsgID = (option) => {
    const { lastUserId, lastUserMsg } = option
    if (!option.lastUserMsg) return
    let obj = { [option.lastUserId]: lastUserMsg }
    if (qaReadMsgs[lastUserId] == lastUserMsg) return
    nowTime = new Date().getTime()
    qaReadMsgs = _.assign(qaReadMsgs, obj, { 'ts': nowTime })
    setUserInfo(qaReadMsgs);
}

export const setReadMsgId = (val) => {
    //  获取当前时间 
    nowTime = new Date().getTime()
    let lastTime = _.get(val, 'ts', 0);
    if (nowTime - lastTime > (12 * 60 * 60 * 1000)) return;
    qaReadMsgs = _.assign({}, val)
}

export const getQAReadMsg = () => qaReadMsgs
