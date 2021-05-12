import React, { FC, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Tool, ToolItem } from './tool';
import unfoldAbsent from './assets/icon-close.svg';
import foldAbsent from './assets/icon-open.svg';
import unfoldHover from './assets/icon-close-hover.svg';
import foldHover from './assets/icon-open-hover.svg';
import './index.css';
import { useMounted } from '@/ui-kit/utilities/hooks';
import { debounce } from 'lodash'

export { Colors } from './colors';

export { Pens } from './pens'

export { CloudDisk } from './cloud-disk'

export { ToolCabinet } from './tool-cabinet'

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
  const animTimer = useRef<null | ReturnType<typeof window.setTimeout>>(null)
  const [opened, setOpened] = useState<boolean>(defaultOpened);
  const [menuHover, setMenuHover] = useState<boolean>(false);
  const toolbarEl = useRef<HTMLDivElement | null>(null)
  const toolbarScrollEl = useRef<HTMLDivElement | null>(null)
  const animContainer = useRef<HTMLDivElement | null>(null)
  const [reachEnd, setReachEnd] = useState<boolean>(false)
  const cls = classnames({
    [`toolbar`]: 1,
    [`opened`]: opened,
    [`${className}`]: !!className,
  });

  const isMounted = useMounted()

  useEffect(() => {
    if (animTimer.current) {
      clearTimeout(animTimer.current)
    }
    const onWindowSizeChange = debounce(() => {
      if(animContainer.current) {
        let maxHeight = +(animContainer.current.style.maxHeight.replace("px", ""))
        setReachEnd(maxHeight !== animContainer.current.clientHeight)
      }
    }, 200)
    window.addEventListener('resize', onWindowSizeChange)

    return () => {
      window.removeEventListener('resize', onWindowSizeChange)
    }
  }, [])

  useEffect(() => {
    let current = toolbarScrollEl.current
    const onScrollToolbar = debounce(() => {
      if(current) {
        const bottom = current.scrollHeight - current.scrollTop === current.clientHeight
        setReachEnd(!bottom)
      }
    }, 50)
    current?.addEventListener('scroll', onScrollToolbar)
    return () => {
      current?.removeEventListener('scroll', onScrollToolbar)
    }
  }, [toolbarScrollEl])

  useEffect(() => {
    if(animContainer.current) {
      let maxHeight = +(animContainer.current.style.maxHeight.replace("px", ""))
      setReachEnd(maxHeight !== animContainer.current.clientHeight)
    }
  }, [tools])

  const maxHeight = 
    // toolbar items height accumulation
    // margin bottom 10 * 10
    (28 + 10) * tools.length
    // top button
    + 42
    // shadow extra
    + 10

  return (
    <div 
      className='toolbar-position' style={{
        maxHeight,
        left: opened ? 15 : 0
      }}
      ref={animContainer}
      onAnimationEnd={() => {
        const animEl = animContainer.current
        if (animEl && animEl.classList.contains('toolbar-anim-hide')) {
          animEl.style.left = '0px'
        }
        if (animEl && animEl.classList.contains('toolbar-anim-show')) {
          animEl.style.left = '15px'
        }
      }}
    >
      <div className={cls} style={style} ref={toolbarEl}>
        <div
          className={`menu ${opened ? 'unfold' : 'fold'}`}
          onMouseEnter={() => setMenuHover(true)}
          onMouseLeave={() => setMenuHover(false)}
          onClick={() => {
            toolbarEl.current && toolbarEl.current.parentElement && toolbarEl.current.parentElement.classList.remove('toolbar-anim-hide')
            toolbarEl.current && toolbarEl.current.parentElement && toolbarEl.current.parentElement.classList.remove('toolbar-anim-show')
            if (opened) {
              toolbarEl.current && toolbarEl.current.parentElement && (toolbarEl.current.parentElement.classList.add('toolbar-anim-hide'));
            } else {
              toolbarEl.current && toolbarEl.current.parentElement && (toolbarEl.current.parentElement.classList.add('toolbar-anim-show'));
            }
            animTimer.current && clearTimeout(animTimer.current)
            animTimer.current = setTimeout(() => {
              if (!isMounted) {
                return
              }
              setOpened(!opened);
              onOpenedChange && onOpenedChange(!opened);
              animTimer.current && clearTimeout(animTimer.current)
            }, 300)
          }}>
          <img
            src={
              menus[
                `${opened ? 'unfold' : 'fold'}-${menuHover ? 'hover' : 'absent'}`
              ]
            }
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
      <div className={reachEnd ? "toolbar-shadow" : "toolbar-shadow hidden"}></div>
    </div>
  );
};
