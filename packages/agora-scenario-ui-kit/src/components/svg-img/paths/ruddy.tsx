import React from 'react';
import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <>
    <g filter="url(#filter0_d_509_5529)">
      <path
        d="M35.6886 26.1977L36.1143 22.182C36.861 15.1381 31.3391 9 24.2558 9C17.1725 9 11.6507 15.1381 12.3973 22.182L12.823 26.1978C13.414 31.7731 17.1623 36.51 22.4525 38.367C23.6198 38.7767 24.8918 38.7767 26.0591 38.367C31.3493 36.51 35.0976 31.7731 35.6886 26.1977Z"
        fill="white"
      />
      <path
        d="M35.6886 26.1977L36.1143 22.182C36.861 15.1381 31.3391 9 24.2558 9C17.1725 9 11.6507 15.1381 12.3973 22.182L12.823 26.1978C13.414 31.7731 17.1623 36.51 22.4525 38.367C23.6198 38.7767 24.8918 38.7767 26.0591 38.367C31.3493 36.51 35.0976 31.7731 35.6886 26.1977Z"
        stroke="black"
      />
    </g>
    <ellipse
      cx="15"
      cy="26"
      rx="5"
      ry="3"
      stroke="#A4A3AD"
      strokeWidth="1.08333"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.4 1.5"
    />
    <ellipse
      cx="33"
      cy="26"
      rx="5"
      ry="3"
      stroke="#A4A3AD"
      strokeWidth="1.08333"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.4 1.5"
    />
    <defs>
      <filter
        id="filter0_d_509_5529"
        x="7.82959"
        y="8.5"
        width="32.8525"
        height="38.6743"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_509_5529" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_509_5529"
          result="shape"
        />
      </filter>
    </defs>
  </>
);

export const viewBox = '0 0 48 48';
