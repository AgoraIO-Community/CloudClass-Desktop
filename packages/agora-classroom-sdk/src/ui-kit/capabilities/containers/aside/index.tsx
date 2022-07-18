import { useLectureUIStores } from "@/infra/hooks/ui-store";
import { EduLectureUIStore } from "@/infra/stores/lecture";
import { observer } from "mobx-react";
import { FC } from "react";
import { Aside } from "~ui-kit";

export const BigClassAside: FC = observer(({ children }) => {
    const { streamUIStore } = useLectureUIStores() as EduLectureUIStore;

    return (
        <Aside style={{ width: streamUIStore.teacherVideoStreamSize.width }}>
            {children}
        </Aside>);
});