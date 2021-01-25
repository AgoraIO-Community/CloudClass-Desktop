import React, { useRef } from 'react';
import {t} from '@/i18n';
import { observer } from 'mobx-react';
import { useBoardStore } from '@/hooks';

export const UploadBtn: React.FC<any> = observer(() => {

  const ImageInput = useRef<any>(null);
  const DynamicInput = useRef<any>(null);
  const StaticInput = useRef<any>(null);
  const AudioVideoInput = useRef<any>(null);

  const boardStore = useBoardStore()

  const uploadDynamic = async (event: any) => {
    try {
      boardStore.setTool('')
      const file = event.currentTarget.files[0];
      await boardStore.uploadDynamicPPT(file)
    } finally {
      if (DynamicInput.current) {
        DynamicInput.current.value = ''
      }
    }
  }

  const uploadStatic = async (event: any) => {
    try {
      boardStore.setTool('')
      const file = event.currentTarget.files[0];
      await boardStore.uploadStaticFile(file)
    } finally {
      if (StaticInput.current) {
        StaticInput.current.value = ''
      }
    }
  }

  const uploadImage = async (event: any) => {
    try {
      boardStore.setTool('')
      const file = event.currentTarget.files[0];
      await boardStore.uploadImage(file)
    } finally {
      if (ImageInput.current) {
        ImageInput.current.value = ''
      }
    }
  }

  const uploadAudioVideo = async (event: any) => {
    try {
      boardStore.setTool('')
      const file = event.currentTarget.files[0];
      await boardStore.uploadAudioVideo(file)
    } finally {
      if (AudioVideoInput.current) {
        AudioVideoInput.current.value = ''
      }
    }
  }

  return (
    <div className="upload-btn">
      <div className="upload-items">
        <label htmlFor="upload-image">
          <div className="upload-image-resource"></div>
          <div className="text-container">
            <div className="title">{t('upload_picture')}</div>
            <div className="description">bmp, jpg, png, gif</div>
          </div>
        </label>
        <input ref={ImageInput} id="upload-image" accept="image/*,.bmp,.jpg,.png,.gif"
          onChange={uploadImage} type="file"></input>
      </div>
      <div className="slice-dash"></div>
      <div className="upload-items">
        <label htmlFor="upload-dynamic">
          <div className="upload-dynamic-resource"></div>
          <div className="text-container">
            <div className="title">{t('convert_webpage')}</div>
            <div className="description">pptx</div>
          </div>
        </label>
        <input ref={DynamicInput} id="upload-dynamic" accept=".pptx" onChange={uploadDynamic} type="file"></input>
      </div>
      <div className="slice-dash"></div>
      <div className="upload-items">
        <label htmlFor="upload-static">
          <div className="upload-static-resource"></div>
          <div className="text-container">
            <div className="title">{t('convert_to_picture')}</div>
            <div className="description">pptx, word, pdf support</div>
          </div>
        </label>
        <input ref={StaticInput} id="upload-static" accept=".doc,.docx,.ppt,.pptx,.pdf" onChange={uploadStatic} type="file"></input>
      </div>
      <div className="slice-dash"></div>
      <div className="upload-items">
        <label htmlFor="upload-video">
          <div className="upload-static-resource"></div>
          <div className="text-container">
            <div className="title">{t('upload_audio_video')}</div>
            <div className="description">mp4,mp3</div>
          </div>
        </label>
        <input ref={AudioVideoInput} id="upload-video" accept=".mp4,.mp3" onChange={uploadAudioVideo} type="file"></input>
      </div>
    </div>
  )
})