import tinycolor from 'tinycolor2';

const hueStep = 2;
const saturationStep = 0.16;
const saturationStep2 = 0.05;
const brightnessStep1 = 0.05;
const brightnessStep2 = 0.15;
const lightColorCount = 5;
const darkColorCount = 4;

const getHue = function (hsv: any, i: number, isLight: boolean) {
  let hue;
  if (hsv.h >= 60 && hsv.h <= 240) {
    hue = isLight ? hsv.h - hueStep * i : hsv.h + hueStep * i;
  } else {
    hue = isLight ? hsv.h + hueStep * i : hsv.h - hueStep * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return Math.round(hue);
};
const getSaturation = function (hsv: any, i: number, isLight: boolean) {
  // grey color don't change saturation
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }
  let saturation;
  if (isLight) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  }
  if (saturation > 1) {
    saturation = 1;
  }
  if (isLight && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }
  if (saturation < 0.06) {
    saturation = 0.06;
  }
  return Number(saturation.toFixed(2));
};
const getValue = function (hsv: any, i: number, isLight: boolean) {
  let value;
  if (isLight) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }
  if (value > 1) {
    value = 1;
  }
  return Number(value.toFixed(2));
};

const colorPalette = function (color: any, index: number) {
  const isLight = index <= 6;
  const hsv = tinycolor(color).toHsv();
  const i = isLight ? lightColorCount + 1 - index : index - lightColorCount - 1;
  return tinycolor({
    h: getHue(hsv, i, isLight),
    s: getSaturation(hsv, i, isLight),
    v: getValue(hsv, i, isLight),
  }).toHexString();
};

export const brandColor = '#0056FD'; // primary color
export const blue1 = colorPalette(brandColor, 1);
export const blue2 = colorPalette(brandColor, 2);
export const blue3 = colorPalette(brandColor, 3);
export const blue4 = colorPalette(brandColor, 4);
export const blue5 = colorPalette(brandColor, 5);
export const blue6 = brandColor;
export const blue7 = colorPalette(brandColor, 7);
export const blue8 = colorPalette(brandColor, 8);
export const blue9 = colorPalette(brandColor, 9);
export const blue10 = colorPalette(brandColor, 10);

export const primaryRadius = '24px';
export const halfRadius = '12px';
