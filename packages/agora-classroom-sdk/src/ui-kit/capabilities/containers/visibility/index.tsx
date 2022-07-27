import { useUIConfig } from "@/infra/hooks/ui-config";
import { FcrUIConfig } from "@/infra/types/config";
import { FC, useEffect } from "react";

type ConditionCheck = (uiConfig: FcrUIConfig) => boolean;

type ListItemConditionCheck<E> = (uiConfig: FcrUIConfig, props: E) => boolean;

export const PreventRender: FC<{ com: FC<any> }> = ({ com }) => {
    // test purpose
    useEffect(() => {
        console.log(`Prevent rendering component ${com.displayName}`);
    }, []);
    return null;
}

export const visibilityControl = <T extends unknown>(Com: FC<T>, check: ConditionCheck): FC<T> => {
    const hoc: FC<T> = (props) => {
        const uiConfig = useUIConfig();
        const visible = check(uiConfig);
        return visible ? <Com  {...props} /> : <PreventRender com={Com} />;
    }

    return hoc;
}

export const visibilityListItemControl = <T extends unknown>(Com: FC<T>, check: ListItemConditionCheck<T>): FC<T> => {
    const hoc: FC<T> = (props) => {
        const uiConfig = useUIConfig();
        const visible = check(uiConfig, props);
        return visible ? <Com  {...props} /> : <PreventRender com={Com} />;
    }

    return hoc;
}