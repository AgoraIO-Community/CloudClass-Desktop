import { FC, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { Tool, ToolItem } from './tool';
import unfoldAbsent from './assets/close-default.svg';
import foldAbsent from './assets/open-default.svg';
import unfoldHover from './assets/close-hover.svg';
import foldHover from './assets/open-hover.svg';
import './index.css';
import { useDebounce, useMounted } from '~ui-kit/utilities/hooks';

export { Pens } from './pens';

export { ToolCabinet } from './tool-cabinet';

export { BoardCleaners } from './board-cleaners';

export type { ToolItem } from './tool';

export interface ToolbarProps extends BaseProps {
  tools: ToolItem[];
  active?: string;
  activeMap?: Record<string, boolean>;
  defaultOpened?: boolean;
  onClick?: (value: string) => unknown;
  onOpenedChange?: (opened: boolean) => void;
}

const menus: { [key: string]: string } = {
  [`fold-absent`]: foldAbsent,
  [`unfold-absent`]: unfoldAbsent,
  [`fold-hover`]: foldHover,
  [`unfold-hover`]: unfoldHover,
};

export const Toolbar: FC<ToolbarProps> = ({
  className,
  style,
  tools,
  active,
  activeMap = {},
  defaultOpened = true,
  onOpenedChange,
  onClick,
}) => {
  const animTimer = useRef<null | ReturnType<typeof window.setTimeout>>(null);
  const [opened, setOpened] = useState<boolean>(defaultOpened);
  const [menuHover, setMenuHover] = useState<boolean>(false);
  const toolbarEl = useRef<HTMLDivElement | null>(null);
  const toolbarScrollEl = useRef<HTMLDivElement | null>(null);
  const animContainer = useRef<HTMLDivElement | null>(null);
  const [reachEnd, setReachEnd] = useState<boolean>(false);
  const [reachTop, setReachTop] = useState<boolean>(false);

  const cls = classnames({
    [`toolbar`]: 1,
    [`opened`]: opened,
    [`${className}`]: !!className,
  });

  const isMounted = useMounted();

  const updateShadowState = () => {
    const current = toolbarScrollEl.current;
    if (current) {
      setReachEnd(current.clientHeight + current.scrollTop < current.scrollHeight);
      setReachTop(current.scrollTop > 0);
    }
  };

  useEffect(() => {
    const current = toolbarScrollEl.current;

    current?.addEventListener('scroll', updateShadowState);

    const observer = new ResizeObserver(() => {
      updateShadowState();
    });

    observer.observe(current as HTMLElement);

    return () => {
      current?.removeEventListener('scroll', updateShadowState);

      observer.unobserve(current as HTMLElement);

      if (animTimer.current) {
        clearTimeout(animTimer.current);
      }
    };
  }, []);

  useEffect(updateShadowState, [tools]);

  const maxHeight =
    // toolbar items height accumulation
    // margin bottom 10 * 10
    (25 + 10) * tools.length +
    // top button
    // 42 +
    // shadow extra
    14 +
    4;

  return (
    <div
      className="toolbar-position"
      style={{
        maxHeight,
        right: opened ? 10 : 0,
      }}
      ref={animContainer}>
      <div className={cls} style={style} ref={toolbarEl}>
        <div
          className={`menu ${opened ? 'unfold' : 'fold'}`}
          style={{
            right: opened ? 30 : 0,
            // zIndex: opened ? -1 : 0,
          }}
          onMouseEnter={() => setMenuHover(true)}
          onMouseLeave={() => setMenuHover(false)}
          onClick={() => {
            toolbarEl.current &&
              toolbarEl.current.parentElement &&
              toolbarEl.current.parentElement.classList.remove('toolbar-anim-hide');
            toolbarEl.current &&
              toolbarEl.current.parentElement &&
              toolbarEl.current.parentElement.classList.remove('toolbar-anim-show');
            if (opened) {
              toolbarEl.current &&
                toolbarEl.current.parentElement &&
                toolbarEl.current.parentElement.classList.add('toolbar-anim-hide');
            } else {
              toolbarEl.current &&
                toolbarEl.current.parentElement &&
                toolbarEl.current.parentElement.classList.add('toolbar-anim-show');
            }
            animTimer.current && clearTimeout(animTimer.current);
            animTimer.current = setTimeout(() => {
              if (!isMounted) {
                return;
              }
              setOpened(!opened);
              onOpenedChange && onOpenedChange(!opened);
              animTimer.current && clearTimeout(animTimer.current);
              //0.5s * 0.5
            }, 250);
          }}>
          <img
            src={menus[`${opened ? 'unfold' : 'fold'}-${menuHover ? 'hover' : 'absent'}`]}
            alt="menu"
          />
        </div>
        <div className="tools" ref={toolbarScrollEl}>
          {tools.map(({ value, ...restProps }) => (
            <Tool
              key={value}
              value={value}
              {...restProps}
              onClick={onClick}
              isActive={active === value || activeMap[value]}
            />
          ))}
        </div>
      </div>
      <div
        className={
          reachTop
            ? opened
              ? 'toolbar-shadow-up'
              : 'toolbar-shadow-up hidden'
            : 'toolbar-shadow-up hidden'
        }></div>
      <div
        className={
          reachEnd ? (opened ? 'toolbar-shadow' : 'toolbar-shadow hidden') : 'toolbar-shadow hidden'
        }></div>
    </div>
  );
};
