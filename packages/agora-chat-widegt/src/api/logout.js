
import WebIM from "../utils/WebIM";

// 退出
export const logoutIM = () => {
    WebIM.conn.close();
};
