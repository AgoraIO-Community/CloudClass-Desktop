import React, { Dispatch, ReactEventHandler, SetStateAction } from 'react'
import { DiskTablesProps } from 'agora-aclass-ui-kit'

interface DownloadDiskProps {
  // downloadComponet
  downloadList?: any,

  showOpenItem?: boolean,
  setDownloadList?: Dispatch<SetStateAction<any>>,

  registerTaskCallback: (uuid: string, onProgress: (progress: number) => void, onComplete: () => void) => any,
  handleDownloadAll: (evt: any) => any,
  handleClearAll: () => Promise<void>,
  handleDownload: (uuid: string, onProgressCallback?: (progress: number) => void, onComplete?: () => void) => any,
  handleDeleteSingle: (evt: any) => any,
  downloadAllComponent?: React.ReactNode,
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
  downloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,

  totalProgress?: number,

  handleDownloadAll: (evt: any) => any,
  handleClearAll: () => Promise<void>,
  handleDownload: (uuid: string, onProgressCallback?: (progress: number) => void, onComplete?: () => void) => any,
  handleDeleteSingle: (evt: any) => any,
  setDownloadList?: Dispatch<SetStateAction<any>>,
}