import { FC, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Search } from '../input';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { Col, Table, TableHeader } from '../table';
import { CarouselSetting } from './carousel-setting';
import { RosterProps } from './';
import { useI18n } from 'agora-common-libs';
import { useColumns } from './hooks';
import { OverlayWrap } from '../overlay-wrap';
import { useDraggableDefaultCenterPosition } from '../../utilities/hooks';

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
  const defaultRect = useDraggableDefaultCenterPosition({
    draggableWidth: width || modalSize.width,
    draggableHeight: modalSize.height,
    bounds,
  });

  const showSearch = functions.includes('search');
  const showCarousel = functions.includes('carousel');

  const cols = useColumns(functions);
  const transI18n = useI18n();

  return (
    <OverlayWrap opened={opened} onExited={onClose}>
      <Rnd
        dragHandleClassName="main-title"
        bounds={bounds}
        enableResizing={false}
        default={defaultRect}>
        <div
          className="roster-wrap"
          style={{ minWidth: width || modalSize.width, height: modalSize.height }}>
          {/* close icon */}
          <div className="btn-pin">
            <SvgImg
              type={SvgIconEnum.CLOSE}
              className="fcr-cursor-pointer"
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
                      className={isFirstColumn ? 'fcr-justify-start' : 'fcr-justify-center'}
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
