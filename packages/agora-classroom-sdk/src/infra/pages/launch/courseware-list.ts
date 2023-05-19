import { CourseWareList } from 'agora-edu-core';

export default [
  {
    initOpen: true,
    resourceName: 'Dynamic_G1C1L1 School supplies_1',
    resourceUuid: '4eb52e4ff1a74120b464520af2f55771',
    ext: 'pptx',
    url: '',
    conversion: {
      type: 'dynamic',
      canvasVersion: true,
    },
    size: 11,
    updateTime: 0,
    scenes: [],
    convert: true,
    taskUuid: '4eb52e4ff1a74120b464520af2f55771',
    taskToken: null,
    taskProgress: {
      prefix: 'https://acadsoc-agora.obs.cn-south-1.myhuaweicloud.com/dynamicConvert',
      totalPageSize: 11,
      convertedPageSize: 0,
      convertedPercentage: 100,
      convertedFileList: [],
    },
  },
  {
    initOpen: true,
    resourceName: 'Dynamic_G1C1L1 School supplies_2',
    resourceUuid: 'b963c3d0715711edb65f91720b4a9938',
    ext: 'pptx',
    url: '',
    conversion: {
      type: 'dynamic',
      outputFormat: 'png',
      canvasVersion: false,
    },
    size: 2,
    updateTime: 0,
    convert: true,
    taskUuid: 'b963c3d0715711edb65f91720b4a9938',
    taskToken: null,
    taskProgress: {
      totalPageSize: 2,
      convertedPageSize: 2,
      convertedPercentage: 100,
      convertedFileList: [
        {
          ppt: {
            src: 'pptx://acadsoc-agora.obs.cn-south-1.myhuaweicloud.com/dynamicConvert/b963c3d0715711edb65f91720b4a9938/1.slide',
            width: 1890,
            height: 1058,
            preview:
              'pptx://acadsoc-agora.obs.cn-south-1.myhuaweicloud.com/dynamicConvert/b963c3d0715711edb65f91720b4a9938/1.slide',
          },
          name: 'Scene 1',
        },
        {
          ppt: {
            src: 'pptx://acadsoc-agora.obs.cn-south-1.myhuaweicloud.com/dynamicConvert/b963c3d0715711edb65f91720b4a9938/2.slide',
            width: 1890,
            height: 1058,
            preview:
              'pptx://acadsoc-agora.obs.cn-south-1.myhuaweicloud.com/dynamicConvert/b963c3d0715711edb65f91720b4a9938/2.slide',
          },
          name: 'Scene 2',
        },
      ],
    },
  },
] as CourseWareList;
