import React, { useState, useRef } from 'react'
import { observer } from "mobx-react";
import VoiceVolume from '@/components/volume/voice';
import SpeakerVolume from '@/components/volume/speaker';
import { useInterval } from 'react-use';
import {CustomButton} from '@/components/custom-button';
import { useDeviceStore, useUIStore } from '@/hooks';
import { t } from '@/i18n';

export const SpeakerPage = observer((props: any) => {

  const deviceStore = useDeviceStore()
  const uiStore = useUIStore()
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [audioTestisPlaying, setAudioTestisPlaying] = useState<boolean>(false);

  const audio_url = 'https://webdemo.agora.io/test_audio.mp3'

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useInterval(() => {
    if (audioRef.current) {
      if (audioTestisPlaying) {
        const volume = audioRef.current.volume
        setVolumeLevel(volume)
      } else {
        setVolumeLevel(0)
      }
    }
  }, 300);

  const stopPlay = (current: HTMLAudioElement) => {
    if (current) {
      current.pause()
      current.currentTime = 0
    }
  }

  const handleClick = () => {
    if (audioRef.current) {
      if (audioTestisPlaying) {
        stopPlay(audioRef.current)
        setAudioTestisPlaying(false)
      } else {
        audioRef.current.volume = deviceStore.playbackVolume / 100
        audioRef.current.play()
        setAudioTestisPlaying(true)
      }
    }
  }

  const changeSpeakerVolume = (volume: any) => {
    if (audioRef.current) {
      const audioVolume = volume / 100;
      audioRef.current.volume = audioVolume;
    }
    deviceStore.changePlaybackVolume(volume);
  };

  const onOk = () => {
    if (audioRef.current) {
      stopPlay(audioRef.current)
    }
    deviceStore.setSpeakerTestResult('ok')
    deviceStore.setActiveItem('test')
  }

  const onNo = () => {
    if (audioRef.current) {
      stopPlay(audioRef.current)
    }
    deviceStore.setSpeakerTestResult('error')
    deviceStore.setActiveItem('test')
  }

  return (
    <div className="device-page-container">
      <div>
        <div className="items-row">
          <div>
            <VoiceVolume totalVolumes={110} hideIcon={true} volume={volumeLevel} />
          </div>
          <div>
            <SpeakerVolume
              totalVolume={255}
              hideIcon={true}
              siderClassName={'maximum-sider'}
              volume={deviceStore.playbackVolume}
              onChange={changeSpeakerVolume}
            />
            音量: {deviceStore.playbackVolume}
          </div>
        </div>
      </div>
      <div className="footer">
        <div className={audioTestisPlaying ? "pause-icon" : "play-icon"}
          onClick={handleClick}>
          <audio id="audio" src={audio_url} ref={audioRef} />
        </div>
        <span className="margin-top-30">{audioTestisPlaying ? t('device.is_hear'): t('device.click_play')}</span>
        {audioTestisPlaying ? 
        <div className="button-group">
          <div className="items-row">
            <CustomButton onClick={onNo} className="unconfirm custom-button" name={t('device.no')} />
            <CustomButton onClick={onOk} name={t('device.yes')} />
          </div>
        </div> : null}
      </div>
    </div>
  )
})