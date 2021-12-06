import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { CloudDriveResource } from 'agora-edu-core';
import { useStore } from '~hooks/use-edu-stores';
import { Col, Inline, Placeholder, Row, Table, TableHeader, transI18n, SvgImg } from '~ui-kit';

export const PublicResourcesContainer = observer(() => {
  const { cloudUIStore } = useStore();
  const { fileNameToType, formatFileSize, openResource, publicResources } = cloudUIStore;

  const onClickCol = (resourceUuid: string) => {
    const res = publicResources.get(resourceUuid);
    if (res) {
      openResource(res);
    }
  };

  return (
    <Table>
      <TableHeader>
        <Col>{transI18n('cloud.fileName')}</Col>
        <Col>{transI18n('cloud.size')}</Col>
        <Col>{transI18n('cloud.updated_at')}</Col>
      </TableHeader>
      <Table className="table-container" style={{ flex: 1, minHeight: 0 }}>
        {publicResources.size > 0 ? (
          [...publicResources].map(
            ([key, { resourceName, updateTime, size, resourceUuid }]: [
              string,
              CloudDriveResource,
            ]) => (
              <Row height={10} border={1} key={key}>
                <Col
                  style={{ cursor: 'pointer', paddingLeft: 19 }}
                  onClick={() => onClickCol(resourceUuid)}>
                  <SvgImg type={fileNameToType(resourceName)} style={{ marginRight: '6px' }} />
                  <Inline className="filename" color="#191919" title={resourceName}>
                    {resourceName}
                  </Inline>
                </Col>
                <Col>
                  <Inline color="#586376">{formatFileSize(size)}</Inline>
                </Col>
                <Col>
                  <Inline color="#586376">
                    {!!updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss') : '- -'}
                  </Inline>
                </Col>
              </Row>
            ),
          )
        ) : (
          <Placeholder placeholderType="noFile" />
        )}
      </Table>
    </Table>
  );
});
