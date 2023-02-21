import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary }: PathOptions) => (
  <>
    <g filter="url(#filter0_d_2363_63817)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.62824 6.20962C6.06486 4.89976 7.48066 4.19186 8.79052 4.62848L19.2094 8.10144C19.7225 8.27249 20.2773 8.27249 20.7905 8.10144L31.2094 4.62848C32.5192 4.19186 33.935 4.89976 34.3717 6.20962C34.8083 7.51948 34.1004 8.93528 32.7905 9.3719L22.3717 12.8449C20.8322 13.358 19.1677 13.358 17.6282 12.8449L7.20938 9.3719C5.89952 8.93528 5.19162 7.51948 5.62824 6.20962Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_2363_63817"
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
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2363_63817" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2363_63817"
          result="shape"
        />
      </filter>
    </defs>
  </>
);

export const viewBox = '0 0 40 18';
