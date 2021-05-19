import { useCloudDriveContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { Button, Col, IconBox, Inline, Placeholder, Progress, Row, Table, TableHeader, transI18n } from '~ui-kit'

export const DownloadContainer = observer(() => {

  const {
    downloadList,
    openCloudResource,
    startDownload,
    deleteSingle
  } = useCloudDriveContext()

  const onResourceClick = async (id: string) => {
    await openCloudResource(id)
  }

  return (
    <Table>
      <TableHeader>
        <Col>{transI18n('cloud.fileName')}</Col>
        <Col>{transI18n('cloud.size')}</Col>
        <Col>{transI18n('cloud.progress')}</Col>
        <Col>{transI18n('cloud.operation')}</Col>
      </TableHeader>
      <Table className="table-container">
        {downloadList.length ? downloadList.map(({ id, name, progress, size, type, taskUuid, download }: any, idx: number) =>
          <Row height={10} border={1} key={`${id}${idx}`}>
            <Col style={{cursor: 'pointer', paddingLeft:19}} onClick={() => {
              onResourceClick(id)
            }}>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
              <Inline className="filename" color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Inline color="#586376">{size}</Inline>
            </Col>
            <Col>
              <Progress width={60} type="download" progress={progress} />
              <Inline color="#586376" style={{marginLeft:5}}>{progress}%</Inline>
            </Col>
            <Col>
              <Row className="btn-group no-padding" gap={10} style={{paddingRight: 10}}>
                {
                  !download ? 
                  <Button style={{fontSize:12}} type="secondary" disabled={progress === 100} action="download" onClick={async () => {
                    await startDownload(taskUuid)
                  }}>{!download ? <span>{transI18n('cloud.download')}</span> : <span>{transI18n('cloud.downloading')}</span>}</Button>
                : 
                  <Button style={{fontSize:12}} type="secondary" disabled={progress === 100}>{transI18n('cloud.downloading')}</Button>
                }
                <Button type="ghost" disabled={progress === 100 ? false : true} onClick={() => deleteSingle(taskUuid)}>{transI18n('cloud.delete')}</Button>
              </Row>
            </Col>
          </Row>
        ) : <Placeholder placeholderType="noFile"/>}
      </Table>
    </Table>
  )
})