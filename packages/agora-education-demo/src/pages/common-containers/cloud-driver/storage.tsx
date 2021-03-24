import { useBoardStore } from '@/hooks'
import { Col, IconBox, Inline, Row, Table, TableHeader, t, Placeholder } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

export const StorageContainer = observer(() => {

  const boardStore = useBoardStore()

  const onResourceClick = async (resourceUuid: string) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
  }

  const itemList = boardStore.personalResources

  useEffect(() => {
    boardStore.refreshState()
  }, [boardStore])

  return (
    <Table>
    <TableHeader>
      <Col>{t('cloud.fileName')}</Col>
      <Col>{t('cloud.size')}</Col>
      <Col>{t('cloud.updatedAt')}</Col>
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