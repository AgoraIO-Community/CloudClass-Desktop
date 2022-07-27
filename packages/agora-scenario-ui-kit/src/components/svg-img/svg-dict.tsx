import React from "react";

const ctxRequire = require.context('./paths', false, /\.tsx$/);

const paths: Record<string, SvgPath> = {};

ctxRequire.keys().forEach(async (path) => {
  const m = ctxRequire(path) as SvgPath;
  const key = path.replace('./', '').replace('.tsx', '');
  paths[key] = m;
});

export type PathOptions = {
  iconPrimary: string,
  iconSecondary: string,
  [key: string]: string
};

export type SvgPath = {
  path: (options: PathOptions) => React.ReactNode;
  viewBox?: string;
};

export const getPath = (name: string, props: PathOptions) => {
  const svg = paths[name];

  if (svg) {
    return svg.path(props);
  }

  return <path />

};

export const getViewBox = (name: string) => {
  const svg = paths[name];

  if (svg) {
    return svg.viewBox;
  }

  return '0 0 0 0';
};
