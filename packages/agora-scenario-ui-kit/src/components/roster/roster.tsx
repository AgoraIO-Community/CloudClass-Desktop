import { FC, useState, useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { Search } from '../input';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { Col, Table, TableHeader } from '../table';
import { CarouselSetting } from './carousel-setting';
import { RosterProps } from './';
import { transI18n } from '../i18n';
import { useColumns } from './hooks';
import { OverlayWrap } from '../overlay-wrap';
import { useDraggableDefaultCenterPosition } from '../../utilities/hooks';
import { throttle } from 'lodash';

const modalSize = { width: 606, height: 402 };

export const Roster: FC<RosterProps> = ({
  hostname,
  onClose,
  title,
  carouselProps,
  onKeywordChange,
  functions = [],
  keyword,
  children,
  bounds,
  width,
}) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setOpened(true);
  }, []);
  const innerSize = useMemo(
    throttle(() => {
      if (bounds) {
        const innerEle = document.getElementsByClassName(bounds)[0];
        if (innerEle) {
          return {
            innerHeight: innerEle.clientHeight,
            innerWidth: innerEle.clientWidth,
          };
        }
      }
      return {
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      };
    }, 200),
    [window.innerHeight, window.innerWidth],
  );
  const defaultPos = useDraggableDefaultCenterPosition(
    {
      draggableWidth: width || modalSize.width,
      draggableHeight: modalSize.height,
    },
    innerSize,
  );

  const showSearch = functions.includes('search');
  const showCarousel = functions.includes('carousel');

  const cols = useColumns(functions);

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        dragHandleClassName="main-title"
        bounds={'.' + bounds}
        enableResizing={false}
        default={defaultPos}>
        <div
          className="roster-wrap"
          style={{ minWidth: width || modalSize.width, height: modalSize.height }}>
          {/* close icon */}
          <div className="btn-pin">
            <SvgImg
              type={SvgIconEnum.CLOSE}
              className="cursor-pointer"
              onClick={() => {
                setOpened(false);
              }}
            />
          </div>
          {/* title bar */}
          <div className="main-title">{title ?? transI18n('roster.user_list')}</div>
          {/* panel */}
          <div className="roster-container">
            {/* carousel & search */}
            <div className="search-header roster-header">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <div className="search-teacher-name">
                  <label>{transI18n('roster.teacher_name')}&nbsp;</label>
                  <span title={hostname} className="roster-username">
                    {hostname}
                  </span>
                </div>
                {showCarousel && <CarouselSetting {...carouselProps} />}
              </div>
              {showSearch ? (
                <div style={{ marginTop: showCarousel ? 5 : 0 }}>
                  <Search
                    value={keyword}
                    onSearch={onKeywordChange}
                    prefix={<SvgImg type={SvgIconEnum.SEARCH} />}
                    inputPrefixWidth={32}
                    placeholder={transI18n('scaffold.search')}
                  />
                </div>
              ) : null}
            </div>
            {/* table */}
            <Table className="roster-table">
              <TableHeader>
                {cols.map(({ key, name, width }, idx) => {
                  const isFirstColumn = idx === 0;
                  return (
                    <Col
                      key={key}
                      className={isFirstColumn ? 'justify-start' : 'justify-center'}
                      style={
                        width
                          ? {
                            paddingLeft: isFirstColumn ? 25 : 0,
                            flex: isFirstColumn ? '0 1 auto' : 1,
                          }
                          : {
                            paddingLeft: isFirstColumn ? 25 : 0,
                          }
                      }>
                      {transI18n(name)}
                    </Col>
                  );
                })}
              </TableHeader>
              {children}
            </Table>
          </div>
        </div>
      </Rnd>
    </OverlayWrap>
  );
};
