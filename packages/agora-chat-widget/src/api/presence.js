import WebIM from '../utils/WebIM';
import { userStatusAction } from '../redux/actions/presenceAction';
export class PresenceAPI {
    store = null;
    constructor(store) {
        this.store = store;
    }
    subscribePresence = (names) => {
        if (!names.length) return
        let option = {
            usernames: names,
            expiry: 24 * 3600 // 单位为秒
        }
        WebIM.conn.subscribePresence(option).then(res => {
            const { result } = res;
            const presenceAry = [];
            if (result.length) {
                result.forEach(item => {
                    if (Object.keys(item.status).length) {
                        presenceAry.push(item.uid)
                    }
                });
                this.store.dispatch(userStatusAction(presenceAry))
            }
        })
    }
}
