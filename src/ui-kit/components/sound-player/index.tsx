import { FC, useRef, useEffect } from 'react';

type Props = {
  url: string;
};

export const SoundPlayer: FC<Props> = ({ url }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = new Audio(url);
    audioElement.play();
    audioRef.current = audioElement;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return null;
};
