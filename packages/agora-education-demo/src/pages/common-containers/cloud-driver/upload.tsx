import { observer } from 'mobx-react'
import { Button, Col, IconBox, Progress, Inline, Row, Table, TableHeader } from 'agora-scenario-ui-kit'
import { formatFileSize } from 'agora-scenario-ui-kit/lib/utilities'
import React from 'react'
import { useBoardStore } from '@/hooks'
import { agoraCaches } from '@/utils/web-download.file'

export const UploadContainer = observer(() => {

  const boardStore = useBoardStore()

  const itemList = boardStore.resourcesList

  return (
    <Table>
      <TableHeader>
        <Col>文件</Col>
        <Col>进度</Col>
        <Col>操作</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.map(({ name, progress, type, taskUuid }: any, idx: number) =>
          <Row height={10} border={1} key={idx}>
            <Col>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
              <Inline color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Progress width={60} type="download" progress={progress} />
            </Col>
            <Col>
              <Row className="btn-group no-padding" gap={10}>
                <Button type="secondary" onClick={async () => {
                  await agoraCaches.startDownload(taskUuid)
                }}>下载</Button>
                <Button type="ghost" onClick={async () => {
                  await agoraCaches.deleteTaskUUID(taskUuid)
                }}>删除</Button>
              </Row>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
})