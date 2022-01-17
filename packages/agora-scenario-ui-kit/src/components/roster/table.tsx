import React, { useState, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Column, Profile } from '~components/roster';
import { Col, Row, Table } from '~components/table';
import { Operation, SupportedFunction } from '~ui-kit';
import { useColumns } from './hooks';
import loadingSrc from './assets/loading.gif';
import { transI18n } from '../i18n';
import { debounce } from 'lodash';

type RosterTableProps = {
  list: Profile[];
  functions?: Array<SupportedFunction>;
  onActionClick?: (operation: Operation, profile: Profile) => void;
};

type InfiniteScrollRosterTableProps = {
  hasMore: boolean;
  onFetch: () => void;
} & RosterTableProps;

export const InteractiveCol = ({
  col,
  index: idx,
  data,
  onClick,
}: {
  col: Column;
  index: number;
  data: Profile;
  onClick: (operation: Operation, profile: Profile) => void;
}) => {
  const operation = data.operations[col.operation as Operation];
  const interactable = operation?.interactable;
  const [hovered, setHovered] = useState(false);

  const isFirstColumn = idx === 0;

  const handleClick = () => {
    const operation = data.operations[col.operation as Operation];
    if (operation?.interactable) {
      onClick(col.operation as Operation, data);
    }
  };

  const colCls = classNames(!isFirstColumn ? 'justify-center' : 'justify-start');

  const interactiveEvents = interactable
    ? {
        onMouseEnter: () => {
          setHovered(true);
        },
        onMouseLeave: () => {
          setHovered(false);
        },
      }
    : {};

  const hoverClass = interactable && !isFirstColumn ? 'roster-col-hover' : '';

  return (
    <Col
      className={colCls}
      hoverClass={hoverClass}
      onClick={handleClick}
      style={
        col.width
          ? {
              paddingLeft: isFirstColumn ? 25 : 0,
              flex: isFirstColumn ? '0 1 auto' : 1,
            }
          : {
              paddingLeft: isFirstColumn ? 25 : 0,
            }
      }
      {...interactiveEvents}>
      {col.render(data, hovered)}
    </Col>
  );
};

export const RosterTable: React.FC<RosterTableProps> = ({
  list = [],
  functions = [],
  onActionClick = () => {},
}) => {
  const cols = useColumns(functions);

  return (
    <Table className="table-container">
      {list.map((data: Profile) => (
        <Row className="border-bottom-width-1" key={data.uid} hoverClass="roster-row-hover">
          {cols.map((col: Column, idx: number) => (
            <InteractiveCol
              data={data}
              onClick={onActionClick}
              col={col}
              key={col.key}
              index={idx}
            />
          ))}
        </Row>
      ))}
    </Table>
  );
};

const config = {
  thresholdDistance: 50,
};

const useLoadMore = (onLoadMore: () => void, hasMore: boolean) => {
  const [loading, setLoading] = useState(false);
  const onScroll = useCallback(
    debounce(async (event) => {
      const { clientHeight, scrollHeight, scrollTop } = event.target;

      const distanceToBottom = scrollHeight - clientHeight - scrollTop;

      const thresholdToHit = config.thresholdDistance;

      const hitThreshold = distanceToBottom <= thresholdToHit;
      if (hitThreshold) {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
          await onLoadMore();
        } finally {
          setLoading(false);
        }
      }
    }, 300),
    [hasMore],
  );

  return {
    onScroll,
    loading,
  };
};

export const InfiniteScrollRosterTable: React.FC<InfiniteScrollRosterTableProps> = ({
  list = [],
  functions = [],
  onActionClick = () => {},
  onFetch,
  hasMore = true,
}) => {
  const cols = useColumns(functions);
  const { onScroll } = useLoadMore(onFetch, hasMore);
  const loader = (
    <img
      className="mx-auto"
      src={loadingSrc}
      style={{ width: 32, marginLeft: 'auto', marginRight: 'auto' }}
    />
  );
  const noMore = (
    <p
      className="py-3"
      style={{ textAlign: 'center', fontSize: 13, color: '#7B88A0', padding: '10px 0' }}>
      {transI18n('roster.no_more_data')}
    </p>
  );

  return (
    <Table className="table-container" onScroll={onScroll}>
      {list.map((data: Profile) => (
        <Row className="border-bottom-width-1" key={data.uid} hoverClass="roster-row-hover">
          {cols.map((col: Column, idx: number) => (
            <InteractiveCol
              data={data}
              onClick={onActionClick}
              col={col}
              key={col.key}
              index={idx}
            />
          ))}
        </Row>
      ))}
      {hasMore && loader}
      {!hasMore && noMore}
    </Table>
  );
};
