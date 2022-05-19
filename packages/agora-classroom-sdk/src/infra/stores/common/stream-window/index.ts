import { EduUIStoreBase } from '../base';
import { EduStreamUI, StreamBounds } from '../stream/struct';
import { transI18n } from '../i18n';
import { action, computed, IReactionDisposer, observable, reaction, Lambda, when } from 'mobx';
import { computedFn } from 'mobx-utils';
import { cloneDeep, forEach } from 'lodash';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  RteRole2EduRole,
} from 'agora-edu-core';
import {
  AGError,
  AgoraRteEventType,
  AgoraRteMediaSourceState,
  AgoraRteRemoteStreamType,
  AgoraRteScene,
  bound,
  Lodash,
  RtcState,
} from 'agora-rte-sdk';
import { DraggableData } from 'react-draggable';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';
import { isEmpty } from 'lodash';
import { StreamWindow } from './type';
import { StreamWindowWidget, WidgetInfo } from './struct';
import { WidgetTrackStruct } from '../type';
import {
  calculateSize,
  calculateSizeSquare,
  convertToRelativePos,
  convertToWidgetTrackPos,
  isNum,
} from './helper';

const SCALE = 0.5; // 大窗口默认与显示区域的比例
const ZINDEX = 2; // 大窗口默认的层级

const collisionContainerIDs = ['stage-container', 'aisde-streams-container'];

// stream window ui
export class StreamWindowUIStore extends EduUIStoreBase {
  @observable
  private _dataStore: DataStore = {
    streamWindowMap: new Map(),
    tempStreamWindowPosMap: new Map(),
    streamWindowGuard: false,
    darggingStreamUuid: '',
    transitionStreams: new Map(),
  };

  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  private _snapshotPostion = [0, 0]; // 视频第一次拉到区域内的point
  private _streamWindowFirstOffset = [0, 0]; // 视频第一次拉到区域的偏移量
  private _streamWindowUpdatedFromRoom = false; // 收到widget更新标志位
  private _lowUuids = new Set<string>();
  private _highUuids = new Set<string>();

