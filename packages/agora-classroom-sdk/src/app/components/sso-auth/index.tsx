import { UserApi } from "@/app/api";
import { getRegion } from "@/app/stores/global";
import { indexUrl, token } from "@/app/utils"
import { AgoraRegion } from "agora-rte-sdk";
import { FC, useEffect, useState } from "react"
import { useLocation } from "react-router";

type Props = {
    onComplete: () => void;
}

export const SSOAuth: FC<Props> = ({ onComplete }) => {
    const [url, setURL] = useState('');
    const { pathname, search } = useLocation();

    const from = `${pathname}${search}`;
    const redirectUrl = pathname === '/' ? indexUrl : `${indexUrl}?from=${from}`;
    // 
    useEffect(() => {
        let mounted = true;
        UserApi.shared.getAuthorizedURL({
            redirectUrl,
            toRegion: getRegion() === AgoraRegion.CN ? 'cn' : 'en',
        }).then((redirectURL) => {
            if (mounted) {
                setURL(redirectURL);
            }
        });
        return () => {
            mounted = false;
        }
    }, [redirectUrl]);
    // 
    useEffect(() => {
        let mounted = true;
        token.clear();
        const interval = setInterval(() => {
            if (mounted) {
                // check whether the token is ready
                if (token.accessToken) {
                    clearInterval(interval);
                    onComplete();
                }
            }
        }, 1000);
        return () => {
            clearInterval(interval);
            mounted = false;
        }
    }, []);

    return (
        <div className="fixed z-50 inset-0">
            <iframe className="w-full h-full" src={url} />
        </div>
    );
}