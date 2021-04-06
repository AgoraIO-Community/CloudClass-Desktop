import { useBoardStore } from '@/hooks'
import { useDownloadContext } from '@/ui-components/hooks'
import { StorageCourseWareItem } from '@/stores/storage'
import { Button, Col, IconBox, Inline, Placeholder, Progress, Row, t, Table, TableHeader } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const DownloadContainer = observer(() => {

  const {
    startDownload,
    deleteDownload,
    itemList,
  } = useDownloadContext()

  return (
    <Table>
      <TableHeader>
        <Col>{t('cloud.fileName')}</Col>
        <Col>{t('cloud.size')}</Col>
        <Col>{t('cloud.progress')}</Col>
        <Col>{t('cloud.updatedAt')}</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.length ? itemList.map(({ id, name, progress, size, type, taskUuid, download }: any, idx: number) =>
          <Row height={10} border={1} key={`${id}${idx}`}>
            <Col>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
              <Inline className="filename" color="#191919">{name}</Inline>
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
                  <Button type="secondary" disabled={progress === 100} action="download" onClick={async () => {
                    await startDownload(taskUuid)
                  }}>{!download ? t('cloud.download') : t('cloud.downloading')}</Button>
                : 
                  <Button type="secondary" disabled={progress === 100}>{t('cloud.downloading')}</Button>
                }
                <Button type="ghost" disabled={progress === 100 ? false : true} onClick={() => deleteDownload(taskUuid)}>{t('cloud.delete')}</Button>
              </Row>
            </Col>
          </Row>
        ) : <Placeholder placeholderType="noFile"/>}
      </Table>
    </Table>
  )
})