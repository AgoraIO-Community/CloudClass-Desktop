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
};

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
