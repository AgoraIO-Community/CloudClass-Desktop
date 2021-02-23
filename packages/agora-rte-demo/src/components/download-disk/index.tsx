import React, { Dispatch, ReactEventHandler, SetStateAction } from 'react'
import { DiskTablesProps } from 'agora-aclass-ui-kit'
import DownloadDiskTables from './download-disk-table'

interface DownloadDiskProps {
  // downloadComponet
  downloadList?: any,

  showOpenItem?: boolean,
  setDownloadList?: Dispatch<SetStateAction<any>>,
  handleDownloadAll?: () => any,
  handleClearcache?: () => Promise<void>,
  handleDownload?: (evt: any) => any,
  handleDeleteSingle?: (evt: any) => any,
  donwloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,
  diskText?: any,
  diskOpenText?: any,
  inRoom?: boolean,
}

export interface DownloadDiskTablesProps extends DiskTablesProps {
  diskText?: any,
  downloadList?: any,
  donwloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,
  handleDownloadAll?: () => any,

  handleClearcache?: () => Promise<void>,
  handleDownload?: (evt: any) => any,
  handleDeleteSingle?: (evt: any) => any,
  setDownloadList?: Dispatch<SetStateAction<any>>,
}


const DownloadDisk = (props: DownloadDiskProps) => {
  return (
    <>
      <DownloadDiskTables
        tabValue={0}
        setDownloadList={props.setDownloadList}
        diskText={props.diskText}
        handleDownloadAll={props.handleDownloadAll}
        handleClearcache={props.handleClearcache}
        handleDownload={props.handleDownload}
        handleDeleteSingle={props.handleDeleteSingle}
        singleDownloadComponent={props.singleDownloadComponent}
        singleDeleteComponent={props.singleDeleteComponent}
        downloadList={props.downloadList}
        showText={props.diskOpenText}
      />
    </>
  )
}

export default DownloadDisk