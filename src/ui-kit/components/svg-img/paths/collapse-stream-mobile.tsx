import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary }: PathOptions) => (
  <>
    <g filter="url(#filter0_d_2329_31235)">
      <path
        d="M8 7L18.4189 10.473C19.4452 10.8151 20.5548 10.8151 21.5811 10.473L32 7"
        stroke="white"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_2329_31235"
        x="3.49927"
        y="4.49951"
        width="33.0015"
        height="12.73"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.554167 0 0 0 0 0.554167 0 0 0 0 0.554167 0 0 0 0.25 0"
        />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2329_31235" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2329_31235"
          result="shape"
        />
      </filter>
    </defs>
  </>
);

export const viewBox = '0 0 40 18';
