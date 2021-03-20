import { useBoardStore } from '@/hooks'
import { Col, IconBox, Inline, Row, Table, TableHeader } from 'agora-scenario-ui-kit'
import { formatFileSize } from 'agora-scenario-ui-kit/lib/utilities'
import { size } from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'

export const Storage = observer(() => {

  const boardStore = useBoardStore()

  const itemList = boardStore.resourcesList

  return (
    <Table>
    <TableHeader>
      <Col>文件</Col>
      <Col>大小</Col>
      <Col>修改时间</Col>
    </TableHeader>
    <Table className="table-container">
      {itemList.map(({ name, date, type, size }: any, idx: number) =>
        <Row height={10} border={1} key={idx} >
          <Col>
            <IconBox iconType={type} style={{ marginRight: '6px' }} />
            <Inline color="#191919">{name}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{formatFileSize(size)}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{date}</Inline>
          </Col>
        </Row>
      )}
    </Table>
  </Table>
  )
})