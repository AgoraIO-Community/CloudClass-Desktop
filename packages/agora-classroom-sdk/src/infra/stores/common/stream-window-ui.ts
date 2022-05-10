import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';
import { action, computed, IReactionDisposer, observable, reaction } from 'mobx';
import { EduStreamUI, StreamBounds } from './stream/struct';
import { computedFn } from 'mobx-utils';
import { cloneDeep, debounce, forEach, isNaN } from 'lodash';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  RteRole2EduRole,
} from 'agora-edu-core';
import { widgetTrackStruct } from './type';
import { AGError, AgoraRteEventType, AgoraRteRemoteStreamType, bound } from 'agora-rte-sdk';
import { DraggableData } from 'react-draggable';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';

const SCALE = 0.5; // 大窗口默认与显示区域的比例
const ZINDEX = 2; // 大窗口默认的层级

const collisionContainerIDs = ['stage-container', 'aisde-streams-container'];

export function isNum(num: any): boolean {
  return typeof num === 'number' && !isNaN(num);
}

export interface StreamWindow {
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * view 层级关系
   */
  zIndex: number;
  /**
   * 是否填充到多视频区域
   */
  contain: boolean;
  userUuid: string;
}

export type StreamWindowBounds = Omit<StreamWindow, 'userUuid'>;

/**
 * streamWindow widget
 */
class StreamWindowWidget {
  @observable
  width: number;
  @observable
  height: number;
  @observable
  x: number;
  @observable
  y: number;
  /**
   * view 层级关系
   */
  @observable
  zIndex: number;
  /**
   * 是否填充到多视频区域
   */
  @observable
  contain: boolean;

  @observable
  userUuid: string;

  constructor({
    width,
    height,
    x,
    y,
    zIndex,
    contain,
    userUuid,
  }: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    zIndex?: number;
    contain?: boolean;
    userUuid?: string;
  }) {
    this.width = width || 0;
    this.height = height || 0;
    this.x = x || 0;
    this.y = y || 0;
    this.zIndex = zIndex || 2;
    this.contain = contain || false;
    this.userUuid = userUuid || '';
  }

  get infomation() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      zIndex: this.zIndex,
      contain: this.contain,
      userUuid: this.userUuid,
    };
  }

  set infomation({
    width,
    height,
    x,
    y,
    zIndex,
    contain,
    userUuid,
  }: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    zIndex?: number;
    contain?: boolean;
    userUuid?: string;
  }) {
    this.width = typeof width !== 'undefined' ? width : this.width;
    this.height = typeof height !== 'undefined' ? height : this.height;
    this.x = typeof x !== 'undefined' ? x : this.x;
    this.y = typeof y !== 'undefined' ? y : this.y;
    this.zIndex = zIndex ? zIndex : this.zIndex;
    this.contain = typeof contain !== 'undefined' ? contain : this.contain;
    this.userUuid = userUuid ? userUuid : this.userUuid;
  }
}

/**
 * 从服务端来的 widget 数据
 */
class WidgetInfo {
  state: 1 | 0;
  ownerUserUuid: string;
  position: {
    xaxis: number;
    yaxis: number;
  };
  size: {
    width: number;
    height: number;
  };
  extra: {
    contain: boolean;
    zIndex: number;
    userUuid: string;
  };

  constructor({
    position,
    size,
    extra,
    ownerUserUuid,
    state,
  }: {
    ownerUserUuid: string;
    position: {
      xaxis: number;
      yaxis: number;
    };
    size: {
      width: number;
      height: number;
    };
    extra: {
      contain: boolean;
      zIndex: number;
      userUuid: string;
    };
    state: 1 | 0;
  }) {
    this.state = state;
    this.position = position;
    this.size = size;
    this.ownerUserUuid = ownerUserUuid;
    this.extra = extra;
  }

  get infomation() {
    return {
      state: this.state,
      ownerUserUuid: this.ownerUserUuid,
      position: this.position,
      size: this.size,
      extra: this.extra,
    };
  }
}

