import { useRef, useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
type TransitionProps = {
  sourceElementClass: string | null;
};

export const TransitionContainer: React.FC<TransitionProps> = ({
  children,
  sourceElementClass,
}) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [begin, setBegin] = useState(false);

  useEffect(() => {
    if (sourceElementClass) {
      const parentRect = parentRef.current?.getBoundingClientRect();
      const sourceElementRect =
        sourceElementClass && document.querySelector(sourceElementClass)?.getBoundingClientRect();

      if (parentRect && sourceElementRect) {
        const initialPosition = {
          x: Math.floor(-(parentRect.x - sourceElementRect.x)),
          y: Math.floor(-(parentRect.y - sourceElementRect.y)),
        };

        setInitialPosition(initialPosition);

        setBegin(true);
      }
    }
  }, [sourceElementClass]);

  const styleMap = {
    entering: {
      transform: `translate(${initialPosition.x}px, ${initialPosition.y}px) scale(0.8)`,
    },
    entered: {
      transform: `translate(0, 0) scale(1)`,
      transition: 'all .3s',
    },
  };

  return (
    <Transition in={begin} timeout={0}>
      {(state) => (
        <div className="w-full h-full" style={{ ...styleMap[state] }} ref={parentRef}>
          {children}
        </div>
      )}
    </Transition>
  );
};
