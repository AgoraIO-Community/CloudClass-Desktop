import { FC, useCallback, useState, useEffect, useMemo } from 'react';
import { BaseWaveArmProps, UserWaveArmInfo } from './types';
import classnames from 'classnames';
import { Card, Popover, SvgImg } from '~components';
import { throttle } from 'lodash';
import { useInterval } from '@/infra/hooks/utilites';

export interface WaveArmManagerProps extends BaseWaveArmProps {
  hasWaveArmUser: boolean;
  waveArmCount: number;
}

export const WaveArmManager: FC<WaveArmManagerProps> = ({
  width = 40,
  height = 40,
  borderRadius = 40,
  className,
  hasWaveArmUser = false,
  waveArmCount = 0,
  ...restProps
}) => {
  const cls = classnames({
    [`hands-up hands-up-manager`]: 1,
    [`${className}`]: !!className,
  });
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const [twinkleFlag, setTwinkleFlag] = useState(false);

  useInterval(
    (timer: ReturnType<typeof setInterval>) => {
      if (hasWaveArmUser) {
        setTwinkleFlag(!twinkleFlag);
      } else {
        setTwinkleFlag(false);
        timer && clearInterval(timer);
      }
      return () => {
        timer && clearInterval(timer);
      };
    },
    500,
    hasWaveArmUser,
  );

  const content = useCallback(() => {
    return restProps.children;
  }, []);

  return (
    <div className={cls} {...restProps}>
      <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => {
          setPopoverVisible(visible);
        }}
        overlayClassName="customize-dialog-popover"
        trigger="hover"
        content={content}
        placement="leftBottom">
        <Card
          width={width}
          height={height}
          borderRadius={borderRadius}
          className={twinkleFlag ? 'card-hands-up-active' : ''}>
          <div className="hands-box-line">
            <SvgImg
              type={twinkleFlag ? 'teacher-hands-up-active' : 'teacher-hands-up-before'}
              size={24}
            />
          </div>
          {waveArmCount ? (
            <span className="hands-up-count">{waveArmCount > 99 ? '99+' : waveArmCount}</span>
          ) : null}
        </Card>
      </Popover>
    </div>
  );
};

export interface StudentsWaveArmListProps extends BaseWaveArmProps {
  userWaveArmList: UserWaveArmInfo[];
  onClick: (userUuid: string) => Promise<void> | void;
}
export const StudentsWaveArmList: FC<StudentsWaveArmListProps> = ({
  userWaveArmList,
  width = 210,
  borderRadius = 12,
  className,
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`students-hands-up`]: 1,
    [`${className}`]: !!className,
  });

  const [pagesList, setPagesList] = useState<Array<Array<UserWaveArmInfo>>>([[]]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize] = useState<number>(7);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(0);
  const [showWaveArmList, setShowWaveArmList] = useState<UserWaveArmInfo[]>([]);

  const handlerScroll = useMemo(
    () =>
      throttle((event: Event) => {
        const targetDom: Element = event.target as Element;
        const scrollTop = targetDom.scrollTop;
        const scrollHeight = targetDom.scrollHeight;
        const clientHeight = targetDom.clientHeight;
        if (scrollTop + clientHeight === scrollHeight) {
          if (pageIndex < totalPagesCount) {
            setPageIndex(pageIndex + 1);
          }
        }
      }, 100),
    [pageIndex, totalPagesCount],
  );

  useEffect(() => {
    const pagesListTemp: Array<Array<UserWaveArmInfo>> = [[]];
    setTotalPagesCount(Math.floor(userWaveArmList.length / pageSize));
    userWaveArmList.forEach((it, index) => {
      const pageIndex = Math.floor(index / pageSize);
      if (!pagesListTemp[pageIndex]) {
        pagesListTemp[pageIndex] = [];
      }
      pagesListTemp[pageIndex].push(it);
    });
    setPagesList(pagesListTemp);
  }, [userWaveArmList]);

  useEffect(() => {
    let showWaveArmListTemp: UserWaveArmInfo[] = [];
    for (let i = 0; i <= pageIndex; i++) {
      if (pagesList[i]) {
        showWaveArmListTemp = showWaveArmListTemp.concat(pagesList[i]);
      }
    }
    setShowWaveArmList(showWaveArmListTemp);
  }, [pageIndex, pagesList]);

  return showWaveArmList.length ? (
    <div className={cls} {...restProps}>
      <Card className={'hands-up-card'} borderRadius={borderRadius} onScroll={handlerScroll}>
        {showWaveArmList.map((item) => (
          <div className="student-item" key={item.userUuid}>
            <span className="student-name">{item?.userName}</span>
            <span className="operation-icon-wrap">
              {item.onPodium ? (
                <SvgImg type="invite-on-podium" color="#357bf6" />
              ) : (
                <SvgImg
                  type="invite-to-podium"
                  color="#7b89a0"
                  onClick={() => onClick(item.userUuid)}
                  canHover
                />
              )}
            </span>
          </div>
        ))}
      </Card>
    </div>
  ) : null;
};
