import { useStore } from "@/infra/hooks/ui-store";
import { EduStreamUI } from "@/infra/stores/common/stream/struct";
import { EduStreamTool, EduStreamToolCategory } from "@/infra/stores/common/stream/tool";
import { FcrUIConfig } from "@/infra/types/config";
import { EduRoleTypeEnum } from "agora-edu-core";
import { observer } from "mobx-react";
import { FC } from "react";
import { Popover, SvgIcon, SvgImg, Tooltip } from "~ui-kit";
import { visibilityListItemControl } from "../visibility";
import { studentBoardAuthEnabled, studentCameraToolEnabled, studentMicrophoneToolEnabled, studentOffStageEnabled, studentRewardEnabled, studentStreamToolsPanelEnabled, teacherOffStageEnabled, teacherResetPosEnabled, teacherStreamToolsPanelEnabled } from "../visibility/controlled";

export const StreamPlayerToolbar: FC<
    {
        visible: boolean
        stream: EduStreamUI,
        offset?: number[],
        placement?: 'left' | 'bottom'
    }> = visibilityListItemControl(({ stream, offset, placement, visible }) => {
        const { streamUIStore } = useStore();
        const { toolbarPlacement, toolbarOffset } = streamUIStore;

        return (
            <Popover
                visible={visible}
                align={{
                    offset: offset ?? toolbarOffset,
                }}
                overlayClassName="video-player-tools-popover"
                content={
                    stream.stream.isLocal ? (
                        <LocalStreamPlayerTools />
                    ) : (
                        <RemoteStreamPlayerTools stream={stream} />
                    )
                }
                placement={placement ?? toolbarPlacement}>
                <div className="stream-player-toolbar-placement w-full h-full absolute top-0 left-0" />
            </Popover>
        );
    }, (uiConfig, { stream }) => {
        if (stream.role === EduRoleTypeEnum.teacher && !teacherStreamToolsPanelEnabled(uiConfig)) {
            return false;
        }
        if (stream.role === EduRoleTypeEnum.student && !studentStreamToolsPanelEnabled(uiConfig)) {
            return false;
        }
        return true;
    });


export const LocalStreamPlayerTools = observer(
    () => {
        const { streamUIStore } = useStore();
        const { localStreamTools } = streamUIStore;

        return (
            localStreamTools.length ?
                (
                    <div className={`video-player-tools`}>
                        {
                            localStreamTools.map((tool, idx) => (
                                <ToolItem tool={tool} key={`${idx}`} />
                            ))
                        }
                    </div>
                ) : <div />
        );
    },
);

export const RemoteStreamPlayerTools = observer(
    ({ stream }: { stream: EduStreamUI }) => {
        const { streamUIStore } = useStore();
        const { remoteStreamTools } = streamUIStore;
        const toolList = remoteStreamTools(stream);

        return toolList.length ? (
            <div className={`video-player-tools`}>
                {toolList.map((tool, idx) => (
                    <ToolItem tool={tool} key={`${idx}`} />
                ))}
            </div>
        ) : <div />
    },
);


const ToolItem: FC<{
    tool: EduStreamTool
}> = visibilityListItemControl(observer(({ tool }) => {
    const { streamUIStore } = useStore();
    const { toolbarPlacement } = streamUIStore;
    return (
        <Tooltip
            title={tool.toolTip}
            placement={toolbarPlacement} >
            <span>
                {tool.interactable ?
                    <SvgIcon
                        size={22}
                        onClick={tool.onClick}
                        type={tool.iconType.icon}
                        colors={{ iconPrimary: tool.iconType.color }}
                        hoverType={tool.hoverIconType?.icon ?? tool.iconType.icon}
                        hoverColors={{ iconPrimary: tool.hoverIconType?.color ?? tool.iconType.color }}
                    /> :
                    <SvgImg
                        colors={{ iconPrimary: tool.iconType.color }}
                        type={tool.iconType.icon}
                        size={22}
                    />
                }
            </span>
        </Tooltip>
    );
}
), (uiConfig: FcrUIConfig, { tool }) => {
    if (!teacherOffStageEnabled(uiConfig) && tool.category === EduStreamToolCategory.podium_all) {
        return false;
    }
    if (!teacherResetPosEnabled(uiConfig) && tool.category === EduStreamToolCategory.stream_window_off) {
        return false;
    }
    if (!studentCameraToolEnabled(uiConfig) && tool.category === EduStreamToolCategory.camera) {
        return false;
    }
    if (!studentMicrophoneToolEnabled(uiConfig) && tool.category === EduStreamToolCategory.microphone) {
        return false;
    }
    if (!studentBoardAuthEnabled(uiConfig) && tool.category === EduStreamToolCategory.whiteboard) {
        return false;
    }
    if (!studentOffStageEnabled(uiConfig) && tool.category === EduStreamToolCategory.podium) {
        return false;
    }
    if (!studentRewardEnabled(uiConfig) && tool.category === EduStreamToolCategory.star) {
        return false;
    }

    return true;
});

