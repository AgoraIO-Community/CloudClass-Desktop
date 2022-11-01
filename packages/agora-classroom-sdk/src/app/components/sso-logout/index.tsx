import { FC } from "react"

type Props = {
    onLoad?: () => void;
}

export const SSOLogout: FC<Props> = ({ onLoad }) => {
    const url = `https://sso2.agora.io/api/v0/logout?redirect_uri=${window.location.origin}`;

    return (
        <div className="fixed z-50 inset-0">
            <iframe className="w-full h-full" src={url} onLoad={onLoad} />
        </div>
    );
}