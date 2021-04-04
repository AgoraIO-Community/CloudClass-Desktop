import { useUploadContext } from '@/ui-components/hooks'
import { CheckBox, Col, IconBox, Inline, Placeholder, Row, t, Table, TableHeader } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React from 'react'

export interface UploadContainerProps {
  handleUpdateCheckedItems: (ids: string[]) => void
}

export const UploadContainer: React.FC<UploadContainerProps> = observer(({handleUpdateCheckedItems}) => {

  const {
    changeChecked,
    handleSelectAll,
    hasSelected,
    items,
    isSelectAll,
  } = useUploadContext(handleUpdateCheckedItems)

  return (
    <Table>
      <TableHeader>
        <Col width={9}>
          <CheckBox checked={isSelectAll} indeterminate={isSelectAll ? false : hasSelected} onClick={handleSelectAll}></CheckBox>
        </Col>
        <Col>{t('cloud.fileName')}</Col>
        <Col>{t('cloud.size')}</Col>
        <Col>{t('cloud.operation')}</Col>
      </TableHeader>
      <Table className="table-container">
        {items.length ? items.map(({ id, name, size, updateTime, type, checked }: any, idx: number) =>
          <Row height={10} border={1} key={idx}>
            <Col width={9}>
              <CheckBox className="checkbox" onClick={(evt: any) => {
                changeChecked(id, evt.currentTarget.checked)
              }} checked={checked}></CheckBox>
            </Col>
            <Col>
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