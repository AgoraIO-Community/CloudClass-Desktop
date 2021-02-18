import {
  EduLogger,
  PeerInviteEnum,
  UserRenderer,
  EduAudioSourceType,
  EduTextMessage,
  EduSceneType,
  EduRoleTypeEnum,
  GenericErrorWrapper,
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

  public fileTooltipTextDoc: any = {
    fileType: t('fileTip.fileType'),
    supportText: t('fileTip.supportText'),
    ppt: t('fileTip.ppt'),
    word: t('fileTip.word'),
    excel: t('fileTip.excel'),
    pdf: t('fileTip.pdf'),
    video: t('fileTip.video'),
    audio: t('fileTip.audio'),
    txt: t('fileTip.txt'),
    pic: t('fileTip.pic'),

    pptType: t('fileTip.pptType'),
    wordType: t('fileTip.wordType'),
    excelType: t('fileTip.excelType'),
    pdfType: t('fileTip.pdfType'),
    videoType: t('fileTip.videoType'),
    audioType: t('fileTip.audioType'),
    txtType: t('fileTip.txtType'),
    picType: t('fileTip.picType'),
  }

  public diskTextDoc: any = {
    publicTab: t('disk.publicResources'),
    privateTab: t('disk.privateResources'),
    downloadTab: t('disk.downlownResources'),
    fileName: t('disk.fileName'),
    size: t('disk.size'),
    modificationTime: t('disk.modificationTime'),
    search: t('disk.search'),
    noFile: t('disk.noFile'),
    file: t('disk.file'),
    progress: t('disk.progress'),
    operation: t('disk.operation'),
    all: t('disk.all'),
    downloaded: t('disk.downloaded'),
    notDownload: t('disk.notDownload'),
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