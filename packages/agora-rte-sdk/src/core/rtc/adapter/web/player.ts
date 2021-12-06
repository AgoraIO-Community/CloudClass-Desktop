import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '../../../decorator/type';
import { Logger } from '../../../logger';
import { AgoraMediaControlEventType } from '../../../media/control';
import { Scheduler } from '../../../schedule';
import { Duration, Task } from '../../../schedule/scheduler';
import { AGEventEmitter } from '../../../utils/events';

declare global {
  interface Window {
    webkitAudioContext: AudioContext;
  }
}

export class AGWebAudioPlayer extends AGEventEmitter {
  protected logger!: Injectable.Logger;
  private _audioContext?: AudioContext;
  private _audioTagId: string = uuidv4();
  private _playingSourceNode?: MediaElementAudioSourceNode;
  private _analyserNode?: AnalyserNode;
  private _volumePollingTask?: Task;

  constructor() {
    super();
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this._audioContext = new AudioContext();
      this._analyserNode = this._audioContext.createAnalyser();
      this._analyserNode.smoothingTimeConstant = 0.3;
      this._analyserNode.fftSize = 1024;
    } catch (e) {
      Logger.error(`[audio player] initialize audio context failed ${e}.`);
    }
  }

  private _getAudioVirtualDom(): HTMLAudioElement | undefined {
    if (document) {
      let audioElement = document.getElementById(this._audioTagId) as HTMLAudioElement;
      if (!audioElement) {
        let dom = document.createElement('audio');
        dom.id = this._audioTagId;
        dom.hidden = true;
        document.body.appendChild(dom);
        audioElement = dom;
      }
      return audioElement;
    }
    Logger.error(`[audio player] audio element creation failed.`);
  }

  play(url: string) {
    //stop first if already playing
    this.stop();

    let audioContext = this._audioContext;
    let dom = this._getAudioVirtualDom();
    if (dom && audioContext) {
      const node = audioContext.createMediaElementSource(dom);
      node.connect(audioContext.destination);
      dom.src = url;

      if (this._analyserNode) {
        let analyser = this._analyserNode;
        node.connect(analyser);
        const pcmData = new Float32Array(analyser.fftSize);
        this._volumePollingTask = Scheduler.shared.addPollingTask(() => {
          analyser.getFloatTimeDomainData(pcmData);
          let sumSquares = 0.0;
          for (const amplitude of pcmData) {
            sumSquares += amplitude * amplitude;
          }
          let value = Math.sqrt(sumSquares / pcmData.length);
          this.emit(
            AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator,
            Math.min(value, 1),
          );
        }, Duration.second(0.2));
      }

      dom.addEventListener('ended', () => {
        this.stop();
      });

      this._playingSourceNode = node;
      dom.play();
    } else {
      Logger.error(`[audio player] start audio playback test failed.`);
    }
  }

  stop() {
    let audioContext = this._audioContext;
    let dom = this._getAudioVirtualDom();
    if (dom && audioContext) {
      dom.pause();
      dom.currentTime = 0;
      if (this._analyserNode) {
        try {
          this._playingSourceNode?.disconnect(this._analyserNode);
        } catch (e) {
          Logger.warn(`[audio player] failed to detach analyser node`);
        }
      }
      if (this._audioContext) {
        try {
          this._playingSourceNode?.disconnect(audioContext.destination);
        } catch (e) {
          Logger.warn(`[audio player] failed to detach audio context`);
        }
      }

      this._volumePollingTask?.stop();
      this._volumePollingTask = undefined;
      dom.remove();
      //emit additional 0 volume as end
      this.emit(AgoraMediaControlEventType.localAudioPlaybackVolumeIndicator, 0);
    }
  }
}
