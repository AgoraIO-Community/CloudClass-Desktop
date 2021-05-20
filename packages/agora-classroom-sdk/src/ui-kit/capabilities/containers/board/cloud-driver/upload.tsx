import { CheckBox, Col, IconBox, Inline, Placeholder, Row, t, Table, TableHeader, transI18n } from '~ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import * as React from 'react';
import { useCallback } from 'react';
import { useCloudDriveContext } from 'agora-edu-core';
import { useUIStore } from '@/infra/hooks';

export interface UploadContainerProps {
  handleUpdateCheckedItems: (ids: string[]) => void
}

export const UploadContainer: React.FC<UploadContainerProps> = observer(({handleUpdateCheckedItems}) => {

  const {
    openCloudResource,
    personalResources
  } = useCloudDriveContext()

  const {
    updateChecked
  } = useUIStore()

  const [checkMap, setCheckMap] = React.useState<Record<string, any>>({})

  React.useEffect(() => {
    handleUpdateCheckedItems(Object.keys(checkMap))
  }, [checkMap, handleUpdateCheckedItems])

  const items = React.useMemo(() => {
    return personalResources.map((it: any) => ({
      ...it,
      checked: !!checkMap[it.id]
    }))
  },[personalResources.length, JSON.stringify(checkMap)])

  const hasSelected: any = React.useMemo(() => {
    return !!items.find((item: any) => !!item.checked)
  }, [items, checkMap])

  React.useEffect(() => {
    updateChecked(hasSelected)
  }, [hasSelected, updateChecked])

  const isSelectAll: any = React.useMemo(() => {
    const selected = items.filter((item: any) => !!item.checked)
    return items.length > 0 && selected.length === items.length ? true : false
  }, [items, checkMap])

  const handleSelectAll = useCallback((evt: any) => {
    // TODO: skip empty
    if (!items.length) {
      return;
    }
    if (isSelectAll) {
      const ids = items.map((item: any) => ({[`${item.id}`]: 0})).reduce((acc: any, it: any) => ({...acc, ...it}))
      const v = {
        ...checkMap,
        ...ids
      }
      setCheckMap(v)
    } else {
      const ids = items.map((item: any) => ({[`${item.id}`]: 1})).reduce((acc: any, it: any) => ({...acc, ...it}))
      const v = {
        ...checkMap,
        ...ids
      }
      setCheckMap(v)
    }
  }, [items, isSelectAll, checkMap])

  const changeChecked = useCallback((id: any, checked: boolean) => {
    // TODO: skip empty
    if (!items.length) {
      return;
    }
    const idx = items.findIndex((item: any) => item.id === id)
    if (idx >= 0) {
      setCheckMap({
        ...checkMap,
        ...{[`${id}`]: +checked},
      })
    }
  }, [items, checkMap])

  const onResourceClick = async (resourceUuid: string) => {
    await openCloudResource(resourceUuid)
  }

  return (
    <Table>
      <TableHeader>
        <Col width={9}>
          <CheckBox checked={isSelectAll} indeterminate={isSelectAll ? false : hasSelected} onClick={handleSelectAll}></CheckBox>
        </Col>
        <Col>{transI18n('cloud.fileName')}</Col>
        <Col>{transI18n('cloud.size')}</Col>
        <Col>{transI18n('cloud.updated_at')}</Col>
      </TableHeader>
      <Table className="table-container ">
        {items.length ? items.map(({ id, name, size, updateTime, type, checked }: any, idx: number) =>
          <Row height={10} border={1} key={idx}>
            <Col style={{paddingLeft:19}} width={9}>
              <CheckBox className="checkbox" onClick={(evt: any) => {
                changeChecked(id, evt.currentTarget.checked)
              }} checked={checked}></CheckBox>
            </Col>
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