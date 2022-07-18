import Plyr from 'plyr';
import { FcrStreamMediaPlayerWidget } from '../index';
import { throttle } from 'lodash';
import { bound } from 'agora-rte-sdk';
import { reaction } from 'mobx';

export class PlayerSync {
  private _player: Plyr | null = null;
  private _isBuffering: boolean = false;
  private _disposer: (() => void) | null = null;
  constructor(private _widget: FcrStreamMediaPlayerWidget) {}
  get isOwner() {
    return this._widget.state?.operatorId === this._widget.operatorId;
  }
  get controlled() {
    return this._widget.hasPrivilege;
  }
  setupPlayer(player: Plyr) {
    this._player = player;
    this._player?.once('ready', this.addListeners);
  }
  @bound
  addListeners() {
    this._player?.on('ended', () => {
      this._player?.stop();
      this.isOwner && this.send({ isPlaying: false, currentTime: 0 });
    });
    this._player?.on('waiting', () => {
      this._isBuffering = true;
    });
    this._player?.on('playing', () => {
      this._isBuffering = false;
    });
    this._player?.on(
      'timeupdate',
      throttle(() => {
        const currentTime = this._player?.currentTime;
        this.isOwner && this.send({ currentTime, isPlaying: !this._player?.paused });
      }, 5000),
    );
    this._player?.on('volumechange', () => {
      this.isOwner && this.send({ volume: this._player?.volume });
    });
    this._player?.on('play', () => {
      const currentTime = this._player?.currentTime;

      this.isOwner && this.send({ isPlaying: true, currentTime });
    });
    this._player?.on('pause', () => {
      this.isOwner && this.send({ isPlaying: false });
    });

    const controlsEle = this._player?.elements.controls;
    const playEle = Array.isArray(this._player?.elements.buttons.play)
      ? this._player?.elements.buttons?.play?.[0]
      : this._player?.elements.buttons.play;
    const seekEle = controlsEle?.querySelector('input[data-plyr="seek"]') as HTMLInputElement;
    const muteEle = controlsEle?.querySelector('button[data-plyr="mute"]') as HTMLButtonElement;
    const volumeEle = controlsEle?.querySelector('input[data-plyr="volume"]') as HTMLInputElement;

    playEle?.addEventListener('click', () => {
      this.sendOwner({ isPlaying: !this._player?.paused });
    });

    seekEle?.addEventListener('change', () => {
      const currentTime = this._player?.currentTime;
      this.sendOwner({ currentTime });
    });

    muteEle?.addEventListener('click', () => {
      this.sendOwner();
    });

    volumeEle?.addEventListener('change', () => {
      this.sendOwner();
    });
    this.syncPlayer();
    this._disposer = reaction(
      () => this._widget.state,
      () => {
        if (this.isOwner) return;
        this.syncPlayer();
      },
    );
  }
  syncPlayer() {
    if (!this._player) return;
    if (Math.abs((this._widget.state?.currentTime || 0) - (this._player?.currentTime || 0)) > 3) {
      if (!this._isBuffering) {
        this._player.currentTime = this._widget.state?.currentTime || 0;
      }
    }
    if (this._widget.state?.isPlaying !== undefined) {
      this._widget.state?.isPlaying ? this._player?.play() : this._player?.pause();
    }

    if (this._widget.state?.volume) {
      const currentVolume = this._player?.volume;
      if (currentVolume !== this._widget.state?.volume)
        this._player.volume = this._widget.state?.volume;
    }
    if (this._widget.state?.isMuted !== undefined) {
      this._player.muted = this._widget.state?.isMuted;
    }
  }
  send(extra: Partial<FcrStreamMediaPlayerWidget['state']>) {
    this._widget.updateWidgetProperties({
      extra,
    });
  }
  sendOwner(extra?: Partial<FcrStreamMediaPlayerWidget['state']>) {
    if (!this.isOwner) {
      this.controlled && this.send({ operatorId: this._widget.operatorId, ...extra });
    }
  }
  destroy() {
    this._disposer?.();
    return new Promise((resolve) => {
      this._player?.destroy(resolve);
    });
  }
}
