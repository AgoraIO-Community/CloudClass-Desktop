import { UserApi } from "@/app/api";
import { SSOLogout } from "@/app/components/sso-logout"
import { RoomStoreContext, UserStoreContext } from "@/app/stores";
import { token } from "@/app/utils";
import { useCallback, useContext } from "react"
import { useHistory } from "react-router";

export const Logout = () => {
    const { setLogin, clearUserInfo } = useContext(UserStoreContext);
    const { clearRooms } = useContext(RoomStoreContext);
    const history = useHistory();
    const handleLoad = useCallback(() => {
        history.replace('/');
        UserApi.shared.logoutAccount().then(() => {
            token.clear();
            clearRooms();
            clearUserInfo();
            setLogin(false);

        });

    }, []);

    return <SSOLogout onLoad={handleLoad} />
}

