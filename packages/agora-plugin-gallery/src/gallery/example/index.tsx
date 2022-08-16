import {
    AgoraWidgetBase,
} from 'agora-classroom-sdk';

export class ExampleWidget extends AgoraWidgetBase {
    private _dom?: HTMLElement;
    /**
     * 全局唯一的Widget名称
     */
    get widgetName(): string {
        return 'example'
    }

    /**
     * 控制Widget是否可控
     */
    get hasPrivilege(): boolean {
        return false;
    }

    /**
     * 挂载点，重写此方法返回一个节点则此Widget将渲染在此节点内部
     * 我们将此插件挂载至白板区域
     * 
     * @returns 
     */
    locate(): HTMLElement | null | undefined {
        return document.querySelector(".widget-slot-board") as HTMLElement;
    }

    /**
     * Widget节点已挂载，此时可以在DOM节点进行自定义渲染
     * @param dom 
     */
    render(dom: HTMLElement): void {
        dom.innerHTML = 'This is a custom widget';
        dom.style.height = '100%';
        dom.style.display = "flex";
        dom.style.alignItems = "center";
        dom.style.justifyContent = "center";
        this._dom = dom;
    }

    /**
     * 组件卸载，此时可以把相关资源释放掉
     */
    unload(): void {
        this._dom = undefined;
    }
}