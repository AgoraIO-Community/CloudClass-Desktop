import { observer } from 'mobx-react'
import { Button, Col, IconBox, Progress, Inline, Row, Table, TableHeader, formatFileSize, t } from 'agora-scenario-ui-kit'
import React, { useEffect } from 'react'
import { useBoardStore } from '@/hooks'
import { agoraCaches } from '@/utils/web-download.file'
import { get } from 'lodash'
import { StorageCourseWareItem } from '@/stores/storage'

export const DownloadContainer = observer(() => {

  const boardStore = useBoardStore()

  const itemList = boardStore.downloadList.filter((it: StorageCourseWareItem) => it.taskUuid)

  return (
    <Table>
      <TableHeader>
        <Col>{t('cloud.fileName')}</Col>
        <Col>{t('cloud.size')}</Col>
        <Col>{t('cloud.progress')}</Col>
        <Col>{t('cloud.updatedAt')}</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.map(({ id, name, progress, size, type, taskUuid, download }: any, idx: number) =>
          <Row height={10} border={1} key={`${id}${idx}`}>
            <Col>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
              <Inline color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Inline color="#586376">{size}</Inline>
            </Col>
            <Col>
              <Progress width={60} type="download" progress={progress} />
              <Inline color="#586376">{progress}</Inline>
            </Col>
            <Col>
              <Row className="btn-group no-padding" gap={10}>
                {
                  !download ? 
                  <Button type="secondary" disabled={progress === 100} onClick={async () => {
                    await boardStore.startDownload(taskUuid)
                  }}>{!download ? t('cloud.download') : t('cloud.downloading')}</Button>
                : 
                  <Button type="secondary" disabled={progress === 100}>{t('cloud.downloading')}</Button>
                }
                <Button type="ghost" disabled={progress === 100 ? false : true} onClick={async () => {
                  await boardStore.deleteSingle(taskUuid)
                }}>{t('cloud.delete')}</Button>
              </Row>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
})