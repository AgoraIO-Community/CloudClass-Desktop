import React, { CSSProperties, FC } from 'react';
import './index.css';
import { getNameColor, splitName } from './helper';

export type AvatarProps = {
  size?: number | string;
  textSize: number;
  nickName: string;
  borderRadius?: string;
  display?: string;
  style?: CSSProperties;
};

export const Avatar: FC<AvatarProps> = ({ size = '100%', textSize, nickName, borderRadius = "100%", display = "flex", style }) => {
  const color = getNameColor(nickName);
  const [first, last] = splitName(nickName);

  return (
    <div
      className="fcr-avatar"
      style={{ width: size, display, height: size, background: color, fontSize: textSize, borderRadius, ...style }}>
      <span>{`${first}${last}`}</span>
    </div>
  );
};
