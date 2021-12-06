import React from 'react';
import { Column, Profile } from '~components/roster';
import { Col, Row, Table } from '~components/table';
import { Operation, SupportedFunction } from '~ui-kit';
import { useColumns } from './hooks';

type RosterTableProps = {
  list: Profile[];
  functions?: Array<SupportedFunction>;
  onActionClick?: (operation: Operation, profile: Profile) => void;
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
        <Row className={'border-bottom-width-1'} key={data.uid}>
          {cols.map((col: Column, idx: number) => {
            const isFirstColumn = idx === 0;
            const canOperate = data.operations[col.key];

            const props = isFirstColumn
              ? {
                  title: data[col.key],
                  className: `roster-username ${canOperate ? 'action' : ''}`,
                  style: { paddingLeft: 25 },
                }
              : null;

            const handleClick = () => {
              if (col.operation && data.operations.includes(col.operation)) {
                onActionClick(col.operation, data);
              }
            };

            return (
              <Col
                key={col.key}
                style={{
                  justifyContent: !isFirstColumn ? 'center' : 'flex-start',
                }}>
                <span {...props} onClick={handleClick}>
                  {col.render(data)}
                </span>
              </Col>
            );
          })}
        </Row>
      ))}
    </Table>
  );
};
