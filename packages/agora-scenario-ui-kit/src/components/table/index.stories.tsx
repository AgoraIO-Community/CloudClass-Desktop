import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import React, { useCallback, useMemo } from 'react';
import { Button, Modal } from '~components';
import { Icon, IconBox } from '~components/icon';
import { CheckBox, Col, Inline, Row, Table, TableHeader } from '~components/table';
import { Progress } from '~components/progress';
import { formatFileSize } from '~utilities';
import { Tabs, TabPane } from '~components/tabs';
import { Loading } from '~components/loading'

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
  size: number
}

export const CloudStorage = ({ size }: CloudStorageProps) => {

  const itemList = resizeList(list, size)

  return (
    <Table>
      <TableHeader>
        <Col>文件</Col>
        <Col>大小</Col>
        <Col>修改时间</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.map(({ name, progress, date, type }: any, idx: number) =>
          <Row height={10} border={1} key={idx} >
            <Col>
              <IconBox iconType={type} style={{ marginRight: '6px' }} />
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
    </Table>
  )
}

CloudStorage.args = {
  size: 1
}

export type UploadListProps = {
  progress: number,
  size: number,
}

const resizeList = (items: any[], number: number): any[] => {
  if (number < 0) {
    return items
  }
  return items.concat(resizeList(items, number - 1))
}

export const UploadList = ({ size, progress }: UploadListProps) => {

  const itemList = resizeList(list, size)

  return (
    <Table>
      <TableHeader>
        <Col>文件</Col>
        <Col>进度</Col>
        <Col>操作</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.map(({ name, progress, type }: any, idx: number) =>
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
  progress: 0,
  size: 0
}

const CheckList = ({ size, progress }: UploadListProps) => {

  const [items, updateItems] = React.useState<any[]>(list)

  const hasSelected = useMemo(() => {
    return !!items.find((item: any) => item.checked === true)
  }, [items])

  const isSelectAll = useMemo(() => {
    return items.filter((item: any) => item.checked === true).length === items.length
  }, [items])

  const handleSelectAll = React.useCallback((evt: any) => {
    if (!isSelectAll) {
      const changedItems = items.map((item: any) => ({ ...item, checked: true }))
      updateItems(changedItems)
    } else {
      const changedItems = items.map((item: any) => ({ ...item, checked: false }))
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

  return (
    <Table>
      <TableHeader>
        <Col width={9}>
          <CheckBox checked={isSelectAll} indeterminate={isSelectAll ? false : hasSelected} onClick={handleSelectAll}></CheckBox>
        </Col>
        <Col>文件</Col>
        {/* <Col></Col> */}
        <Col>大小</Col>
        <Col>修改时间</Col>
      </TableHeader>
      <Table className="table-container">
        {items.map(({ id, name, size, date, type, checked }: any, idx: number) =>
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
            {/* <Col>
              <div style={{width: 30}}></div>
            </Col> */}
            <Col>
              <Inline color="#586376">{formatFileSize(size)}</Inline>
            </Col>
            <Col>
              <Inline color="#586376">{date}</Inline>
            </Col>
          </Row>
        )}
      </Table>
    </Table>
  )
}

CheckList.args = {
  progress: 0,
  size: 0
}

type CourseWareManagerProps = {
  onOk?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
}

export const CourseWareManager = ({
  onOk = (e) => console.log('onOK'),
  onCancel = (e) => console.log('onCancel'),
}: CourseWareManagerProps) => {

  const handleChange = (activeKey: string) => {
    console.log('change Key', activeKey)
  }

  return (
    <div className="agora-board-resources">
      <div className="btn-pin">
        <Icon type="close" hover onClick={onCancel}></Icon>
      </div>
      <Tabs tabBarGutter={43} defaultActiveKey="2" onChange={handleChange}>
        <TabPane tab="公共资源" key="1">
          <CloudStorage size={1} />
        </TabPane>
        <TabPane tab="我的资源" key="2">
          <Row className="btn-group margin-gap">
            <Button type="primary">上传</Button>
            <Button type="ghost">删除</Button>
            <Button type="secondary" onClick={() => {
              Modal.show({
                title: '上传',
                width: 450,
                children: (
                  <Loading
                    hasLoadingGif={false}
                    uploadItemList={
                      [
                        {
                          iconType: 'format-pdf',
                          fileName: 'pdf文件',
                          fileSize: '2.4M',
                          uploadComplete: false,
                          currentProgress: .5,
                        },
                        {
                          iconType: 'format-pdf',
                          fileName: 'pdf文件',
                          fileSize: '2.4M',
                          uploadComplete: false,
                          currentProgress: .5,
                        }
                      ]
                    }
                  />
                )
              })
            }}>Modal</Button>
          </Row>
          <CheckList size={1} progress={20} />
        </TabPane>
        <TabPane tab="下载课件" key="3">
          <UploadList size={1} progress={20} />
        </TabPane>
      </Tabs>
    </div>
  )
}

export const CheckBoxShowCase = ({ size, progress }: UploadListProps) => {
  return (
    <Button
      onClick={() => {
        Modal.show({
          closable: true,
          onOk: () => { console.log('ok') },
          onCancel: () => { console.log('cancel') },
          component: (
            <CourseWareManager />
          )
        })
      }}
    >
      show checklist
    </Button>
  )
}

CheckBoxShowCase.args = {
  progress: 0,
  size: 0
}

export const UploadProgress = () => {
  return (
    <div className="">
      <header className="">

      </header>
      <section>

      </section>
    </div>
  )
}

UploadProgress.args = {
  progress: 0,
  size: 0
}

export default meta;
