import React, { FC, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Search } from '../input';
import { SvgImg } from '../svg-img';
import { Col, Table, TableHeader } from '../table';
import { CarouselSetting } from './carousel-setting';
import { RosterProps } from './';
import { transI18n } from '../i18n';
import SearchSvg from '../icon/assets/svg/search.svg';
import { useColumns } from './hooks';

export const Roster: FC<RosterProps> = ({
  isDraggable = true,
  hostname,
  onClose,
  title,
  carouselProps,
  onKeywordChange,
  functions = [],
  keyword,
  children,
  offsetTop,
  bounds,
}) => {
  const DraggableContainer = useCallback(
    ({
      children,
      handle,
      bounds,
      offsetTop,
    }: {
      children: React.ReactChild;
      handle: string;
      bounds?: string;
      offsetTop?: number;
    }) => {
      return isDraggable ? (
        <Draggable
          handle={handle}
          bounds={bounds}
          positionOffset={{ y: offsetTop || 0, x: 0 }}
          defaultPosition={{ x: 0, y: 0 }}>
          {children}
        </Draggable>
      ) : (
        <>{children}</>
      );
    },
    [isDraggable],
  );

  const showSearch = functions.includes('search');
  const showCarousel = functions.includes('carousel');

  const cols = useColumns(functions);

  return (
    <DraggableContainer handle=".main-title" bounds={bounds} offsetTop={offsetTop}>
      <div className="agora-board-resources roster-wrap" style={{ width: 755 }}>
        {/* close icon */}
        <div className="btn-pin">
          <SvgImg type="close" className="cursor-pointer" onClick={onClose} />
        </div>
        {/* title bar */}
        <div className="main-title">{title ?? transI18n('roster.user_list')}</div>
        {/* panel */}
        <div className="roster-container">
          {/* carousel & search */}
          <div className="search-header roster-header">
            <div className="search-teacher-name">
              <label>{transI18n('roster.teacher_name')}</label>
              <span title={hostname} className="roster-username">
                {hostname}
              </span>
            </div>
            {showCarousel && <CarouselSetting {...carouselProps} />}
            {showSearch ? (
              <div style={{ marginTop: showCarousel ? 5 : 0 }}>
                <Search
                  value={keyword}
                  onSearch={onKeywordChange}
                  prefix={<img src={SearchSvg} />}
                  inputPrefixWidth={32}
                  placeholder={transI18n('scaffold.search')}
                />
              </div>
            ) : null}
          </div>
          {/* table */}
          <Table className="roster-table">
            <TableHeader>
              {cols.map(({ key, name }, idx) => {
                const isFirstColumn = idx === 0;
                return (
                  <Col
                    key={key}
                    className={isFirstColumn ? 'justfy-start' : 'justify-center'}
                    style={{ paddingLeft: isFirstColumn ? 25 : 0 }}>
                    {transI18n(name)}
                  </Col>
                );
              })}
            </TableHeader>
            {children}
          </Table>
        </div>
      </div>
    </DraggableContainer>
  );
};
