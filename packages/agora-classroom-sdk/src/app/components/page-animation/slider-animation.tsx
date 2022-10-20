import React, { FC, PropsWithChildren, useRef } from 'react';
import { useHistory, useLocation } from 'react-router';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './slider-animation.css';

export enum AnimationName {
  FORWARD = 'fcr-route-slider-forward',
  BACK = 'fcr-route-slider-back',
}

const ANIMATION_MAP = {
  // Animation CSS Name
  PUSH: AnimationName.FORWARD,
  POP: AnimationName.BACK,
  REPLACE: AnimationName.FORWARD,
};

export const SliderAnimation: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const animationState = useRef({
    classNames: '',
    pathname: location.pathname,
  });

  return (
    <TransitionGroup
      className={`slider-router-wrapper`}
      childFactory={(child) => {
        if (animationState.current.pathname !== location.pathname) {
          animationState.current.classNames = ANIMATION_MAP[history.action];
          animationState.current.pathname = location.pathname;
        }
        return React.cloneElement(child, {
          classNames: animationState.current.classNames,
        }) as any;
      }}>
      <CSSTransition
        key={location.pathname}
        appear={true}
        timeout={300}
        unmountOnExit={false}
        classNames={'page-animation-slider'}>
        <div className="h-screen w-full top-0 absolute">{children as any}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};
