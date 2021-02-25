import React from 'react';
import IconEmpty from './assests/icon-empty.png'
import {t} from '@/i18n'
import { DownloadDiskTablesProps } from './index'
import DiskTable from './disk-table'

const DownloadDiskTablesContainer = (props: DownloadDiskTablesProps) => {
  const render = () => {
    return (
      <>
        { props.downloadList && props.downloadList.length > 0 && 
        <DiskTable
          handleDownloadAll={props.handleDownloadAll}
          registerTaskCallback={props.registerTaskCallback}
          downloadList={props.downloadList}
          setDownloadList={props.setDownloadList}
          tabValue={props.tabValue}
          handleClearcache={props.handleClearcache}
          handleDownload={props.handleDownload}
          handleDeleteSingle={props.handleDeleteSingle}
        /> ||
            <div style={{ 
              paddingTop: 54,
              height: '480px',
              width: '730px',
              borderRadius: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '50px',
                flexFlow: 'column',
              }}>
                <img src={IconEmpty} />
                <div style={{ color: '#A9AEC5', fontSize: '14px' }}>{t('disk.noFile')}</div>
              </div>
            </div>
            }
      </>
    )
  }
  return render()
}

export default DownloadDiskTablesContainer;