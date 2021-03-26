import { observer } from 'mobx-react'
import { Button, Col, IconBox, Progress, Inline, Row, CheckBox, Table, TableHeader, formatFileSize, t, Placeholder } from 'agora-scenario-ui-kit'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import { useBoardStore } from '@/hooks'
import { agoraCaches } from '@/utils/web-download.file'
import dayjs from 'dayjs'
import { useUploadContext } from '@/ui-components/hooks'

export interface UploadContainerProps {
  handleUpdateCheckedItems: (ids: string[]) => void
}

export const UploadContainer: React.FC<UploadContainerProps> = observer(({handleUpdateCheckedItems}) => {

  const {
    changeChecked,
    handleSelectAll,
    hasSelected,
    setCheckMap,
    checkMap,
    boardStore,
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
        <Col>{t('cloud.updatedAt')}</Col>
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