import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { CloudDriveResource } from 'agora-edu-core';
import { useStore } from '~hooks/use-edu-stores';
import { Col, Inline, Placeholder, Row, Table, TableHeader, transI18n, SvgImg } from '~ui-kit';
import CloudToolbar from './cloud-toolbar';
import { useCallback, useEffect } from 'react';
import { FileTypeSvgColor } from '@/infra/stores/common/cloud-ui';

export const PublicResourcesContainer = observer(() => {
  const { cloudUIStore } = useStore();
  const {
    fileNameToType,
    formatFileSize,
    openResource,
    publicResources,
    searchPublicResourcesKeyword,
    setSearchPublicResourcesKeyword,
  } = cloudUIStore;

  const onClickCol = (resourceUuid: string) => {
    const res = publicResources.get(resourceUuid);
    if (res) {
      openResource(res);
    }
  };

  const keyWordChangeHandle = useCallback(
    (keyword: string) => {
      setSearchPublicResourcesKeyword(keyword);
    },
    [setSearchPublicResourcesKeyword],
  );

  useEffect(() => {
    return () => {
      setSearchPublicResourcesKeyword('');
    };
  }, []);

  return (
    <>
      <CloudToolbar
        fileCounts={[...publicResources].length}
        showRefresh={false}
        keyword={searchPublicResourcesKeyword}
        onKeywordChange={keyWordChangeHandle}
      />
      <Table>
        <TableHeader>
          <Col>{transI18n('cloud.fileName')}</Col>
          <Col>{transI18n('cloud.size')}</Col>
          <Col>{transI18n('cloud.updated_at')}</Col>
        </TableHeader>
        <Table className="table-container">
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
                    <SvgImg
                      type={fileNameToType(resourceName)}
                      style={{
                        marginRight: '6px',
                        color: FileTypeSvgColor[fileNameToType(resourceName)],
                      }}
                    />
                    <Inline className="filename" color="#191919" title={resourceName}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: searchPublicResourcesKeyword
                            ? resourceName.replaceAll(
                                searchPublicResourcesKeyword,
                                `<span style="color: #357BF6">${searchPublicResourcesKeyword}</span>`,
                              )
                            : resourceName,
                        }}></span>
                    </Inline>
                  </Col>
                  <Col>
                    <Inline color="#586376">{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline color="#586376">
                      {!!updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm') : '- -'}
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
    </>
  );
});
