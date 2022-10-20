import React, { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AnimationName, PageAnimationCSS } from './3d-animation-css';

const ANIMATION_MAP = {
  // Animation CSS Name
  PUSH: AnimationName.FORWARD,
  POP: AnimationName.BACK,
  REPLACE: AnimationName.FORWARD,
};

type Page3DAnimationProps = {
  wrapperClassName?: string;
  timeout?: number;
  defaultRouteDeep?: number;
};

// Part of the browser compatibility problems.(safari:page scrolling failure. firefox:animation failure)
export const Page3DAnimation: FC<PropsWithChildren<Page3DAnimationProps>> = ({
  children,
  wrapperClassName = 'router-wrapper',
  timeout = 300,
  defaultRouteDeep = 5,
}) => {
  const history = useHistory();
  const location = useLocation();
  const animationState = useRef({
    classNames: '',
    pathname: location.pathname,
  });
  const [routeDeep, setRouteDeep] = useState(0);
  const maxRouteDeep = useRef(defaultRouteDeep);
  useEffect(() => {
    const ele = document.getElementsByClassName(wrapperClassName)[0];
    if (ele) {
      const animation = PageAnimationCSS.create({
        wrapperClassName: wrapperClassName,
        deep: maxRouteDeep.current,
        time: timeout,
      });
      window.addEventListener('resize', () => {
        animation.generateStyles(maxRouteDeep.current);
      });
    }
  }, []);

  useEffect(() => {
    if (maxRouteDeep.current - Math.abs(routeDeep) < 2) {
      const newDeep = maxRouteDeep.current + 5;
      const animation = PageAnimationCSS.create({
        wrapperClassName: wrapperClassName,
        deep: maxRouteDeep.current,
        time: timeout,
      });
      animation.appendStyles(newDeep);
      maxRouteDeep.current = newDeep;
    }
  }, [routeDeep]);

  const rotateY = useMemo(() => {
    return routeDeep * 90;
  }, [routeDeep]);

  return (
    <TransitionGroup
      className={`${wrapperClassName} rotateY${rotateY}`}
      childFactory={(child) => {
        if (animationState.current.pathname !== location.pathname) {
          animationState.current.classNames = ANIMATION_MAP[history.action] + rotateY;
          animationState.current.pathname = location.pathname;
        }
        return React.cloneElement(child, {
          classNames: animationState.current.classNames,
        }) as any;
      }}>
      <CSSTransition
        timeout={timeout}
        onEnter={() => {
          setRouteDeep((pre) => {
            switch (history.action) {
              case 'PUSH':
                return pre + 1;
              case 'REPLACE':
                return pre + 1;
              case 'POP':
                return pre - 1;
            }
          });
        }}
        key={location.pathname}
        unmountOnExit={false}>
        {children as any}
      </CSSTransition>
    </TransitionGroup>
  );
};
