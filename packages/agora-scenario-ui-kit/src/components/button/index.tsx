import { EventHandler, FC, SyntheticEvent, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import './index.css';

type ButtonType = 'primary' | 'secondary' | 'ghost' | 'danger';

function createRipple(container: HTMLDivElement, y: number, x: number, type: ButtonType) {
  const circleElement = document.createElement('div');
  circleElement.className = 'fcr-btn-ripple-circle';
  circleElement.style.top = y + 'px';
  circleElement.style.left = x + 'px';
  circleElement.style.background = type === 'primary' ? 'rgba(38, 99, 208, 1)' : '#fff';
  container.appendChild(circleElement);
  setTimeout(() => circleElement.remove(), 900);
}
export interface ButtonProps extends BaseProps {
  type?: ButtonType;
  size?: 'xs' | 'sm' | 'lg';
  disabled?: boolean;
  action?: string;
  animate?: boolean;
  onClick?: EventHandler<SyntheticEvent<HTMLButtonElement>>;
  onMouseOver?: EventHandler<SyntheticEvent<HTMLButtonElement>>;
  onMouseLeave?: EventHandler<SyntheticEvent<HTMLButtonElement>>;
}

export const Button: FC<ButtonProps> = ({
  type = 'primary',
  size = 'sm',
  disabled,
  children,
  className,
  action,
  animate = true,
  ...restProps
}) => {
  const cls = classnames({
    [`fcr-btn fcr-btn-${size} fcr-btn-${type}`]: 1,
    [`${className}`]: !!className,
  });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const buttonElement = buttonRef.current;
    const rippleElement = rippleRef.current;
    const mousedownFn = (e: MouseEvent) => {
      if (buttonElement && rippleElement) {
        const y = e.pageY - (buttonElement as HTMLElement).getBoundingClientRect().top;
        const x = e.pageX - (buttonElement as HTMLElement).getBoundingClientRect().left;
        createRipple(rippleElement, y, x, type);
      }
    };
    if (animate && buttonElement && rippleElement) {
      buttonElement.addEventListener('mousedown', mousedownFn);
    }
    return () => {
      if (animate && buttonElement && rippleElement) {
        buttonElement.removeEventListener('mousedown', mousedownFn);
      }
    };
  }, []);
  return (
    <button ref={buttonRef} className={`${cls} group`} disabled={disabled} {...restProps}>
      {animate ? <div className="fcr-btn-ripple" ref={rippleRef}></div> : null}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-black opacity-0 group-hover:opacity-10 focus:opacity-20"></div>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
};
