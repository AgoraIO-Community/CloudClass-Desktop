import { EduClassroomStore } from '../..';
import { Track } from './struct';
import { Dimensions, Point, TrackContext } from './type';
import { bound, Lodash, Log } from 'agora-rte-sdk';
import { action, observable, reaction, toJS } from 'mobx';
import { forEach } from 'lodash';
import { TrackState } from '../room/type';
import { EduStoreBase } from '../base';

@Log.attach({ proxyMethods: false })
export class TrackStore extends EduStoreBase {
  @observable
  trackByWidgetId: Map<string, Track> = new Map();

  private _context?: TrackContext;

  constructor(store: EduClassroomStore) {
    super(store);

    reaction(() => this.classroomStore.roomStore.widgetsTrackState, this.updateTrackMap);
  }

  @bound
  initialize(context: TrackContext) {
    this._context = context;
  }

  @bound
  reposition() {
    this.trackByWidgetId.forEach((track) => {
      track.reposition();
    });
  }

  @action.bound
  setTrackById(
    trackId: string,
    end: boolean,
    pos: Point & { real: boolean },
    dimensions?: Dimensions & { real: boolean },
    options?: {
      needTransition?: boolean;
      initial?: boolean;
    },
  ) {
    const hasTrack = this.trackByWidgetId.has(trackId);

    if (!hasTrack) {
      this.trackByWidgetId.set(trackId, new Track(this._context!));
    }

    const track = this.trackByWidgetId.get(trackId)!;

    // if (!track) {
    //   this.logger.warn('Cannot find set track state with a invalid track id:', trackId);
    //   return;
    // }

    if (pos.real) {
      track.setRealPos(pos, options?.needTransition);
    } else {
      track.setRatioPos(pos, options?.needTransition);
    }

    if (dimensions) {
      if (dimensions.real) {
        track.setRealDimensions(dimensions, options?.needTransition);
      } else {
        track.setRatioDimensions(dimensions, options?.needTransition);
      }
    }

    // track.setReal(pos, dimensions || track.realVal.dimensions);

    // track.setRatio(pos, dimensions || track.realVal.dimensions);

    if (end) {
      const rollback = () => {
        if (!hasTrack) {
          this.trackByWidgetId.delete(trackId);
        }
      };

      this.updateWidgetTrack(
        trackId,
        track.ratioVal.ratioPosition,
        track.ratioVal.ratioDimensions,
      ).catch(rollback);
    }
  }

  setTrackDimensionsById(trackId: string, dimensions: Dimensions & { real: boolean }) {
    const track = this.trackByWidgetId.get(trackId)!;

    if (!track) {
      this.logger.warn('Cannot find set track state with a invalid track id:', trackId);
      return;
    }

    if (dimensions.real) {
      track.setRealDimensions(dimensions);
    } else {
      track.setRatioDimensions(dimensions);
    }
  }

  @action.bound
  deleteTrackById(trackId: string) {
    this.trackByWidgetId.delete(trackId);
    this.classroomStore.roomStore.deleteWidgetTrackState(trackId);
  }

  @action.bound
  private updateTrackMap(trackState: TrackState) {
    // delete items which not existed in track state
    for (let id of this.trackByWidgetId.keys()) {
      if (!trackState[id as unknown as string]) {
        this.logger.info('Delete track', toJS(this.trackByWidgetId.get(id)));
        this.trackByWidgetId.delete(id as unknown as string);
      }
    }

    // update track with new position & dimensions
    forEach(Object.keys(trackState), (id) => {
      if (!this.trackByWidgetId.has(id)) {
        this.trackByWidgetId.set(id, new Track(this._context!));
      }

      let track = this.trackByWidgetId.get(id);

      const { position, size } = trackState[id];

      if (!track || !position || !size) {
        this.logger.warn('Cannot find track state with a invalid track id:', id);
        return;
      }

      track.setRatio(
        {
          x: position.xaxis,
          y: position.yaxis,
        },
        {
          width: size.width,
          height: size.height,
        },
        true,
      );

      this.logger.info('Update track ratio', toJS(position), toJS(size));
      this.logger.info(
        'Update track real',
        toJS(track.realVal.position),
        toJS(track.realVal.dimensions),
      );
    });
  }

  @Lodash.throttled(200, { leading: true })
  async updateWidgetTrack(widgetId: string, position: Point, size: Dimensions, initial?: boolean) {
    this.classroomStore.roomStore.updateWidgetTrackState(widgetId, {
      position: { xaxis: position.x, yaxis: position.y },
      size: { width: size.width, height: size.height },
      extra: { initial },
    });
  }

  onDestroy(): void {}
  onInstall(): void {}
}
