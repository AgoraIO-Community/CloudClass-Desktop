import { FC, ReactNode, useEffect, useState } from 'react';
import { IconTypes } from '~components/icon';
import { BaseProps } from '~components/interface/base-props';

export interface AffixProps extends BaseProps {
  top?: number | string;
  left?: number | string;
  content?: ReactNode;
  collapse?: boolean;
  onCollapse?: () => void;
}

export const Affix: FC<AffixProps> = ({
  style,
  className,
  collapse,
  left,
  top,
  children,
  content,
  onCollapse,
}) => {
  return (
    <>
      {!collapse ? (
        children
      ) : (
        <div
          className={className}
          style={{
            ...(collapse
              ? {}
              : {
                  position: 'absolute',
                  top,
                  left,
                }),
            ...style,
          }}
          onClick={() => onCollapse && onCollapse()}>
          {content}
        </div>
      )}
    </>
  );
};
