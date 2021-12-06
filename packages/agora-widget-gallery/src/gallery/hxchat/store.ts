import { action, observable } from 'mobx';
import type { AgoraWidgetContext } from 'agora-edu-core';

export class PluginStore {
  context: AgoraWidgetContext;
  props: any;

  @observable
  globalContext: any = {};

  @observable
  chatContext: any = {};

  constructor(ctx: AgoraWidgetContext, props: any) {
    this.context = ctx;
    this.props = props;
  }

  @action
  onReceivedProps(properties: any, cause: any) {}
}