/**
 * 计算 8 宫格布局
 * 当数量小于等于 3 的时候一行展示
 *
 *	 ┌───────┐
 *	 │   1   │
 *	 └───────┘
 *
 *	 ┌───────┬───────┐
 *	 │   1   │   2   │
 *	 └───────┴───────┘
 *
 *	 ┌───────┬───────┬───────┐
 *	 │   1   │   2   │   3   │
 *	 └───────┴───────┴───────┘
 *
 *
 *	 当数量大于3的时候
 *
 *	 ┌───────┬───────┐
 *	 │   3   │   4   │
 *	 ├───────┼───────┤
 *	 │   1   │   2   │
 *	 └───────┴───────┘
 *
 *	┌───────────┬───────────┐
 *	│     4     │     5     │
 *	├───────┬───┴───┬───────┤
 *	│   1   │   2   │   3   │
 *	└───────┴───────┴───────┘
 *
 *	┌───────┬───────┬───────┐
 *	│   4   │   5   │   6   │
 *	├───────┼───────┼───────┤
 *	│   1   │   2   │   3   │
 *	└───────┴───────┴───────┘
 *
 *	┌───────────┬─────────┬─────────┐
 *	│     5     │    6    │    7    │
 *	├───────┬───┴───┬─────┴─┬───────┤
 *	│   1   │   2   │   3   │   4   │
 *	└───────┴───────┴───────┴───────┘
 *
 *	┌───────┬───────┬───────┬───────┐
 *	│   5   │   6   │   7   │   8   │
 *	├───────┼───────┼───────┼───────┤
 *	│   1   │   2   │   3   │   4   │
 *	└───────┴───────┴───────┴───────┘
 *
 * @param length
 * @param width
 * @param height
 * @returns
 */
