import { render, unmountComponentAtNode } from 'react-dom';
import { App } from './app';
import { AgoraEduToolWidget } from '../../common/edu-tool-widget';
import { observable, action, computed } from 'mobx';
import { AgoraWidgetController, EduRoleTypeEnum } from 'agora-edu-core';
import { AgoraExtensionWidgetEvent } from '@/infra/api';
import { SvgIconEnum } from '~ui-kit';
import { bound } from 'agora-rte-sdk';
/**
 * 点名册：
 * 老师可通过此插件知晓教室内学生参与情况
 */
export class RollbookWidget extends AgoraEduToolWidget {
    private _dom?: HTMLElement;
    @observable
    started: boolean = false;
    @observable
    checkInList: string[] = [];
    /**
     * 是否已签到
     */
    @computed
    get isCheckedIn() {
        const { userUuid } = this.classroomConfig.sessionInfo;
        return this.checkInList.includes(userUuid);
    }
    /**
     * 签到用户名列表
     */
    @computed
    get checkInUserNames() {
        return this.checkInList.map((userUuid) => {
            // 从UserStore中取出对应用户ID的用户名(此方法不适用于大班课班型)
            const user = this.classroomStore.userStore.studentList.get(userUuid);
            return user?.userName || 'Unknown';
        });
    }
    /**
     * 窗口初始宽度
     */
    get minWidth(): number {
        return 400;
    }
    /**
     * 窗口初始高度
     */
    get minHeight(): number {
        return 200;
    }

    /**
     * 全局唯一的Widget名称
     */
    get widgetName(): string {
        return 'rollbook'
    }

    /**
     * 控制Widget是否可控
     */
    get hasPrivilege(): boolean {
        return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.classroomConfig.sessionInfo.role);
    }

    get checkInPropKey() {
        const { userUuid } = this.classroomConfig.sessionInfo;
        const key = `checkIn-${userUuid}`;
        return key;
    }

    /**
     * Widget节点已挂载，此时可以在DOM节点进行自定义渲染
     * @param dom 
     */
    render(dom: HTMLElement): void {
        this._dom = dom;
        dom.style.width = '100%';
        dom.style.height = '100%';
        // 使用 React 渲染UI组件
        render(<App widget={this} />, dom);
    }

    /**
     * 组件卸载，此时可以把相关资源释放掉
     */
    unload(): void {
        if (this._dom) {
            // 卸载 React 组件
            unmountComponentAtNode(this._dom);
        }
        this._dom = undefined;
    }

    onCreate(properties: any, userProperties: any): void {
        this._handlePropertiesChange(properties);
    }

    onPropertiesUpdate(properties: any): void {
        this._handlePropertiesChange(properties);
    }

    onInstall(controller: AgoraWidgetController) {
        // 将插件入口注册到工具箱
        controller.broadcast(AgoraExtensionWidgetEvent.RegisterCabinetTool, {
            id: this.widgetName,
            name: "Rollbook",
            iconType: SvgIconEnum.ANSWER,
        });
    }

    onUninstall(controller: AgoraWidgetController) {
        // 将插件入口从工具箱移除
        controller.broadcast(AgoraExtensionWidgetEvent.UnregisterCabinetTool, this.widgetName);
    }


    @action
    private _handlePropertiesChange(properties: any) {
        const list: string[] = [];
        Object.keys(properties.extra || {}).forEach((k) => {
            if (k.startsWith('checkIn-')) {
                const userUuid = k.replace('checkIn-', '');
                list.push(userUuid);
            }
        });
        this.checkInList = list;
        this.started = !!properties.extra?.started
    }

    /**
     * 学生点击签到，更新签到列表
     */
    @bound
    checkIn() {
        this.updateWidgetProperties({
            extra: {
                // 使用Key-Value方式可以以增量方式更新Widget
                [this.checkInPropKey]: true
            }
        });
    }

    /**
     * 老师点击开始签到，更新Widget状态
     */
    @bound
    startCheckIn() {
        this.setActive({ extra: { started: 1 } });
    }
}