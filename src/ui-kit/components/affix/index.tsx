import { FC, ReactNode } from 'react';
import { BaseProps } from '../util/type';
import { CSSTransition } from 'react-transition-group';
import './index.css';

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
    <CSSTransition in={!collapse} timeout={500} classNames="fcr-affix-collapse">
      {!collapse ? (
        children as any
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
    </CSSTransition>
  );
};
