import React from 'react';
import { Meta } from '@storybook/react';
import { SvgIcon } from './';
import { SvgIconEnum } from './type';
import './index.css';

const meta: Meta = {
  title: 'Components/SvgImg',
  component: SvgIcon,
};

type DocsProps = {
  size: number;
  color: string;
};

const keys = Object.keys(SvgIconEnum);
export const Docs = ({ size, color }: DocsProps) => {
  return (
    <div className="fcr-h-full fcr-overflow-auto">
      <h1 className="fcr-mb-4">Icon Gallery</h1>
      <div className="fcr-flex fcr-flex-wrap">
        {keys.map((k) => {
          return (
            <div key={k} className="fcr-mr-4 fcr-mb-4 fcr-border">
              <SvgIcon
                type={SvgIconEnum[k]}
                hoverType={SvgIconEnum[k]}
                size={size}
                colors={color ? { iconPrimary: color, penColor: 'red' } : { penColor: 'red' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

Docs.args = {
  size: 100,
  color: '',
};

export default meta;
