import React from 'react';
import { Meta } from '@storybook/react';
import { Col, Inline, Progress, Row, Table, TableHeader } from '~components/table';
import { IconBox } from '~components/icon';

const meta: Meta = {
  title: 'Components/Table',
  component: Table,
};

export type CloudStorageProps = {
  width: number
}

export const CloudStorage = ({width}: CloudStorageProps) => {
  return(
    <Table style={{width: width}}>
      <TableHeader>
        <Col>文件</Col>
        <Col>大小</Col>
        <Col>修改时间</Col>
      </TableHeader>
      <Row>
        <Col>
          <IconBox iconType="format-ppt" style={{marginRight: '6px'}} />
          <Inline color="#191919">PPT课件制作规范.pptx</Inline>
        </Col>
        <Col>
          <Inline color="#586376">1.3M</Inline>
        </Col>
        <Col>
          <Inline color="#586376">2021-02-15</Inline>
        </Col>
      </Row>
    </Table>
  )
}

CloudStorage.args = {
  width: 560
}

export type UploadListProps = {
  width: number,
  progress: number
}

export const UploadList = ({width, progress}: UploadListProps) => {

  const list = [
    {
      type: 'ppt',
      name: 'PPT课件制作规范.pptx',
      progress: 0.2,
      date: '2021-02-15'
    },
    {
      type: 'docx',
      name: 'Docx课件制作规范.pptx',
      progress: 0.3,
      date: '2021-02-15'
    },
    {
      type: 'doc',
      name: 'Doc课件制作规范.doc',
      progress: 0.5,
      date: '2021-02-15'
    },
    {
      type: 'mp4',
      name: '视频.mp4',
      progress: 0.6,
      date: '2021-02-15'
    },
    {
      type: 'mp3',
      name: '音乐.mp3',
      progress: 0.6,
      date: '2021-02-15'
    },
    {
      type: 'pdf',
      name: 'fe.pdf',
      progress: 0.6,
      date: '2021-02-15'
    },
  ]

  return(
    <Table style={{width: width}}>
      <TableHeader>
        <Col>文件</Col>
        <Col>进度</Col>
        <Col>操作</Col>
      </TableHeader>
      {list.map(({name, progress, date}: any, idx: number) => 
        <Row key={idx}>
          <Col>
          <IconBox iconType="format-ppt" style={{marginRight: '6px'}} />
            <Inline color="#191919">{name}</Inline>
          </Col>
          <Col>
            <Progress width={60} type="download" progress={progress} />
          </Col>
          <Col>
            <Inline color="#586376">{date}</Inline>
          </Col>
        </Row>
      )}
    </Table>
  )
}

UploadList.args = {
  width: 560,
  progress: 0
}

export default meta;
