import {
  EduLogger,
  PeerInviteEnum,
  UserRenderer,
  EduAudioSourceType,
  EduTextMessage,
  EduSceneType,
  EduRoleTypeEnum,
  GenericError,
  EduUser,
  EduStream,
  EduVideoSourceType,
} from 'agora-rte-sdk';
import { diskApi } from '@/modules/services/disk-api';
import { AppStore } from '@/stores/app';
import { observable, computed, action } from 'mobx'
import { t } from '@/i18n';


export class DiskStore {

  appStore!: AppStore

  constructor(appStore: AppStore) {
    this.appStore = appStore
  }

  @observable
  loading: boolean = false

  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }

  @action
  async getPersonalResources() {
    try {
      const res = await diskApi.getPersonalResources({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
      })
      return res
    } catch (error) {
      // add toast error
    }
  }

  @action
  async uploadPersonalResources(data: {
    // 文件名
    resourceName: string,
    // 文件拓展名
    ext: string,
    conversion: {
      type: string | null,
      preview: boolean,
      scale: number,
      outputFormat: string,
    }
  },) {
    try {
      const res = await diskApi.uploadPersonalResources({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
        data: data,
      })
      return res
    } catch (error) {
      // add upload toast error
    }
  }

  @action 
  async deletePersonalResources(resourceUuids: any) {
    try {
      const res = await diskApi.deletePersonalResources({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
        resourceUuids: resourceUuids,
      })
      return res
    } catch (error) {
      // add delete toast error
    }
  }
}