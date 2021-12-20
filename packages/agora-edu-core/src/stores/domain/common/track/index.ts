import { EduClassroomStore } from '../..';
import { Track } from './struct';
import { Dimensions, Point, TrackAdapter, TrackContext } from './type';
import { bound, Lodash, Log } from 'agora-rte-sdk';
import { action, observable, reaction, toJS } from 'mobx';
import { forEach } from 'lodash';
import { TrackState } from '../room/type';
import { EduStoreBase } from '../base';

@Log.attach({ proxyMethods: false })
export class TrackStore extends EduStoreBase {
  @observable
  trackById: Map<string, Track> = new Map();

  private _context?: TrackContext;

  constructor(
    store: EduClassroomStore,
    private _trackAdapter: TrackAdapter,
    private _posOnly?: boolean,
  ) {
    super(store);

    reaction(() => _trackAdapter.trackState, this.updateTrackMap);
  }

  @bound
  setTrackContext(context: TrackContext) {
    this._context = context;
  }

  @bound
  reposition() {
    this.trackById.forEach((track) => {
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
    const hasTrack = this.trackById.has(trackId);

    if (!hasTrack) {
      this.trackById.set(trackId, new Track(this._context!, this._posOnly));
    }

    const track = this.trackById.get(trackId)!;

    if (dimensions) {
      if (dimensions.real) {
        track.setRealDimensions(dimensions, options?.needTransition);
      } else {
        track.setRatioDimensions(dimensions, options?.needTransition);
      }
    }

    if (pos.real) {
      track.setRealPos(pos, options?.needTransition);
    } else {
      track.setRatioPos(pos, options?.needTransition);
    }

    if (end) {
      const rollback = () => {
        if (!hasTrack) {
          this.trackById.delete(trackId);
        }
      };

      this.updateTrack(trackId, track.ratioVal.ratioPosition, track.ratioVal.ratioDimensions).catch(
        rollback,
      );
    }
  }

  @Lodash.throttled(200, { trailing: true })
  async updateTrack(trackId: string, position: Point, size: Dimensions, initial?: boolean) {
    this._trackAdapter.updateTrackState(trackId, {
      position: { xaxis: position.x, yaxis: position.y },
      size: { width: size.width, height: size.height },
      extra: { initial, userUuid: this.classroomStore.roomStore.userUuid },
    });
  }

  setTrackLocalDimensionsById(trackId: string, dimensions: Dimensions & { real: boolean }) {
    const track = this.trackById.get(trackId)!;

    if (!track) {
      this.logger.warn('Cannot find track state with a invalid track id:', trackId);
      return;
    }

    if (dimensions.real) {
      track.setRealDimensions(dimensions);
    } else {
      track.setRatioDimensions(dimensions);
    }

    track.reposition();

    track.fixLocalPos();

    // this function just modifies track's local state. Use to keep RND size with Extapp's inner size
  }

  @action.bound
  deleteTrackById(trackId: string) {
    this.trackById.delete(trackId);
    this._trackAdapter.deleteTrackState(trackId);
  }

  @action.bound
  private updateTrackMap(trackState: TrackState) {
    // delete items which not existed in track state
    for (let id of this.trackById.keys()) {
      if (!trackState[id as unknown as string]) {
        this.logger.info('Delete track', toJS(this.trackById.get(id)));
        this.trackById.delete(id as unknown as string);
      }
    }

    // update track with new position & dimensions
    forEach(Object.keys(trackState), (id) => {
      const hasTrack = this.trackById.has(id);

      const { position, size, extra } = trackState[id];

      if (!hasTrack && position) {
        this.trackById.set(id, new Track(this._context!, this._posOnly));
      }

      let track = this.trackById.get(id);

      if (!track || !position) {
        this.logger.warn('Cannot find track state with a invalid track id:', id);
        return;
      }

      if (extra?.userUuid === this.classroomStore.roomStore.userUuid && hasTrack) {
        this.logger.info('Skip self track update');
        return;
      }

      if (size) {
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
      } else {
        track.setRatioPos(
          {
            x: position.xaxis,
            y: position.yaxis,
          },
          true,
        );
      }

      track.fixLocalPos();

      this.logger.info('Update track ratio', toJS(position), toJS(size));
      this.logger.info(
        'Update track real',
        toJS(track.realVal.position),
        toJS(track.realVal.dimensions),
      );
    });
  }

  onDestroy(): void {}
  onInstall(): void {}
}