  @observable
  private _streamWindowContainerBounds = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
  };

  get minRect() {
    if (
      EduClassroomConfig.shared.sessionInfo.roomType == EduRoomTypeEnum.Room1v1Class ||
      EduClassroomConfig.shared.sessionInfo.roomType == EduRoomTypeEnum.RoomBigClass
    ) {
      return {
        calculateCount: 9, // 最大全屏数量
        minWidth: 300,
        minHeight: 168,
      };
    } else if (EduClassroomConfig.shared.sessionInfo.roomType == EduRoomTypeEnum.RoomSmallClass) {
      return {
        calculateCount: 8, // 最大全屏数量
        minWidth: 176, // 默认最小宽度
        minHeight: 99, // 默认最小高度
      };
    }
    return {
      calculateCount: 8, // 最大全屏数量
      minWidth: 176, // 默认最小宽度
      minHeight: 99, // 默认最小高度
    };
  }

  get streamDragable() {
    return EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  }

  get needDragable() {
    return EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  }

  /**
   *
   */
  @computed
  get streamWindowMap() {
    return this._dataStore.streamWindowMap;
  }

  /**
   *
   */
  @computed
  get transitionStreams() {
    return this._dataStore.transitionStreams;
  }

  /**
   *
   */
  @computed
  get tempStreamWindowPosMap() {
    return this._dataStore.tempStreamWindowPosMap;
  }

  /**
   * 正在拖拉的 streamUuid
   */
  @computed
  get draggingStreamUuid() {
    return this._dataStore.darggingStreamUuid;
  }

  /**
   * 讲台状态
   */
  @computed
  get stageVisible() {
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass)
      return typeof this.classroomStore.roomStore.flexProps.stage === 'undefined'
        ? true
        : this.classroomStore.roomStore.flexProps?.stage;
    return false;
  }

  /**
   * 老师流信息列表
   * @returns
   */
  @computed
  get teacherStream(): EduStreamUI {
    const streamSet = new Set<EduStreamUI>();
    const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;

    const streamUuids = this.classroomStore.streamStore.streamByUserUuid.get(userUuid) || new Set();
    for (const streamUuid of streamUuids) {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
      if (stream) {
        const uiStream = new EduStreamUI(stream);
        streamSet.add(uiStream);
      }
    }

    return Array.from(streamSet)[0];
  }

  /**
   * 学生流信息列表
   * @returns
   */
  @computed
  get studentStreams(): EduStreamUI[] {
    const streamSet = new Set<EduStreamUI>();
    const studentList = this.classroomStore.userStore.studentList;
    for (const student of studentList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return Array.from(streamSet);
  }
  /**
   * big streamwindows 大窗口
   */
  @computed
  get streamWindowUserUuids() {
    return [...this.streamWindowMap.values()].map((item) => item.userUuid);
  }
  /**
   * 获取当前选中的流
   */
  @computed
  get streamWindowStreams() {
    const streams = new Map();
    const streamUuids = [...this.streamWindowMap.keys()];
    streamUuids.forEach((streamUuid: string) => {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
      if (stream) {
        const uiStream = new EduStreamUI(stream);
        streams.set(streamUuid, uiStream);
      }
    });
    return streams;
  }

  @computed
  get streamWindowRealBoundsMap() {
    const _streamWindowRealBoundsMap: Map<string, StreamWindow> = new Map();
    this.streamWindowMap.forEach((value: StreamWindow, streamUuid: string) => {
      const x = value.x * this._streamWindowContainerBounds.width,
        y = value.y * this._streamWindowContainerBounds.height,
        width = value.width * this._streamWindowContainerBounds.width,
        height = value.height * this._streamWindowContainerBounds.height;
      _streamWindowRealBoundsMap.set(streamUuid, { ...value, x, y, width, height });
    });
    return _streamWindowRealBoundsMap;
  }

  /**
   *  用于 UI 展示
   */
  @computed
  get streamWindows() {
    const arr = [...this.streamWindowRealBoundsMap.entries()].sort(
      (a: [string, StreamWindow], b: [string, StreamWindow]) => a[1].zIndex - b[1].zIndex,
    );
    return arr;
  }

  /**
   * 是否有全屏展示的 streamWindow
   */
  @computed
  get containedStreamWindow() {
    return [...this.streamWindowMap.values()].find((item) => item.contain);
  }
  /**
   * 覆盖组件透明度（底部工具栏，侧边工具栏，举手按钮，聊天按钮）
   */
  @computed
  get containedStreamWindowCoverOpacity() {
    return this.containedStreamWindow ? 0.9 : 1;
  }
  /**
   * 全屏展示的 streamWindow 数量
   */
  @computed
  get containedStreamWindowSize() {
    return [...this.streamWindowMap.values()].filter((item) => item.contain).length;
  }

  /**
   * 返回没有在指定区域展示的 streams
   */
  @computed
  get streamsShouldOffPodium() {
    return this.studentStreams.filter(
      (value: EduStreamUI) => !this.streamWindowMap.has(value.stream.streamUuid),
    );
  }

  /**
   * 小流ID
   */
  @computed
  get lowStreamUuids() {
    const uuids = new Set<string>();
    this.classroomStore.streamStore.streamByStreamUuid.forEach((stream, streamUuid) => {
      if (!this.streamWindowMap.has(streamUuid)) {
        uuids.add(streamUuid);
      }
    });

    return uuids;
  }

  /**
   * 拖拉权限控制
   */
  streamWindowLocked = computedFn((stream: EduStreamUI): boolean => {
    const { role } = EduClassroomConfig.shared.sessionInfo;
    if (role === EduRoleTypeEnum.teacher) {
      if (this.streamWindowMap.get(stream.stream.streamUuid)?.contain) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  });

  /**
   * 是否存在 streamwindow widget
   * true 代表大窗里有 stream
   * false 代表大窗里没有 stream
   */
  visibleStream = computedFn((streamUuid: string): boolean => {
    const _visibleStream = this.streamWindowMap.has(streamUuid);
    if (_visibleStream) return _visibleStream;
    return this.transitionStreams.has(streamUuid);
  });

  /**
   * 返回当前是否有学生流
   */
  @bound
  getStream(streamUuid: string) {
    const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
    if (stream) {
      const uiStream = new EduStreamUI(stream);
      return uiStream;
    }
    return undefined;
  }

  /**
   * 设置大窗显示区域
   * @param bounds
   */
  @action.bound
  setMiddleContainerBounds(bounds: StreamBounds) {
    this._streamWindowContainerBounds = bounds;
  }

  /**
   * for drag
   * @param param0
   */
  @action.bound
  setStreamDragInformation = ({
    stream,
    active,
    pos,
    dragging,
  }: {
    stream: EduStreamUI;
    active: boolean;
    pos: [number, number];
    dragging?: boolean;
  }) => {
    if (this.containedStreamWindow) return; // 区域内有全屏的视频，不允许讲台区域内的视频拖拽

    const streamUuid = stream.stream.streamUuid;
    this.updateDraggingStreamUuid(streamUuid); // 设置正在拖拽的视频流 ID
    // 如果在可操作区域的话， 创建一个大窗组件，并设置宽高，位置
    if (active && this._isMatchWindowContainer(pos[0], pos[1])) {
      this._dataStore.streamWindowGuard = true;
      this._createStreamWindowByUuid(stream, pos);
    }

    // 如果现在结束了视频拖拽，并且鼠标的位置不在区域内，那么要移除数据
    if (!active && !this._isMatchWindowContainer(pos[0], pos[1])) {
      this._dataStore.streamWindowGuard = false;
      this._removeStreamWindowByUuid(stream.stream.streamUuid);
    }

    // 如果结束了视频拖拽，并且鼠标在区域内，那么更新位置到远端
    if (!active && this._isMatchWindowContainer(pos[0], pos[1])) {
      this.sendWigetDataToServer(streamUuid);
    }
  };

  /**
   * 是否在多视频的容器内
   * @param x
   * @param y
   * @returns
   */
  private _isMatchWindowContainer = (x: number, y: number) => {
    if (
      x >= this._streamWindowContainerBounds.left &&
      x <= this._streamWindowContainerBounds.right &&
      y >= this._streamWindowContainerBounds.top &&
      y <= this._streamWindowContainerBounds.bottom
    ) {
      return true;
    }
    return false;
  };

  @action.bound
  private _createStreamWindowByUuid = (stream: EduStreamUI, pos: [number, number]) => {
    // 如果有那么只是更新位置信息
    if (this.streamWindowMap.has(stream.stream.streamUuid)) {
      this._updateStreamWindow(stream, pos);
    } else {
      // 先保存第一次到区域的坐标
      // create streamwindow
      this._snapshotPostion = pos;
      this._createStreamWindow(stream);
    }
  };

  @action.bound
  private _addStreamWindowByUuid = (streamUuid: string, info: StreamWindowWidget) => {
    // 当宽高度小于最小宽高度的时候修改为最小宽高度
    const { width, height } = this._streamWindowContainerBounds;
    const { minWidth, minHeight } = this.minRect;

    const minWidthPercent = minWidth / width,
      minHeightPercent = minHeight / height;
    if (info.width < minWidthPercent) {
      info.width = minWidthPercent;
    }
    if (info.height < minHeightPercent) {
      info.height = minHeightPercent;
    }
    this.streamWindowMap.set(streamUuid, info);
  };

  @action.bound
  private _removeStreamWindowByUuid(streamUuid: string) {
    this.streamWindowMap.delete(streamUuid);
  }

  @action.bound
  private _initStreamWindowSize = () => {
    const { width, height } = this._streamWindowContainerBounds;
    const { minWidth, minHeight } = this.minRect;

    let streamWindowWidth = minWidth,
      streamWindowHeight = minHeight;

    if (height / 2 > minHeight) {
      streamWindowHeight = height / 2;
      streamWindowWidth = (16 * streamWindowHeight) / 9;
    }

    const streamWindowWidthScale = streamWindowWidth / width,
      streamWindowHeightScale = streamWindowHeight / height;

    return {
      streamWindowWidth,
      streamWindowWidthScale,
      streamWindowHeight,
      streamWindowHeightScale,
    };
  };

  /**
   * 从小视频向拉创建 stream window
   * @param streamUuid
   */
  @action.bound
  private _createStreamWindow = (stream: EduStreamUI) => {
    // width height 为区域的比例
    const {
      streamWindowWidth,
      streamWindowWidthScale,
      streamWindowHeight,
      streamWindowHeightScale,
    } = this._initStreamWindowSize();
    const [x, y] = this._setValidStreamWindowOffset(streamWindowWidth, streamWindowHeight);

    const streamwindow = {
      width: streamWindowWidthScale,
      height: streamWindowHeightScale,
      x,
      y,
      contain: false,
      zIndex: ZINDEX,
      userUuid: stream.stream.fromUser.userUuid,
    };
    this._addStreamWindowByUuid(stream.stream.streamUuid, new StreamWindowWidget(streamwindow));
  };

  /**
   *
   * @param streamUuid
   * @param pos
   */
  @action.bound
  private _updateStreamWindow = (stream: EduStreamUI, pos: [number, number]) => {
    const streamUuid = stream.stream.streamUuid;
    const width = this._streamWindowContainerBounds.width * SCALE,
      height = this._streamWindowContainerBounds.height * SCALE;

    const information = this.streamWindowMap.get(streamUuid) as StreamWindowWidget;
    const [offsetX, offsetY] = this._streamWindowFirstOffset;
    const [mouseX, mouseY] = pos;
    const [snapshotMouseX, snapshotMouseY] = this._snapshotPostion;

    const delta = [mouseX - snapshotMouseX, mouseY - snapshotMouseY];

    let [targetOffsetX, targetOffsetY] = [offsetX + delta[0], offsetY + delta[1]];

    // Keep x and y below right and bottom limits...
    if (isNum(this._streamWindowContainerBounds.right))
      targetOffsetX =
        Math.min(targetOffsetX + width, this._streamWindowContainerBounds.right) - width;
    if (isNum(this._streamWindowContainerBounds.bottom))
      targetOffsetY =
        Math.min(
          targetOffsetY + height,
          this._streamWindowContainerBounds.bottom - this._streamWindowContainerBounds.top,
        ) - height;

    // But above left and top limits.
    if (isNum(this._streamWindowContainerBounds.left))
      targetOffsetX = Math.max(targetOffsetX, this._streamWindowContainerBounds.left);
    if (isNum(this._streamWindowContainerBounds.top))
      targetOffsetY =
        Math.max(
          targetOffsetY + this._streamWindowContainerBounds.top,
          this._streamWindowContainerBounds.top,
        ) - this._streamWindowContainerBounds.top;

    targetOffsetX = targetOffsetX / this._streamWindowContainerBounds.width;
    targetOffsetY = targetOffsetY / this._streamWindowContainerBounds.height;

    this._addStreamWindowByUuid(
      stream.stream.streamUuid,
      new StreamWindowWidget({ ...information.information, x: targetOffsetX, y: targetOffsetY }),
    );
  };

  // 第一次从小视频拖拉下来的时候，需要手动计算显示区间
  private _setValidStreamWindowOffset = (streamWindowWidth: number, streamWindowHeight: number) => {
    const snapshotPostionX = this._snapshotPostion[0],
      snapshotPostionY = this._snapshotPostion[1]; // 进入大区域的时候的坐标
    const width = streamWindowWidth,
      height = streamWindowHeight;

    const streamWindowItems = {
      x: snapshotPostionX - width / 2,
      y: snapshotPostionY,
    };

    // Keep x and y below right and bottom limits...
    if (isNum(this._streamWindowContainerBounds.right))
      streamWindowItems.x =
        Math.min(streamWindowItems.x + width, this._streamWindowContainerBounds.right) - width;
    if (isNum(this._streamWindowContainerBounds.bottom))
      streamWindowItems.y =
        Math.min(streamWindowItems.y + height, this._streamWindowContainerBounds.bottom) - height;

    // But above left and top limits.
    if (isNum(this._streamWindowContainerBounds.left))
      streamWindowItems.x = Math.max(streamWindowItems.x, this._streamWindowContainerBounds.left);
    if (isNum(this._streamWindowContainerBounds.top))
      streamWindowItems.y = Math.max(streamWindowItems.y, this._streamWindowContainerBounds.top);
    this._streamWindowFirstOffset = [
      streamWindowItems.x,
      streamWindowItems.y - this._streamWindowContainerBounds.top,
    ];
    const offsetX = streamWindowItems.x / this._streamWindowContainerBounds.width;
    const offsetY =
      (streamWindowItems.y - this._streamWindowContainerBounds.top) /
      this._streamWindowContainerBounds.width;
    return [offsetX, offsetY];
  };

  /**
   * 值都是具体的数值
   * @param streamUuid
   * @param param1
   */
  @action.bound
  private _setStreamWindowMap = (
    stream: EduStreamUI | string,
    {
      x,
      y,
      width,
      height,
      zIndex,
      contain,
      userUuid,
    }: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      zIndex?: number;
      contain?: boolean;
      userUuid?: string;
    },
  ) => {
    const streamUuid = typeof stream === 'string' ? stream : stream.stream.streamUuid;
    if (!streamUuid) return;
    const information = this.streamWindowMap.get(streamUuid);
    information
      ? this._addStreamWindowByUuid(
          streamUuid,
          new StreamWindowWidget({
            ...information.information,
            x:
              typeof x !== 'undefined'
                ? x / this._streamWindowContainerBounds.width
                : information.x,
            y:
              typeof y !== 'undefined'
                ? y / this._streamWindowContainerBounds.height
                : information.y,
            width: width ? width / this._streamWindowContainerBounds.width : information.width,
            height: height ? height / this._streamWindowContainerBounds.height : information.height,
            zIndex: zIndex ? zIndex : information.zIndex,
            contain: typeof contain !== 'undefined' ? contain : information.contain,
          }),
        )
      : this._addStreamWindowByUuid(
          streamUuid,
          new StreamWindowWidget({
            x: typeof x !== 'undefined' ? x / this._streamWindowContainerBounds.width : 0,
            y: typeof y !== 'undefined' ? y / this._streamWindowContainerBounds.height : 0,
            width: width ? width / this._streamWindowContainerBounds.width : 0,
            height: height ? height / this._streamWindowContainerBounds.height : 0,
            zIndex: zIndex ? zIndex : 2,
            contain: typeof contain !== 'undefined' ? contain : false,
            userUuid: userUuid ? userUuid : '',
          }),
        );
  };

  @action.bound
  private _handleTempStreamWindowMap() {
    this.streamWindowMap.forEach((value: StreamWindowWidget, streamUuid: string) => {
      const _value = cloneDeep(value);
      if (!_value.contain) {
        this.tempStreamWindowPosMap.set(streamUuid, _value);
      }
    });
  }

  @bound
  _setStreamWindowUpdate(status: boolean) {
    this._streamWindowUpdatedFromRoom = status;
  }

  /**
   * 双击视频窗口逻辑处理
   * @param stream
   * @returns
   */
  @action.bound
  handleDBClickStreamWindow(stream: EduStreamUI) {
    const streamUuid = stream.stream.streamUuid;
    const currentStreamWindow = this.streamWindowMap.get(streamUuid);

    // 1、添加 streamwindow 窗口是否是全屏窗口并做数量判断
    if (
      !currentStreamWindow?.contain &&
      this.containedStreamWindowSize >= this.minRect.calculateCount
    ) {
      this.shareUIStore.addToast(
        transI18n('toast2.stream_window_full', { reason: this.minRect.calculateCount }),
      );
      return;
    }
    this.handleStreamWindowContain(stream);
  }

  /**
   * 双击全屏的时候
   * 1. 讲台展示直接删除 streamwindow widget，
   * 2. 讲台隐藏的时候需要查看之前窗口的位置，
   *  2.1 如果有位置那么返回之前的位置
   *  2.2 如果么位置那么创建一个位置不要重叠
   * @param stream
   * @returns
   */
  @action.bound
  handleStreamWindowContain(stream: EduStreamUI) {
    const streamUuid = stream.stream.streamUuid;
    let currentStreamWindow = this.streamWindowMap.get(streamUuid);

    if (!currentStreamWindow) {
      currentStreamWindow = new StreamWindowWidget({ userUuid: stream.stream.fromUser.userUuid });
    }
    // 双击的时候判断是否处于全屏状态
    if (currentStreamWindow && !currentStreamWindow.contain) {
      currentStreamWindow.information = { contain: true };
      this._addStreamWindowByUuid(streamUuid, currentStreamWindow);
      this._handleCalculateContains();

      // 如果有 stage 的话那么移除所有未全屏的视频
      if (this.stageVisible) {
        this.streamWindowMap.forEach((value: StreamWindow, streamUuid: string) => {
          if (!value.contain) {
            this._removeStreamWindowByUuid(streamUuid);
            this._deleteStreamWindowWidegtToServer(streamUuid);
          }
        });
      }
      this.sendWigetDataToServer();

      return;
    }

    // 如果为全屏的状态，
    // 1. 如果有讲台的区域的话，那么回到它讲台的位置，
    // 2. 如果没有讲台区域的话，需要有个位置重置
    if (currentStreamWindow && currentStreamWindow.contain) {
      if (this.stageVisible) {
        this._removeStreamWindowByUuid(streamUuid);
        this._deleteStreamWindowWidegtToServer(streamUuid);
      } else {
        const bounds = this._getTempStreamWindowPosCache(streamUuid);
        currentStreamWindow.information = bounds;
        this._addStreamWindowByUuid(streamUuid, currentStreamWindow);
      }
      this._handleCalculateContains();
      this.sendWigetDataToServer();
    }
  }

  /**
   * 设置重新计算后的 widget rect
   * 需要要没有全屏的 widget 删除
   */
  @action.bound
  private _handleCalculateContains() {
    const streamWindowContains = this._getStreamWindowContain();
    const containLength = streamWindowContains.length;

    if (containLength) {
      const sizes = this._calculateSize(containLength);
      const flatSizes = sizes.flat();
      streamWindowContains.forEach((streamUuid: string, index: number) => {
        const size = flatSizes[index];
        const information = this.streamWindowMap.get(streamUuid) as StreamWindowWidget;
        information.information = size;
        this._addStreamWindowByUuid(streamUuid, information);
      });
    }
  }

  /**
   * 单击处理 zIndex 问题
   * @param streamUuid
   */
  @action.bound
  handleStreamWindowSingalClick = (stream: EduStreamUI) => {
    let maxZindex = 2;

    this.streamWindowMap.forEach((value: StreamWindow, _: string) => {
      maxZindex = Math.max(maxZindex, value.zIndex);
    });
    const information = this.streamWindowMap.get(stream.stream.streamUuid) as StreamWindowWidget;
    if (information.contain) {
      return;
    }
    if (information && (information?.zIndex < maxZindex || information.zIndex === 2)) {
      information.information = { zIndex: maxZindex + 1 };
      this._addStreamWindowByUuid(stream.stream.streamUuid, information);
    }
  };

  /**
   * https://github.com/facebook/react/issues/3185
   * @param streamUuid
   * @returns
   */
  handleStreamWindowClick = (stream: EduStreamUI) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeoutID: any = null;
    const delay = 250;
    return () => {
      if (EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.teacher) {
        return;
      }

      if (!timeoutID) {
        timeoutID = setTimeout(() => {
          this.handleStreamWindowSingalClick(stream);
          timeoutID = null;
        }, delay);
      } else {
        timeoutID = clearTimeout(timeoutID);
        this.handleDBClickStreamWindow(stream);
      }
    };
  };

  @bound
  private _calculateSize(count: number) {
    if (this.minRect.calculateCount === 8) {
      return calculateSize(count, 1, 1);
    }
    return calculateSizeSquare(count, 1, 1);
  }
  /**
   * 获取全屏的视频
   */
  private _getStreamWindowContain() {
    const streamWindowContainKeys: string[] = [];
    this.streamWindowMap.forEach((value: StreamWindowWidget, key: string) => {
      value.contain && streamWindowContainKeys.push(key);
    });
    return streamWindowContainKeys;
  }

  @action.bound
  setTransitionStreams(streamUuid: string) {
    this.transitionStreams.set(streamUuid, true);
  }

  @action.bound
  removeTransitionStreams(streamUuid: string) {
    this.transitionStreams.delete(streamUuid);
  }

  /**
   * 只处理学生流
   */
  @action.bound
  private _handleOnOrOffPodium() {
    const newStreams = this.studentStreams.filter(
      (value: EduStreamUI) => !this.streamWindowMap.has(value.stream.streamUuid),
    );
    const deleteStreams: string[] = [];
    this.streamWindowMap.forEach((value: StreamWindowWidget, streamUuid: string) => {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
      if (
        stream &&
        RteRole2EduRole(EduRoomTypeEnum.RoomBigClass, stream.fromUser.role) ===
          EduRoleTypeEnum.teacher
      ) {
        return;
      }
      const leavedStreams = this.studentStreams.find(
        (value: EduStreamUI) => value.stream.streamUuid === streamUuid,
      );

      !leavedStreams && deleteStreams.push(streamUuid);
    });

    // 当讲台隐藏的时候添加 streamwindow
    if (!this.stageVisible) {
      newStreams.forEach((value: EduStreamUI) => {
        const streamUuid = value.stream.streamUuid;
        const streamWindow = new StreamWindowWidget({ userUuid: value.stream.fromUser.userUuid });
        const bounds = this._getTempStreamWindowPosCache(streamUuid);
        streamWindow.information = bounds;
        this._addStreamWindowByUuid(streamUuid, streamWindow);
      });
    }

    deleteStreams.forEach((streamUuid: string) => {
      this._removeStreamWindowByUuid(streamUuid);
      this._deleteStreamWindowWidegtToServer(streamUuid);
      this.tempStreamWindowPosMap.delete(streamUuid);
    });

    this._handleCalculateContains(); // 重新计算
    this.sendWigetDataToServer(); //发送消息到远端
  }

  @action.bound
  private _handleClassroomUIEvents(type: AgoraEduClassroomUIEvent, ...args: any) {
    switch (type) {
      case AgoraEduClassroomUIEvent.offStreamWindow:
        this._handleOffAllStreamWindow();
        break;
      case AgoraEduClassroomUIEvent.toggleTeacherStreamWindow:
        this._handleToggleTeacherStreamWindow(args[0]);
        break;
      case AgoraEduClassroomUIEvent.hiddenStage:
        this._handleOffPodium();
        break;
      case AgoraEduClassroomUIEvent.toggleWhiteboard:
        this._handleToggleWhiteboard(args[0]);
        break;
      default:
        break;
    }
  }

  @action.bound
  private _handleOffAllStreamWindow() {
    for (const streamWindow of this.streamWindowMap) {
      this._removeStreamWindowByUuid(streamWindow[0]);
      this._deleteStreamWindowWidegtToServer(streamWindow[0]);
    }

    this._handleCalculateContains(); // 重新计算
    this.sendWigetDataToServer(); //发送消息到远端
  }

  @action.bound
  private _handleToggleTeacherStreamWindow(visible: boolean) {
    if (visible) {
      if (this.teacherStream) {
        const streamUuid = this.teacherStream.stream.streamUuid;
        const currentStreamWindow = new StreamWindowWidget({
          userUuid: this.teacherStream.stream.fromUser.userUuid,
        });
        const bounds = this._getTempStreamWindowPosCache(streamUuid);
        currentStreamWindow.information = bounds;

        this._addStreamWindowByUuid(streamUuid, currentStreamWindow);
      }
    } else {
      if (this.teacherStream) {
        const contain = this.streamWindowMap.get(this.teacherStream.stream.streamUuid)?.contain;
        this._removeStreamWindowByUuid(this.teacherStream.stream.streamUuid);
        this._deleteStreamWindowWidegtToServer(this.teacherStream.stream.streamUuid);
        this.tempStreamWindowPosMap.delete(this.teacherStream.stream.streamUuid);
        contain && this._handleCalculateContains(); // 如果之前为全屏那么重新计算
      }
    }
    this.sendWigetDataToServer();
  }

  /**
   * 发送数据到远端，teacher only
   */
  @Lodash.debounced(300)
  sendWigetDataToServer(streamUuid?: string) {
    const { role } = EduClassroomConfig.shared.sessionInfo;
    if (role === EduRoleTypeEnum.teacher) {
      const widgetsData = this._encodeWidgetRect();
      if (streamUuid) {
        const value = widgetsData.get(streamUuid);
        this.classroomStore.widgetStore.updateWidget(`streamWindow-${streamUuid}`, value);
        return;
      }
      widgetsData.forEach((value, streamUuid) => {
        const widgetUuid = `streamWindow-${streamUuid}`;
        this.classroomStore.widgetStore.updateWidget(widgetUuid, value);
      });
    }
  }

  /**
   * 删除 widget streamwindow
   * @param widgetUuid
   */
  private _deleteStreamWindowWidegtToServer(streamUuid: string) {
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      this.classroomStore.widgetStore.deleteWidget(`streamWindow-${streamUuid}`);
    }
  }

  /**
   * for stream window drag
   * @param e
   * @param data
   * @param streamUuid
   * @param offsetX
   * @returns
   */
  @bound
  handleDrag(e: any, data: DraggableData, streamUuid: string, offsetX: number) {
    this.updateDraggingStreamUuid(streamUuid); // 目前正在拖拉的 streamUuid
    // 如果为大班课并且不为老师的话，不做碰撞处理只更新位置
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass) {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
      if (
        stream &&
        RteRole2EduRole(EduRoomTypeEnum.RoomBigClass, stream.fromUser.role) !==
          EduRoleTypeEnum.teacher
      ) {
        Math.abs(data.x - offsetX) > 0 &&
          this.handleStreamWindowInfo(this.streamWindowStreams.get(streamUuid), {
            x: data.x,
            y: data.y,
          });
        return;
      }
    }
    if (this._handldeStreamWindowCollisionDetection(e)) {
      this._removeStreamWindowByUuid(streamUuid);
      this._deleteStreamWindowWidegtToServer(streamUuid);
    } else {
      Math.abs(data.x - offsetX) > 0 &&
        this.handleStreamWindowInfo(
          this.streamWindowStreams.get(streamUuid),
          {
            x: data.x,
            y: data.y,
          },
          false,
        );
    }
  }
  /**
   * 区域内更新 streamsWindowMap 信息
   * @param streamUuid
   * @param streamWindowInfo
   */
  @action.bound
  handleStreamWindowInfo(
    stream: EduStreamUI,
    streamWindowInfo: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      zIndex?: number;
      contain?: boolean;
    },
    sendToServer = true,
  ) {
    this._setStreamWindowMap(stream, streamWindowInfo);
    this._handleTempStreamWindowMap();
    sendToServer && this.sendWigetDataToServer();
  }

  @action.bound
  private _handldeStreamWindowCollisionDetection(e: MouseEvent) {
    let isCollision = false;
    const { pageX, pageY } = e;
    collisionContainerIDs.forEach((dom: string) => {
      const domNode = document.querySelector(`#${dom}`);
      if (domNode) {
        const bound = domNode.getBoundingClientRect();
        const { left, top, right, bottom } = bound;
        if (pageX > left && pageX < right && pageY > top && pageY < bottom) {
          isCollision = true;
        }
      }
    });
    return isCollision;
  }

  /**
   * 转换为 widget 坐标
   * @returns
   */
  private _encodeWidgetRect() {
    const { width, height } = this._streamWindowContainerBounds;
    const streamWidgetMap: Map<string, WidgetInfo> = new Map();
    this.streamWindowMap.size &&
      this.streamWindowRealBoundsMap.forEach((value: StreamWindow, streamWindowUuid: string) => {
        const perStreamWindow = convertToWidgetTrackPos(value, {
          width,
          height,
        }) as WidgetTrackStruct;
        perStreamWindow.extra.operatorUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
        perStreamWindow.extra.userUuid = value.userUuid;
        perStreamWindow.state = 1;
        streamWidgetMap.set(
          streamWindowUuid,
          new WidgetInfo({
            ownerUserUuid: value.userUuid,
            position: perStreamWindow.position,
            size: perStreamWindow.size,
            state: 1,
            extra: perStreamWindow.extra,
          }),
        );
      });
    return streamWidgetMap;
  }

  private _createNewTempStreamWindow() {
    const size = this.streamWindowMap.size;
    const width = 0.135,
      height = 0.16,
      offset = 0.05; // 根据设计稿比例

    let x = 0.00625,
      y = 0.00625;

    const tempStreamWindowPos = { width, height, x, y, zIndex: 2, contain: false };
    if (size) {
      x += offset * size;
      y += offset * size;
    }
    return { ...tempStreamWindowPos, x, y };
  }

  @action.bound
  private _getTempStreamWindowPosCache(streamUuid: string) {
    const streamWindowPosMap = this.tempStreamWindowPosMap.get(streamUuid);
    if (streamWindowPosMap) return streamWindowPosMap;
    return this._createNewTempStreamWindow();
  }

  /**
   * 把不在指定区域的学生 streams 下台
   */
  @action.bound
  private _handleOffPodium() {
    const { offPodium } = this.classroomStore.handUpStore;
    this.streamsShouldOffPodium.forEach((value: EduStreamUI) => {
      offPodium(`${value.fromUser.userUuid}`).catch((e) => {
        if (
          !AGError.isOf(
            e,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
            AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
          )
        ) {
          this.shareUIStore.addGenericErrorDialog(e);
        }
      });
    });
  }

  @action.bound
  private _handleToggleWhiteboard(status: boolean) {
    // 白板关闭并且没有大窗的情况下，添加大窗
    if (status && !this.streamWindowMap.size && this.teacherStream) {
      const { userUuid } = EduClassroomConfig.shared.sessionInfo;

      const streamwindow = {
        width: 1,
        height: 1,
        x: 0,
        y: 0,
        contain: true,
        zIndex: ZINDEX,
        userUuid: userUuid,
      };
      this._addStreamWindowByUuid(
        this.teacherStream.stream.streamUuid,
        new StreamWindowWidget(streamwindow),
      );
      this.sendWigetDataToServer();
    }
  }

  private _setRemoteStreamType(highStreamUuids: Set<string>, lowStreamUuids: Set<string>) {
    if (highStreamUuids.size || lowStreamUuids.size) {
      this.classroomStore.streamStore.streamByStreamUuid.forEach(
        async (stream, streamUuid: string) => {
          const isLow = this._lowUuids.has(streamUuid);
          const isHigh = this._highUuids.has(streamUuid);
          if (highStreamUuids.has(streamUuid) && !isHigh) {
            await this.classroomStore.streamStore.setRemoteVideoStreamType(
              streamUuid,
              AgoraRteRemoteStreamType.HIGH_STREAM,
            );
            this._highUuids.add(streamUuid);
            this._lowUuids.delete(streamUuid);
          } else if (lowStreamUuids.has(streamUuid) && !isLow) {
            await this.classroomStore.streamStore.setRemoteVideoStreamType(
              streamUuid,
              AgoraRteRemoteStreamType.LOW_STREAM,
            );
            this._lowUuids.add(streamUuid);
            this._highUuids.delete(streamUuid);
          }
        },
      );
    }
  }

  @action.bound
  removeStreamWindowByUuid = (streamUuid: string) => {
    this._dataStore.streamWindowMap.delete(streamUuid);
  };

  @action.bound
  handleWidgetInformationFromServer(widgets: any) {
    forEach(widgets, (value: WidgetTrackStruct, key) => {
      const widgetStreamWindowUuid = key.match(/streamWindow-(.*)/);
      if (widgetStreamWindowUuid?.length) {
        const streamUuid = widgetStreamWindowUuid[1];
        const { size, position } = value;
        const notTrack = !size || !position;
        // 防止没有位置信息的 streamwindow
        if (notTrack) {
          return;
        }
        const streamWindowValue = this._decodeWidgetRect(value);
        size &&
          this._setStreamWindowMap(`${streamUuid}`, {
            ...streamWindowValue,
            userUuid: value.extra.userUuid,
          });
      }
    });
  }

  @action.bound
  updateDraggingStreamUuid(streamUuid: string) {
    this._dataStore.darggingStreamUuid = streamUuid;
  }

  @action.bound
  resetDraggingStreamUuid() {
    this._dataStore.darggingStreamUuid = '';
  }

  /**
   * 转换 widget 坐标方式
   * @param widgetProps
   * @returns
   */
  private _decodeWidgetRect(widgetProps: WidgetTrackStruct) {
    const { width, height } = this._streamWindowContainerBounds;
    const widgetinformation = convertToRelativePos(widgetProps, { width, height });
    return widgetinformation;
  }

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    if (this.classroomStore.connectionStore.mainRoomScene === scene) {
      let handler = SceneEventHandler.getEventHandler(scene);
      if (!handler) {
        handler = SceneEventHandler.createEventHandler(scene, this);
      }
      this._dataStore = handler.dataStore;
      this._lowUuids = handler.lowUuids;
      this._highUuids = handler.highUuids;
      this._dataStore.transitionStreams = new Map();
    } else {
      const handler = SceneEventHandler.createEventHandler(scene, this);
      this._dataStore = handler.dataStore;
      this._lowUuids = handler.lowUuids;
      this._highUuids = handler.highUuids;
    }
  }

  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.scene).observe(
        ({ newValue, oldValue }) => {
          if (newValue) {
            this._setEventHandler(newValue);
          }
        },
      ),
    );

    this._disposers.push(
      // 只控制上下台逻辑的变更
      reaction(
        () => this.studentStreams,
        () => {
          // 1v1 只处理学生离开了课堂需要把大窗口移除掉
          if (
            EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class &&
            this._streamWindowUpdatedFromRoom &&
            !this.studentStreams.length
          ) {
            this._handleOnOrOffPodium();
            return;
          }

          if (
            EduClassroomConfig.shared.sessionInfo.roomType !== EduRoomTypeEnum.Room1v1Class &&
            this._streamWindowUpdatedFromRoom
          ) {
            this._handleOnOrOffPodium();
          }
        },
        {
          equals: (a, b) => {
            if (a.length !== b.length) {
              return false;
            }
            return true;
          },
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => this.streamWindowUserUuids,
        () => {
          EduEventUICenter.shared.emitClassroomUIEvents(
            AgoraEduClassroomUIEvent.streamWindowsChange,
            [...this.streamWindowUserUuids],
          );
        },
      ),
    );

    this._disposers.push(
      computed(() => ({
        rtcState: this.classroomStore.connectionStore.rtcState,
        lowStreamUuids: this.lowStreamUuids,
        windowStreamUuids: new Set(this.streamWindowMap.keys()),
      })).observe(
        ({
          newValue,
          oldValue = {
            rtcState: RtcState.Idle,
            windowStreamUuids: new Set(),
            lowStreamUuids: new Set(),
          },
        }) => {
          const { rtcState } = newValue;
          const newSet = newValue.windowStreamUuids;
          const oldSet = oldValue?.windowStreamUuids || new Set();
          const lowUuids = this.lowStreamUuids;
          const highUuids = new Set<string>();

          if (rtcState === RtcState.Connected) {
            for (const i of oldSet) {
              if (!newSet.has(i)) {
                lowUuids.add(i);
              }
            }
            for (const i of newSet) {
              if (!oldSet.has(i)) {
                highUuids.add(i);
              }
            }
            this._setRemoteStreamType(highUuids, lowUuids);
          }
        },
      ),
    );
    EduEventUICenter.shared.onClassroomUIEvents(this._handleClassroomUIEvents);
  }

  onDestroy() {
    SceneEventHandler.cleanup();
    EduEventUICenter.shared.offClassroomUIEvents(this._handleClassroomUIEvents);
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

type DataStore = {
  streamWindowMap: Map<string, StreamWindowWidget>;
  tempStreamWindowPosMap: Map<string, StreamWindowWidget>; // 用于保存非全屏窗口的位置
  streamWindowGuard: boolean;
  darggingStreamUuid: string;
  transitionStreams: Map<string, boolean>;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  highUuids = new Set<string>();
  lowUuids = new Set<string>();

  streamWindowUpdatedFromRoom = false;

  static createEventHandler(scene: AgoraRteScene, store: StreamWindowUIStore) {
    if (SceneEventHandler._handlers[scene.sceneId]) {
      SceneEventHandler._handlers[scene.sceneId].removeEventHandlers();
    }
    const handler = new SceneEventHandler(scene, store);

    handler.addEventHandlers();

    SceneEventHandler._handlers[scene.sceneId] = handler;

    return SceneEventHandler._handlers[scene.sceneId];
  }

  static getEventHandler(scene: AgoraRteScene) {
    return SceneEventHandler._handlers[scene.sceneId];
  }

  static cleanup() {
    Object.keys(SceneEventHandler._handlers).forEach((k) => {
      SceneEventHandler._handlers[k].removeEventHandlers();
    });

    SceneEventHandler._handlers = {};
  }

  constructor(private _scene: AgoraRteScene, private _store: StreamWindowUIStore) {}

  @observable
  dataStore: DataStore = {
    streamWindowMap: new Map(),
    tempStreamWindowPosMap: new Map(),
    streamWindowGuard: false,
    darggingStreamUuid: '',
    transitionStreams: new Map(),
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action.bound
  private _handleRoomPropertiesChange = (
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) => {
    if (changedRoomProperties.includes('widgets')) {
      if (isEmpty(cause)) {
        this._store.handleWidgetInformationFromServer(roomProperties.widgets);
        this._store._setStreamWindowUpdate(true);
      } else {
        const {
          data: { actionType, widgetUuid },
        } = cause;

        // 当操作者角色为老师的话, 不为当前用户的话
        if (
          RteRole2EduRole(EduRoomTypeEnum.RoomBigClass, operator.role) ===
            EduRoleTypeEnum.teacher &&
          operator.userUuid !== EduClassroomConfig.shared.sessionInfo.userUuid
        ) {
          if (actionType === 2) {
            const widgetStreamWindowUuid = widgetUuid.match(/streamWindow-(.*)/);
            if (widgetStreamWindowUuid?.length) {
              const streamUuid = widgetStreamWindowUuid[1];
              this._store.removeStreamWindowByUuid(streamUuid);
            }
          }
          if (actionType === 1) {
            this._store.handleWidgetInformationFromServer(roomProperties.widgets);
          }
        }
      }
    }
  };
}
