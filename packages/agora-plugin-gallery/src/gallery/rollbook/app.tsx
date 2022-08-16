import React, { FC } from "react";
import { observer } from 'mobx-react';
import { ControlledModal } from "../../common/edu-tool-modal";
import { EduRoleTypeEnum } from "agora-edu-core";
import { RollbookWidget } from ".";
import { Button } from "~ui-kit";


/**
 * 点名册组件 
 * @param param0 
 * @returns 
 */
export const App: FC<{ widget: RollbookWidget }> = ({ widget }) => {
    const view = () => [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(widget.classroomConfig.sessionInfo.role) ? <TeacherView widget={widget} /> : <StudentView widget={widget} />
    return (
        <ControlledModal
            widget={widget}
            title="Rollbook"
            onCancel={widget.handleClose}
        >
            {view()}
        </ControlledModal>
    );
}

/**
 * 老师界面显示实际签到列表
 */
export const TeacherView: FC<{ widget: RollbookWidget }> = observer(({ widget }) => {
    const started = widget.started;
    return (
        <div>
            {started
                ?
                <React.Fragment>
                    <div>Check-In List:</div>
                    <ul>
                        {
                            widget.checkInUserNames.map((item, i) =>
                            (
                                <li key={i.toString()}>{item}</li>
                            ))
                        }
                    </ul>
                </React.Fragment>
                :
                <Button className="px-1" onClick={widget.startCheckIn}>Start Check-In</Button>
            }
        </div>
    );
});

/**
 * 学生显示签到按钮
 */
export const StudentView: FC<{ widget: RollbookWidget }> = observer(({ widget }) => {
    const isCheckedIn = widget.isCheckedIn;
    return (
        <div>
            <Button onClick={widget.checkIn} disabled={isCheckedIn}>{isCheckedIn ? 'Checked-In' : 'Check-In'}</Button>
        </div>
    );
});