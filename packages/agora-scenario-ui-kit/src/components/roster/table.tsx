import React, { useState } from 'react';
import classNames from 'classnames';
import { Column, Profile } from '~components/roster';
import { Col, Row, Table } from '~components/table';
import { Operation, SupportedFunction } from '~ui-kit';
import { useColumns } from './hooks';

type RosterTableProps = {
  list: Profile[];
  functions?: Array<SupportedFunction>;
  onActionClick?: (operation: Operation, profile: Profile) => void;
  columnInteractive?: boolean;
};

export const InteractiveCol = ({
  col,
  index: idx,
  data,
  onClick,
  interactive,
}: {
  col: Column;
  index: number;
  data: Profile;
  onClick: (operation: Operation, profile: Profile) => void;
  interactive: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  const isFirstColumn = idx === 0;

  const props = isFirstColumn
    ? {
        title: data[col.key],
        className: 'roster-username',
        style: { paddingLeft: 25 },
      }
    : null;

  const handleClick = () => {
    if (col.operation && data.operations.includes(col.operation)) {
      onClick(col.operation, data);
    }
  };

  const colCls = classNames(!isFirstColumn ? 'justify-center' : 'justify-start');

  const interactiveEvents = interactive
    ? {
        onMouseEnter: () => {
          setHovered(true);
        },
        onMouseLeave: () => {
          setHovered(false);
        },
      }
    : {};

  const hoverClass = interactive && !isFirstColumn ? 'roster-col-hover' : '';

  return (
    <Col
      className={colCls}
      hoverClass={hoverClass}
      onClick={handleClick}
      style={
        col.width
          ? {
              flexBasis: col.width,
              flexGrow: 0,
              flexShrink: 0,
            }
          : {}
      }
      {...interactiveEvents}>
      <span {...props}>{col.render(data, hovered)}</span>
    </Col>
  );
};

export const RosterTable: React.FC<RosterTableProps> = ({
  list = [],
  functions = [],
  onActionClick = () => {},
  columnInteractive = false,
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
              interactive={columnInteractive}
            />
          ))}
        </Row>
      ))}
    </Table>
  );
};
