import React, { useCallback, useEffect, useMemo } from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CheckBox, Col, Inline, Progress, Row, Table, TableHeader } from '~components/table';
import { IconBox } from '~components/icon';
import { Button } from '~components';
import ReactDOM from 'react-dom';
import { formatFileSize } from '~utilities';

const meta: Meta = {
  title: 'Components/Table',
  component: Table
};

const list = [
  {
    id: 1,
    type: 'ppt',
    name: 'PPT课件制作规范.pptx',
    progress: 0.2,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 2,
    type: 'word',
    name: 'Docx课件制作规范.pptx',
    progress: 0.3,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 3,
    type: 'excel',
    name: 'Excel课件制作.excel',
    progress: 0.5,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 4,
    type: 'video',
    name: '视频.mp4',
    progress: 0.6,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 5,
    type: 'audio',
    name: '音乐.mp3',
    progress: 0.6,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 6,
    type: 'pdf',
    name: 'fe.pdf',
    progress: 0.6,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
  {
    id: 7,
    type: 'image',
    name: 'fe.jpg',
    progress: 0.6,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
]

export type CloudStorageProps = {
  width: number,
  size: number
}

export const CloudStorage = ({width, size}: CloudStorageProps) => {
  return(
    <Table style={{width: width}}>
      <TableHeader>
        <Col>文件</Col>
        <Col>大小</Col>
        <Col>修改时间</Col>
      </TableHeader>
      {resizeList(list, size).map(({name, progress, date, type}: any, idx: number) => 
        <Row height={10} border={1} key={idx} >
          <Col>
            <IconBox iconType={type} style={{marginRight: '6px'}} />
            <Inline color="#191919">{name}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{formatFileSize(size)}</Inline>
          </Col>
          <Col>
            <Inline color="#586376">{date}</Inline>
          </Col>
        </Row>
      )}
    </Table>
  )
}

CloudStorage.args = {
  width: 560,
  size: 1
}

export type UploadListProps = {
  width: number,
  progress: number,
  size: number,
}

const resizeList = (items: any[], number: number): any[] => {
  if (number < 0) {
    return items
  }
  return items.concat(resizeList(items, number -1))
}

export const UploadList = ({size, width, progress}: UploadListProps) => {

  return(
    <Table style={{width: width}}>
      <TableHeader>
        <Col>文件</Col>
        <Col>进度</Col>
        <Col>操作</Col>
      </TableHeader>
      <Table style={{
        maxHeight: 450,
        overflow: 'auto'
      }}>
        {resizeList(list, size).map(({name, progress, date, type}: any, idx: number) => 
          <Row height={10} border={1} key={idx}>
            <Col>
            <IconBox iconType={type} style={{marginRight: '6px'}} />
              <Inline color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Progress width={60} type="download" progress={progress} />
            </Col>
            <Col>
              <Row gap={10}>
                <Button type="secondary" onClick={() => {
                  action('download')
                }}>下载</Button>
                <Button type="ghost" onClick={() => {
                  action('deleted')
                }}>删除</Button>
              </Row>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
}

UploadList.args = {
  width: 560,
  progress: 0,
  size: 0
}

export const CheckList = ({size, width, progress}: UploadListProps) => {

  const [items, updateItems] = React.useState<any[]>(list)

  const hasSelected = useMemo(() => {
    return !!items.find((item: any) => item.checked === true)
  }, [items])

  const isSelectAll = useMemo(() => {
    return items.filter((item: any) => item.checked === true).length === items.length
  }, [items]) 

  const handleSelectAll = React.useCallback((evt: any) => {
    if (!isSelectAll) {
      const changedItems = items.map((item: any) => ({...item, checked: true}))
      updateItems(changedItems)
    } else {
      const changedItems = items.map((item: any) => ({...item, checked: false}))
      updateItems(changedItems)
    }
  }, [items, updateItems, isSelectAll])

  const changeChecked = useCallback((id: any, checked: boolean) => {
    const idx = items.findIndex((item: any) => item.id === id)
    if (idx >= 0) {
      items[idx].checked = checked
      updateItems([...items])
    }
  }, [items, updateItems])

  return(
    <Table style={{width: width}}>
      <TableHeader>
        <Col width={30}>
          <CheckBox checked={isSelectAll} indeterminate={isSelectAll ? false : hasSelected} onClick={handleSelectAll}></CheckBox>
        </Col>
        <Col>文件</Col>
        <Col>进度</Col>
        <Col>操作</Col>
      </TableHeader>
      <Table style={{
        maxHeight: 450,
        overflow: 'auto'
      }}>
        {items.map(({id, name, progress, date, type, checked}: any, idx: number) => 
          <Row height={10} border={1} key={idx}>
            <Col width={30}>
              <CheckBox onClick={(evt: any) => {
                changeChecked(id, evt.currentTarget.checked)
              }} checked={checked}></CheckBox>
            </Col>
            <Col>
            <IconBox iconType={type} style={{marginRight: '6px'}} />
              <Inline color="#191919">{name}</Inline>
            </Col>
            <Col>
              <Progress width={60} type="download" progress={progress} />
            </Col>
            <Col>
              <Row gap={10}>
                <Button type="secondary" onClick={() => {
                  action('download')
                }}>下载</Button>
                <Button type="ghost" onClick={() => {
                  action('deleted')
                }}>删除</Button>
              </Row>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
}

CheckList.args = {
  width: 560,
  progress: 0,
  size: 0
}

export default meta;
