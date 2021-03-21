import { observer } from 'mobx-react'
import { Button, Col, IconBox, Progress, Inline, Row, CheckBox, Table, TableHeader, formatFileSize } from 'agora-scenario-ui-kit'
import React, {useCallback, useMemo, useState} from 'react'
import { useBoardStore } from '@/hooks'
import { agoraCaches } from '@/utils/web-download.file'
import { useI18nContext } from '@/utils/utils'
import dayjs from 'dayjs'

export const UploadContainer = observer(() => {

  const {t} = useI18nContext()

  const boardStore = useBoardStore()

  const [checkMap, setCheckMap] = useState<Record<string, any>>({})

  const items = useMemo(() => {
    return boardStore.personalResources.map((it: any) => ({
      ...it,
      checked: !!checkMap[it.id]
    }))
  },[boardStore.personalResources.length, JSON.stringify(checkMap)])
  // const [items, updateItems] = React.useState<any[]>(boardStore.personalResources)

  const hasSelected: any = useMemo(() => {
    return !!items.find((item: any) => !!item.checked)
  }, [items, checkMap])

  const isSelectAll: any = useMemo(() => {
    const selected = items.filter((item: any) => !!item.checked)
    return selected.length === items.length ? true : false
  }, [items, checkMap])

  const handleSelectAll = useCallback((evt: any) => {
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
    const idx = items.findIndex((item: any) => item.id === id)
    if (idx >= 0) {
      setCheckMap({
        ...checkMap,
        ...{[`${id}`]: +checked},
      })
    }
  }, [items, checkMap])

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
        {items.map(({ id, name, size, updateTime, type, checked }: any, idx: number) =>
          <Row height={10} border={1} key={idx}>
            <Col width={9}>
              <CheckBox className="checkbox" onClick={(evt: any) => {
                changeChecked(id, evt.currentTarget.checked)
              }} checked={checked}></CheckBox>
            </Col>
            <Col>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
              <Inline color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Inline color="#586376">{size}</Inline>
            </Col>
            <Col>
              <Inline color="#586376">{dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")}</Inline>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
})