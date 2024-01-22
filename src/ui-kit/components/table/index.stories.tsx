import { Meta } from '@storybook/react';
import React from 'react';
import { Col, Inline, Row, Table, TableHeader } from '.';
import { Placeholder } from '../placeholder';
import { SvgImg } from '../svg-img';

const meta: Meta = {
  title: 'Components/Table',
  component: Table,
};

const list = [
  {
    id: 0,
    type: 'h5',
    name: 'PPT课件制作规范.h5',
    progress: 0.2,
    size: 10000,
    date: '2021-02-15',
    checked: false,
  },
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
];

export type CloudStorageProps = {
  size: number;
};


const resizeList = (items: any[], number: number): any[] => {
  if (number < 0) {
    return items;
  }
  return items.concat(resizeList(items, number - 1));
};

export const CloudStorage = ({ size }: CloudStorageProps) => {
  const itemList = resizeList(list, size);

  return (
    <Table>
      <TableHeader>
        <Col>文件</Col>
        <Col>大小</Col>
        <Col>修改时间</Col>
      </TableHeader>
      <Table className="table-container">
        {itemList.length ? (
          itemList.map(({ name, progress, date, type }: any, idx: number) => (
            <Row height={10} border={1} key={idx}>
              <Col>
                <SvgImg type={type} style={{ marginRight: 6 }} />
                <Inline color="#191919">{name}</Inline>
              </Col>
              <Col>
                <Inline color="#586376">{size}</Inline>
              </Col>
              <Col>
                <Inline color="#586376">{date}</Inline>
              </Col>
            </Row>
          ))
        ) : (
          <Placeholder placeholderType="noFile" />
        )}
      </Table>
    </Table>
  );
};

CloudStorage.args = {
  size: 1,
};


export default meta;
