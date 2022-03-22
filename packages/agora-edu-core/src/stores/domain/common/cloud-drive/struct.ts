import { SceneDefinition } from '@netless/window-manager';
import { observable } from 'mobx';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { CloudDriveResourceConvertProgress } from './type';
export abstract class CloudDriveResource {
  static supportedTypes = [
    'bmp',
    'jpg',
    'png',
    'gif',
    'pdf',
    'jpeg',
    'pptx',
    'ppt',
    'doc',
    'docx',
    'mp3',
    'mp4',
  ];
  static mediaVideoTypes = ['mp4'];
  static mediaAudioTypes = ['mp3'];
  static convertableTypes = ['ppt', 'pptx', 'doc', 'docx', 'pdf'];
  static convertableDynamicTypes = ['pptx'];
  static fromData(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    taskProgress?: CloudDriveResourceConvertProgress;
    taskUuid?: string;
    conversion?: {
      outputFormat: string;
      preview: boolean;
      scale: number;
      type: 'dynamic' | 'static';
    };
    url?: string;
    initOpen?: boolean;
  }): CloudDriveResource | never {
    let ext = data.ext?.toLowerCase?.();
    if (this.convertableTypes.includes(ext)) {
      if (!data.taskProgress || !data.taskUuid || !data.conversion) {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`invalid convertable file ${ext}`),
        );
      }
      return new CloudDriveCourseResource({
        ext: ext,
        resourceName: data.resourceName,
        resourceUuid: data.resourceUuid,
        size: data.size,
        updateTime: data.updateTime,
        taskProgress: data.taskProgress,
        taskUuid: data.taskUuid,
        conversion: data.conversion,
        initOpen: data.initOpen,
      });
    } else if (this.mediaVideoTypes.includes(ext)) {
      if (!data.url) {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`invalid video file ${ext}`),
        );
      }
      return new CloudDriveMediaResource({
        ext: ext,
        resourceName: data.resourceName,
        resourceUuid: data.resourceUuid,
        size: data.size,
        updateTime: data.updateTime,
        url: data.url,
        type: 'video',
        initOpen: data.initOpen,
      });
    } else if (this.mediaAudioTypes.includes(ext)) {
      if (!data.url) {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`invalid audio file ${ext}`),
        );
      }
      return new CloudDriveMediaResource({
        ext: ext,
        resourceName: data.resourceName,
        resourceUuid: data.resourceUuid,
        size: data.size,
        updateTime: data.updateTime,
        url: data.url,
        type: 'audio',
        initOpen: data.initOpen,
      });
    } else {
      if (!data.url) {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`invalid image file ${ext}`),
        );
      }
      return new CloudDriveImageResource({
        ext: ext,
        resourceName: data.resourceName,
        resourceUuid: data.resourceUuid,
        size: data.size,
        updateTime: data.updateTime,
        url: data.url,
        initOpen: data.initOpen,
      });
    }
  }

  ext: string;
  resourceName: string;
  resourceUuid: string;
  size: number;
  updateTime: number;
  initOpen?: boolean;
  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    initOpen?: boolean;
  }) {
    this.ext = data.ext;
    this.resourceName = data.resourceName;
    this.resourceUuid = data.resourceUuid;
    this.size = data.size;
    this.updateTime = data.updateTime;
    this.initOpen = data.initOpen;
  }
}

export class CloudDriveCourseResource extends CloudDriveResource {
  taskProgress: CloudDriveResourceConvertProgress;
  taskUuid: string;
  conversion: {
    outputFormat: string;
    preview: boolean;
    scale: number;
    type: 'dynamic' | 'static';
    canvasVersion?: string;
  };
  scenes: SceneDefinition[];

  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    taskProgress: CloudDriveResourceConvertProgress;
    taskUuid: string;
    conversion: {
      outputFormat: string;
      preview: boolean;
      scale: number;
      type: 'dynamic' | 'static';
    };
    initOpen?: boolean;
  }) {
    super(data);
    this.taskProgress = data.taskProgress;
    this.taskUuid = data.taskUuid;
    this.conversion = data.conversion;
    this.initOpen = data.initOpen;
    this.scenes = data.taskProgress.convertedFileList;
    this.scenes.forEach((scene) => {
      if (scene.ppt) {
        //@ts-ignore
        scene.ppt.previewURL = scene.ppt.preview;
      }
    });
  }
}

export class CloudDriveMediaResource extends CloudDriveResource {
  url: string;
  type: 'video' | 'audio';
  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    url: string;
    type: 'video' | 'audio';
    initOpen?: boolean;
  }) {
    super(data);
    this.url = data.url;
    this.type = data.type;
    this.initOpen = data.initOpen;
  }
}

export class CloudDriveImageResource extends CloudDriveResource {
  url: string;

  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    url: string;
    initOpen?: boolean;
  }) {
    super(data);
    this.url = data.url;
    this.initOpen = data.initOpen;
  }
}

export class CloudDriveUploadingProgress {
  ext: string;
  resourceName: string;
  resourceUuid: string;
  size: number;
  updateTime: number;
  @observable progress: number = 0;

  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
  }) {
    this.ext = data.ext;
    this.resourceName = data.resourceName;
    this.resourceUuid = data.resourceUuid;
    this.size = data.size;
    this.updateTime = data.updateTime;
  }
}
