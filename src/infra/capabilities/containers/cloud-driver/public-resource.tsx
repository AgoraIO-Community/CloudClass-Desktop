import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { CloudDriveResource } from 'agora-edu-core';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { Col, Inline, Placeholder, Row, Table, TableHeader, SvgImg } from '@classroom/ui-kit';
import CloudToolbar from './cloud-toolbar';
import { useCallback, useEffect } from 'react';
import { FileTypeSvgColor } from '@classroom/infra/stores/common/cloud-drive';
import { useI18n } from 'agora-common-libs';

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
  const transI18n = useI18n();

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
              ([key, { resourceName, updateTime, size, resourceUuid, ext }]: [
                string,
                CloudDriveResource,
              ]) => (
                <Row height={10} border={1} key={key}>
                  <Col
                    style={{ cursor: 'pointer', paddingLeft: 19 }}
                    onClick={() => onClickCol(resourceUuid)}>
                    <SvgImg
                      type={fileNameToType(ext)}
                      style={{
                        marginRight: '6px',
                        color:
                          FileTypeSvgColor[
                            fileNameToType(resourceName) as keyof typeof FileTypeSvgColor
                          ],
                      }}
                    />
                    <Inline className="filename" title={resourceName}>
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
                    <Inline>{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline>
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
