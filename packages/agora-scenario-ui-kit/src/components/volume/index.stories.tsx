import React, { useState, useEffect } from 'react';
import { Meta } from '@storybook/react';
import { Volume, AudioVolume } from '../volume';

const meta: Meta = {
  title: 'Components/Volume',
  component: Volume,
};

type DocsProps = {
  width: number;
  height: number;
  currentVolume: number;
  maxLength: number;
};

export const Docs = ({ width, height, currentVolume, maxLength }: DocsProps) => (
  <div className="mt-4">
    <Volume width={width} height={height} currentVolume={currentVolume} maxLength={maxLength} />
  </div>
);

export const AudioVolumeDocs = () => {
  const [currentVolume, setCurrentVolume] = useState(0);
  let timer;
  useEffect(() => {
    timer = setInterval(() => {
      const number = (Math.random() * 100) | 0;
      setCurrentVolume(number);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <>
      <div>
        <span>no volume</span>
        <AudioVolume />
      </div>
      <div>
        <span>has volume</span>
        <AudioVolume currentVolume={currentVolume} />
      </div>
      <div>
        <span>isMicMuted</span>
        <AudioVolume isMicMuted />
      </div>
    </>
  );
};

Docs.args = {
  width: 3,
  height: 12,
  currentVolumn: 0,
  maxLength: 20,
};

export default meta;