const calculateSize = (length: number, width: number, height: number) => {
  let rectSize: Array<Array<StreamWindowBounds>> = [];
  const baseLength = 3,
    maxRow = 2;
  if (!length) {
    return rectSize;
  }
  // 窗口不大于 3 的时候
  if (length <= baseLength) {
    const perWidth = width / length;
    let rect = Array(length).fill({});
    rect = rect.map((_, index) => {
      const perRect: StreamWindowBounds = {
        width: perWidth,
        height: height,
        x: index * perWidth,
        y: 0,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
    rectSize.push(rect as StreamWindowBounds[]);
    return rectSize;
  }

  // 窗口数大于 3 的时候
  if (length > baseLength) {
    const column = Math.ceil(length / maxRow),
      topColumn = length - column,
      bottomPerWidth = width / column,
      topPerWidth = width / topColumn,
      perHeight = height / maxRow;
    let topRects = Array(topColumn).fill({}),
      bottomRects = Array(column).fill({});
    topRects = topRects.map((value, index) => {
      const perRect: StreamWindowBounds = {
        width: topPerWidth,
        height: perHeight,
        x: index * topPerWidth,
        y: 0,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
    bottomRects = bottomRects.map((value, index) => {
      const perRect: StreamWindowBounds = {
        width: bottomPerWidth,
        height: perHeight,
        x: index * bottomPerWidth,
        y: height / 2,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });

    rectSize = [bottomRects, topRects];
  }
  return rectSize;
};

/**
 * 计算 9 宫格布局
 * 计算规则为 1^2  2^2 3^2
 */
const calculateSizeSquare = (length: number, width: number, height: number) => {
  let perCountsInRow = 1; // 当行最大数量
  let rectSize: Array<Array<StreamWindowBounds>> = [];
  if (length <= Math.pow(1, 2)) {
    perCountsInRow = 1;
  } else if (length <= Math.pow(2, 2)) {
    perCountsInRow = 2;
  } else if (length <= Math.pow(3, 3)) {
    perCountsInRow = 3;
  }
  const remainder = length % perCountsInRow; // 取余数
  const column = Math.floor(length / perCountsInRow); // 满行的行数
  const totalColumn = Math.ceil(length / perCountsInRow); // 总共的行数
  const perHeight = height / totalColumn; // 每项的高度
  const initialArr = Array(column).fill(Array(perCountsInRow).fill({}));

  remainder && initialArr.push([Array(remainder).fill({})]);

  rectSize = initialArr.map((line, lineIndex) => {
    return line.map((_: any, itemIndex: number, arr: any[]) => {
      const perWidth = width / arr.length;
      const perRect: StreamWindowBounds = {
        width: perWidth,
        height: perHeight,
        x: itemIndex * perWidth,
        y: (height * (totalColumn - lineIndex - 1)) / totalColumn,
        zIndex: 1,
        contain: true,
      };
      return perRect;
    });
  });

  return rectSize;
};

/**
 * 需要把 x, y 为可移动距离的比例
 * 最大有效移动范围（Maximum Effective Distance, MED）：在不超出教室布局的前提下，分别能够在 X 轴、Y 轴方向移动的最大距离
 * 移动偏移量：
 * @param rect
 */
const convertToWidgetTrackPos = (
  rect: StreamWindow,
  bigRect: { width: number; height: number },
) => {
  const { x, y, width, height } = rect;
  const { width: containerWidth, height: containerHeight } = bigRect;
  const MEDx = containerWidth - width,
    MEDy = containerHeight - height;
  let widgetx = x / MEDx,
    widgety = y / MEDy;
  const widgetWidth = width / containerWidth,
    widgetHeight = height / containerHeight;
  widgetx = isNaN(widgetx) ? 0 : widgetx;
  widgety = isNaN(widgety) ? 0 : widgety;
  return {
    position: {
      xaxis: widgetx,
      yaxis: widgety,
    },
    size: {
      width: widgetWidth,
      height: widgetHeight,
    },
    extra: {
      contain: rect.contain,
      zIndex: rect.zIndex,
    },
  };
};

/**
 * 把 widget 坐标转换为目前的用的坐标
 * @param rect
 * @param bigRect
 */
const convertToRelativePos = (
  rect: widgetTrackStruct,
  streamWindowRect: { width: number; height: number },
) => {
  const {
    position: { xaxis, yaxis },
    size: { width: widgetWidth, height: widgetHeight },
    extra,
  } = rect;
  const width = streamWindowRect.width * widgetWidth,
    height = streamWindowRect.height * widgetHeight;
  const posX = xaxis * (streamWindowRect.width - width);
  const posY = yaxis * (streamWindowRect.height - height);

  return {
    x: posX,
    y: posY,
    width,
    height,
    zIndex: extra.zIndex,
    contain: extra.contain,
  };
};
// stream window ui
export class StreamWindowUIStore extends EduUIStoreBase {
  private snapshotPostion = [0, 0]; // 视频第一次拉到区域内的point
  private streamWindowFirstOffset = [0, 0]; // 视频第一次拉到区域的偏移量
  private streamWindowUpdatedFromRooom = false; // 收到widget更新标志位

  protected _disposers: IReactionDisposer[] = [];

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

  @observable
  streamWindowMap: Map<string, StreamWindowWidget> = new Map();

  @observable
  tempStreamWindowPosMap: Map<string, StreamWindowWidget> = new Map(); // 用于保存非全屏窗口的位置

  @observable
  streamWindowGuard = false;

  @observable
  dragedStreamUuid = '';

  @observable
  transitionStreams: Map<string, boolean> = new Map();

  // @observable
  // streamsOnStage: EduStreamUI[] = [];
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
   *
   * 大窗视频显示区域
   */
  @observable
  streamWindowContainerBounds: StreamBounds = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
  };

  @computed
  get streamDragable() {
    return EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  }

  @computed get teacherStream(): EduStreamUI {
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
  get streamWindowUuids() {
    return this.streamWindowMap.keys();
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
    this.streamWindowMap.size &&
      this.streamWindowMap.forEach((value: StreamWindow, streamUuid: string) => {
        const x = value.x * this.streamWindowContainerBounds.width,
          y = value.y * this.streamWindowContainerBounds.height,
          width = value.width * this.streamWindowContainerBounds.width,
          height = value.height * this.streamWindowContainerBounds.height;
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
   * 返回没有在指定区域展示的 streams
   */
  @computed
  get streamsShouldOffPodium() {
    return this.studentStreams.filter(
      (value: EduStreamUI) => !this.streamWindowMap.has(value.stream.streamUuid),
    );
  }

  get needDragable() {
    return EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  }

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
   * 设置大窗显示区域
   * @param bounds
   */
  @action.bound
  setMiddleContainerBounds(bounds: StreamBounds) {
    this.streamWindowContainerBounds = bounds;
  }

  /**
   * for drag
   * @param param0
   */
  @action.bound
  setStreamDragInfomation = ({
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
    this.dragedStreamUuid = streamUuid; // 设置正在拖拽的视频流 ID
    // 如果在可操作区域的话， 创建一个大窗组件，并设置宽高，位置
    if (active && this._isMatchWindowContainer(pos[0], pos[1])) {
      this.streamWindowGuard = true;
      this._createStreamWindowByUuid(stream, pos);
    }

    // 如果现在结束了视频拖拽，并且鼠标的位置不在区域内，那么要移除数据
    if (!active && !this._isMatchWindowContainer(pos[0], pos[1])) {
      this.streamWindowGuard = false;
      this._removeStreamWindowByUuid(stream.stream.streamUuid);
    }

    // 如果结束了视频拖拽，并且鼠标在区域内，那么更新位置到远端
    if (!active && this._isMatchWindowContainer(pos[0], pos[1])) {
      this.sendWigetDataToServer(); // todo ⭐  发送单个 widget 数据
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
      x >= this.streamWindowContainerBounds.left &&
      x <= this.streamWindowContainerBounds.right &&
      y >= this.streamWindowContainerBounds.top &&
      y <= this.streamWindowContainerBounds.bottom
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
      this.snapshotPostion = pos;
      this._createStreamWindow(stream);
    }
  };

  @action.bound
  private _addStreamWindowByUuid = (streamUuid: string, info: StreamWindowWidget) => {
    const localUserUuid = EduClassroomConfig.shared.sessionInfo.userUuid;

    // 添加 streamwindow 的时候判断当前窗口数量
    if (this.streamWindowMap.size >= this.minRect.calculateCount) {
      this.shareUIStore.addToast(
        transI18n('toast2.stream_window_full', {
          reason: this.minRect.calculateCount,
        }),
      );
      return;
    }
    if (!this.streamWindowMap.has(streamUuid) && info.userUuid !== localUserUuid) {
      this.classroomStore.streamStore.setRemoteVideoStreamType(
        +streamUuid,
        AgoraRteRemoteStreamType.HIGH_STREAM,
      );
    }
    // 当宽高度小于最小宽高度的时候修改为最小宽高度
    const { width, height } = this.streamWindowContainerBounds;
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
  private _removeStreamWindowByUuid = (streamUuid: string) => {
    this.streamWindowMap.delete(streamUuid);
    this.classroomStore.streamStore.setRemoteVideoStreamType(
      +streamUuid,
      AgoraRteRemoteStreamType.LOW_STREAM,
    );
  };

  @action.bound
  private _initStreamWindowSize = () => {
    const { width, height } = this.streamWindowContainerBounds;
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
    // x, y 有待处理
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
    const width = this.streamWindowContainerBounds.width * SCALE,
      height = this.streamWindowContainerBounds.height * SCALE;

    const infomation = this.streamWindowMap.get(streamUuid) as StreamWindowWidget;
    const [offsetX, offsetY] = this.streamWindowFirstOffset;
    const [mouseX, mouseY] = pos;
    const [snapshotMouseX, snapshotMouseY] = this.snapshotPostion;

    const delta = [mouseX - snapshotMouseX, mouseY - snapshotMouseY];

    let [targetOffsetX, targetOffsetY] = [offsetX + delta[0], offsetY + delta[1]];

    // Keep x and y below right and bottom limits...
    if (isNum(this.streamWindowContainerBounds.right))
      targetOffsetX =
        Math.min(targetOffsetX + width, this.streamWindowContainerBounds.right) - width;
    if (isNum(this.streamWindowContainerBounds.bottom))
      targetOffsetY =
        Math.min(
          targetOffsetY + height,
          this.streamWindowContainerBounds.bottom - this.streamWindowContainerBounds.top,
        ) - height;

    // But above left and top limits.
    if (isNum(this.streamWindowContainerBounds.left))
      targetOffsetX = Math.max(targetOffsetX, this.streamWindowContainerBounds.left);
    if (isNum(this.streamWindowContainerBounds.top))
      targetOffsetY =
        Math.max(
          targetOffsetY + this.streamWindowContainerBounds.top,
          this.streamWindowContainerBounds.top,
        ) - this.streamWindowContainerBounds.top;

    targetOffsetX = targetOffsetX / this.streamWindowContainerBounds.width;
    targetOffsetY = targetOffsetY / this.streamWindowContainerBounds.height;

    this._addStreamWindowByUuid(
      stream.stream.streamUuid,
      new StreamWindowWidget({ ...infomation.infomation, x: targetOffsetX, y: targetOffsetY }),
    );
  };

  // 第一次从小视频拖拉下来的时候，需要手动计算显示区间
  private _setValidStreamWindowOffset = (streamWindowWidth: number, streamWindowHeight: number) => {
    const snapshotPostionX = this.snapshotPostion[0],
      snapshotPostionY = this.snapshotPostion[1]; // 进入大区域的时候的坐标
    const width = streamWindowWidth,
      height = streamWindowHeight;

    const streamWindowItems = {
      x: snapshotPostionX - width / 2,
      y: snapshotPostionY,
    };

    // Keep x and y below right and bottom limits...
    if (isNum(this.streamWindowContainerBounds.right))
      streamWindowItems.x =
        Math.min(streamWindowItems.x + width, this.streamWindowContainerBounds.right) - width;
    if (isNum(this.streamWindowContainerBounds.bottom))
      streamWindowItems.y =
        Math.min(streamWindowItems.y + height, this.streamWindowContainerBounds.bottom) - height;

    // But above left and top limits.
    if (isNum(this.streamWindowContainerBounds.left))
      streamWindowItems.x = Math.max(streamWindowItems.x, this.streamWindowContainerBounds.left);
    if (isNum(this.streamWindowContainerBounds.top))
      streamWindowItems.y = Math.max(streamWindowItems.y, this.streamWindowContainerBounds.top);
    this.streamWindowFirstOffset = [
      streamWindowItems.x,
      streamWindowItems.y - this.streamWindowContainerBounds.top,
    ];
    const offsetX = streamWindowItems.x / this.streamWindowContainerBounds.width;
    const offsetY =
      (streamWindowItems.y - this.streamWindowContainerBounds.top) /
      this.streamWindowContainerBounds.width;
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
    const infomation = this.streamWindowMap.get(streamUuid);
    infomation
      ? this._addStreamWindowByUuid(
          streamUuid,
          new StreamWindowWidget({
            ...infomation.infomation,
            x: typeof x !== 'undefined' ? x / this.streamWindowContainerBounds.width : infomation.x,
            y:
              typeof y !== 'undefined' ? y / this.streamWindowContainerBounds.height : infomation.y,
            width: width ? width / this.streamWindowContainerBounds.width : infomation.width,
            height: height ? height / this.streamWindowContainerBounds.height : infomation.height,
            zIndex: zIndex ? zIndex : infomation.zIndex,
            contain: typeof contain !== 'undefined' ? contain : infomation.contain,
          }),
        )
      : this._addStreamWindowByUuid(
          streamUuid,
          new StreamWindowWidget({
            x: typeof x !== 'undefined' ? x / this.streamWindowContainerBounds.width : 0,
            y: typeof y !== 'undefined' ? y / this.streamWindowContainerBounds.height : 0,
            width: width ? width / this.streamWindowContainerBounds.width : 0,
            height: height ? height / this.streamWindowContainerBounds.height : 0,
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
      currentStreamWindow.infomation = { contain: true };
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
        currentStreamWindow.infomation = bounds;
        this._addStreamWindowByUuid(streamUuid, currentStreamWindow);
      }
      this._handleCalculateContains();
      this.sendWigetDataToServer();
      return;
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
        const infomation = this.streamWindowMap.get(streamUuid) as StreamWindowWidget;
        infomation.infomation = size;
        this._addStreamWindowByUuid(streamUuid, infomation);
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
    const infomation = this.streamWindowMap.get(stream.stream.streamUuid) as StreamWindowWidget;
    if (infomation.contain) {
      return;
    }
    if (infomation && infomation?.zIndex <= maxZindex) {
      infomation.infomation = { zIndex: maxZindex + 1 };
      this._addStreamWindowByUuid(stream.stream.streamUuid, infomation);
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
        this.handleStreamWindowContain(stream);
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

  @action.bound
  private _handleRoomPropertiesChange = (
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
  ) => {
    if (changedRoomProperties.includes('widgets')) {
      for (const id of this.streamWindowMap.keys()) {
        if (!roomProperties.widgets[`streamWindow-${id}` as unknown as string]) {
          this._removeStreamWindowByUuid(id);
          this.streamWindowUpdatedFromRooom = true;
        }
      }

      forEach(roomProperties.widgets, (value: widgetTrackStruct, key) => {
        const widgetStreamWindowUuid = key.match(/streamWindow-(.*)/);
        if (widgetStreamWindowUuid?.length) {
          const streamUuid = widgetStreamWindowUuid[1];
          const { extra, size } = value;
          const hasTrack = this.streamWindowMap.has(`${streamUuid}`);

          if (extra?.operatorUuid === EduClassroomConfig.shared.sessionInfo.userUuid && hasTrack) {
            return;
          }

          if (!hasTrack || extra?.operatorUuid !== EduClassroomConfig.shared.sessionInfo.userUuid) {
            const streamWindowValue = this._decodeWidgetRect(value);
            size &&
              this._setStreamWindowMap(`${streamUuid}`, {
                ...streamWindowValue,
                userUuid: value.extra.userUuid,
              });
          }
        }
      });
      this.streamWindowUpdatedFromRooom = true;
    }
  };

  /**
   * 只处理学生流
   */
  @action.bound
  private _handleOnOrOffPodium() {
    const { roomType } = EduClassroomConfig.shared.sessionInfo;
    const newStreams = this.studentStreams.filter(
      (value: EduStreamUI) => !this.streamWindowMap.has(value.stream.streamUuid),
    );
    const deleteStreams: string[] = [];
    this.streamWindowMap.forEach((value: StreamWindowWidget, streamUuid: string) => {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);

      if (!stream) {
        // !this.studentStreams.find((value: EduStreamUI) => value.stream.streamUuid === streamUuid) &&
        deleteStreams.push(streamUuid);
      }
    });

    newStreams.forEach((value: EduStreamUI) => {
      const streamUuid = value.stream.streamUuid;
      const streamWindow = new StreamWindowWidget({ userUuid: value.stream.fromUser.userUuid });
      const bounds = this._getTempStreamWindowPosCache(streamUuid);
      streamWindow.infomation = bounds;
      this._addStreamWindowByUuid(streamUuid, streamWindow);
    });

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
        this._handleToggleTeacherStreamWindow(args.visible);
        break;
      case AgoraEduClassroomUIEvent.hiddenStage:
        this._handleOffPodium();
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
        currentStreamWindow.infomation = bounds;

        this._addStreamWindowByUuid(streamUuid, currentStreamWindow);
      }
    } else {
      if (this.teacherStream) {
        const contain = this.streamWindowMap.get(this.teacherStream.stream.streamUuid)?.contain;
        this._removeStreamWindowByUuid(this.teacherStream.stream.streamUuid);
        this._deleteStreamWindowWidegtToServer(this.teacherStream.stream.streamUuid);
        contain && this._handleCalculateContains(); // 如果之前为全屏那么重新计算
      }
    }
    this.sendWigetDataToServer();
  }

  /**
   * 发送数据到远端，teacher only
   */
  sendWigetDataToServer = debounce(() => {
    const { role } = EduClassroomConfig.shared.sessionInfo;
    if (role === EduRoleTypeEnum.teacher) {
      const widgetsData = this._encodeWidgetRect();
      widgetsData.forEach((value, streamUuid) => {
        const widgetUuid = `streamWindow-${streamUuid}`;
        this.classroomStore.widgetStore.updateWidget(widgetUuid, value);
      });
    }
  }, 330);

  /**
   * 删除 widget streamwindow
   * @param widgetUuid
   */
  private _deleteStreamWindowWidegtToServer = (streamUuid: string) => {
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      // this.classroomStore.api.deleteWidgetProperties(roomUuid, `streamWindow-${streamUuid}`, {});
      this.classroomStore.widgetStore.deleteWidget(`streamWindow-${streamUuid}`);
    }
  };
  @bound
  handleDrag(e: any, data: DraggableData, streamUuid: string, offsetX: number) {
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
  handleStreamWindowInfo = (
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
  ) => {
    this._setStreamWindowMap(stream, streamWindowInfo);
    this._handleTempStreamWindowMap();
    sendToServer && this.sendWigetDataToServer();
  };

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
  private _encodeWidgetRect = () => {
    const { width, height } = this.streamWindowContainerBounds;
    const streamWidgetMap: Map<string, WidgetInfo> = new Map();
    this.streamWindowMap.size &&
      this.streamWindowRealBoundsMap.forEach((value: StreamWindow, streamWindowUuid: string) => {
        const perStreamWindow = convertToWidgetTrackPos(value, {
          width,
          height,
        }) as widgetTrackStruct;
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
  };

  /**
   * 转换 widget 坐标方式
   * @param widgetProps
   * @returns
   */
  private _decodeWidgetRect = (widgetProps: widgetTrackStruct) => {
    const { width, height } = this.streamWindowContainerBounds;
    const widgetInfomation = convertToRelativePos(widgetProps, { width, height });
    return widgetInfomation;
  };

  private _createNewTempStreamWindow() {
    const size = this.streamWindowMap.size;
    const width = 0.135,
      height = 0.16,
      offset = 0.009; // 根据设计稿比例

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

  // /**
  //  * 在讲台上的学生 stream
  //  * @param streams
  //  */
  // @action.bound
  // handleStreamsOnStageUpdate(streams: EduStreamUI[]) {
  //   this.streamsOnStage = streams;
  // }

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

  onInstall() {
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
          }
        },
      ),
    );

    this._disposers.push(
      // 只控制上下台逻辑的变更
      reaction(
        () => this.studentStreams,
        () => {
          // if (typeof this.classroomStore.roomStore.flexProps.stage === 'undefined') return; // 如果没有讲台关闭的属性，那么不处理
          if (EduClassroomConfig.shared.sessionInfo.roomType == EduRoomTypeEnum.Room1v1Class)
            return;
          if (!this.stageVisible && this.streamWindowUpdatedFromRooom) {
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
        () => this.streamWindowUuids,
        () => {
          EduEventUICenter.shared.emitClassroomUIEvents(
            AgoraEduClassroomUIEvent.streamWindowsChange,
            [...this.streamWindowUuids],
          );
        },
      ),
    );
    EduEventUICenter.shared.onClassroomUIEvents(this._handleClassroomUIEvents);
  }

  onDestroy() {
    EduEventUICenter.shared.offClassroomUIEvents(this._handleClassroomUIEvents);
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
