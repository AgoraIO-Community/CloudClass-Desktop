import React from 'react';
import { useEffect } from 'react';
import { useState, useCallback, TouchEventHandler } from 'react';
import { useThrottle } from './useThrottle';

export const useDrag = () => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const [x, y] = useThrottle(position, 50);
  const [isDragged, setIsDragged] = useState(false);

  const onTouchStart = useCallback<TouchEventHandler<HTMLDivElement>>((e) => {
    setDragging(true);
  }, []);

  const onTouchEnd = useCallback<TouchEventHandler<HTMLDivElement>>(() => {
    setDragging(false);
  }, []);

  const onTouchMove = useCallback<TouchEventHandler<HTMLDivElement>>(
    (e) => {
      if (!dragging) {
        return;
      }
      const bounds = {
        top: 0,
        left: 0,
        right: window.innerWidth - e.currentTarget.clientWidth,
        bottom: window.innerHeight - e.currentTarget.clientHeight,
      };
      let xPos = e.touches[0].clientX - e.currentTarget.clientWidth / 2;
      let yPos = e.touches[0].clientY - e.currentTarget.clientHeight / 2;
      if (xPos <= bounds.left) {
        xPos = bounds.left;
      }
      if (xPos >= bounds.right) {
        xPos = bounds.right;
      }
      if (yPos <= bounds.top) {
        yPos = bounds.top;
      }
      if (yPos >= bounds.bottom) {
        yPos = bounds.bottom;
      }

      setPosition([xPos, yPos]);
    },
    [dragging],
  );
  useEffect(() => {
    if (x !== 0 && y !== 0) {
      setIsDragged(true);
    }
  }, [x, y]);
  return { x, y, isDragged, onTouchStart, onTouchEnd, onTouchMove };
};
