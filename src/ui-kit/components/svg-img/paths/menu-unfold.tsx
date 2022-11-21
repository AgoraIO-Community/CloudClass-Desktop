import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary, iconSecondary }: PathOptions) => (
  <>
    <g filter="url(#filter0_d_640_2427)">
      <path
        d="M22 56L11.17 49.2313C7.95382 47.2211 6 43.696 6 39.9033L6 21.5425C6 18.0946 7.77619 14.8899 10.7 13.0625L22 6L22 56Z"
        fill={iconPrimary}
      />
    </g>
    <path
      d="M22 56L11.17 49.2313C7.95382 47.2211 6 43.696 6 39.9033L6 21.5425C6 18.0946 7.77619 14.8899 10.7 13.0625L22 6L22 56Z"
      fill={iconPrimary}
    />
    <path d="M11.5 31L16.5 36L16.5 26L11.5 31Z" fill={iconSecondary} />
    <defs>
      <filter
        id="filter0_d_640_2427"
        x="0"
        y="0"
        width="32"
        height="66"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dx="2" dy="2" />
        <feGaussianBlur stdDeviation="4" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.184314 0 0 0 0 0.254902 0 0 0 0 0.572549 0 0 0 0.150744 0"
        />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_640_2427" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_640_2427"
          result="shape"
        />
      </filter>
    </defs>
  </>
);

export const viewBox = '0 0 28 62';
