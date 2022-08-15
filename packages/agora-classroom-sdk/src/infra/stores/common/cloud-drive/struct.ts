/**
 * 云盘资源对象。支持两种类型；
 * - `'dynamic'`: 动态资源
 * - `'static'`: 静态资源
 */

import { CloudDriveResource } from 'agora-edu-core';
import { CloudDriveResourceConvertProgress } from './type';

/** @en
 * The cloud drive resource object. Supports two types of resources:
 * - `'dynamic'`: Dynamic resources.
 * - `'static'`: Static resources.
 */
export class CloudDriveCourseResource extends CloudDriveResource {
  taskProgress: CloudDriveResourceConvertProgress;
  taskUuid: string;
  conversion: {
    outputFormat: string;
    preview: boolean;
    scale: number;
    type: 'dynamic' | 'static';
    canvasVersion?: boolean;
  };
  scenes: {
    name?: string;
    ppt: {
      previewURL: string;
      src: string;
      height: number;
      width: number;
    };
  }[];

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
      canvasVersion: boolean;
    };
    initOpen?: boolean;
  }) {
    super(data);
    this.taskProgress = data.taskProgress;
    this.taskUuid = data.taskUuid;
    this.conversion = data.conversion;
    this.scenes = data.taskProgress.convertedFileList;
    this.scenes.forEach((scene) => {
      if (scene.ppt) {
        //@ts-ignore
        scene.ppt.previewURL = scene.ppt.preview;
      }
    });
  }
}

/**
 * 多媒体资源文件对象。支持以下类型：
 * - `'video'`: 视频文件
 * - `'audio'`: 音频文件
 */

/** @en
 * The multi-media resource object. Supports types of multi-media resources:
 * - `'video'`
 * - `'audio'`
 */
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
  }
}

/**
 * 图片资源文件对象
 */

/** @en
 * Cloud Drive Image Resource
 */
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
  }
}

export class CloudDriveH5Resource extends CloudDriveResource {
  url: string;
  type = 'h5';
  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    url: string;
    type: string;
    initOpen?: boolean;
  }) {
    super(data);
    this.url = data.url;
    this.type = data.type;
  }
}

export class CloudDriveLinkResource extends CloudDriveResource {
  url: string;
  type = 'link';
  constructor(data: {
    ext: string;
    resourceName: string;
    resourceUuid: string;
    size: number;
    updateTime: number;
    url: string;
    type: string;
    initOpen?: boolean;
  }) {
    super(data);
    this.url = data.url;
    this.type = data.type;
  }
}
