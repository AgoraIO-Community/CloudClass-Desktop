import { useBoardStore } from '@/hooks'
import { useStorageContext } from '@/ui-components/hooks'
import { Col, IconBox, Inline, Row, Table, TableHeader, t, Placeholder, transI18n } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

export const StorageContainer = observer(() => {

  const {itemList, onResourceClick} = useStorageContext()

  return (
    <Table>
    <TableHeader>
      <Col>{transI18n('cloud.fileName')}</Col>
      <Col>{transI18n('cloud.size')}</Col>
      <Col>{transI18n('cloud.updated_at')}</Col>
    </TableHeader>
    <Table className="table-container">
      {itemList.length ? itemList.map(({ id, name, date, updateTime, size, type }: any, idx: number) =>
        <Row height={10} border={1} key={idx} >
          <Col style={{cursor: 'pointer'}} onClick={() => {
            onResourceClick(id)
          }}>
            <IconBox iconType={type} style={{ marginRight: '6px' }} />
            <Inline className="filename" color="#191919">{name}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{size}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")}</Inline>
          </Col>
        </Row>
      ) : <Placeholder placeholderType="noFile"/>}
    </Table>
  </Table>
  )
})