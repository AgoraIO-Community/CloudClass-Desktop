import React from 'react'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import { observer, Provider } from 'mobx-react'
import { DiskManagerDialog } from 'agora-aclass-ui-kit'
import { t } from '@/i18n'
import { noop } from 'lodash'
// import DownloadDisk from '@/components/download-disk/index'
import { useStorageStore } from '@/hooks'
import { DownloadDiskTable } from '@/components/download-disk/download-disk-table'
import { workerPath } from '@/edu-sdk/controller';
import { useEffect } from 'react'

const generateClassName = createGenerateClassName({
  productionPrefix: 'disk',
  disableGlobal: false,
  seed: 'cloud',
})

type AppType = {
  store: any
}

export type DiskItem = {
  calories: string,
  fat: string,
  progress: number,
  resourceName: string,
  resourceUuid: string,
  status: string,
  type: string
}

const exampleList: DiskItem[] = [{
  calories:"100",
  fat:"1614788122181",
  progress: 0,
  resourceName: "12312312312dsfjdskf",
  resourceUuid: "93b61ab070ec11eb8122cf10b9ec91f7",
  status: "cached",
  type:"ppt"
}]

const DownloadDiskContainer = observer(() => {
  const storageStore = useStorageStore()
  return (
    <DownloadDiskTable
      tabValue={0}
      totalProgress={storageStore.totalProgress}
      diskText={t("disk.downlownResources")}
      downloadList={storageStore.courseWareList}
      handleDownloadAll={async () => await storageStore.downloadAll()}
      handleDownload={async (uuid) => await storageStore.startDownload(uuid)}
      handleClearAll={async () => await storageStore.deleteAllCache()}
      handleDeleteSingle={async (evt) => await storageStore.deleteSingle(evt)}
      showText={t("disk.open")}
    />
  )
})

const DiskContainer = observer((props: any) => {

  const storageStore = useStorageStore()

  useEffect(() => {
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
      navigator.serviceWorker.register(workerPath).then(function(registration) {
        console.log("disk container registration finish")
      }).catch(function(error) {
        console.log('An error happened during installing the service worker:');
        console.log(error.message)
      })
    }
  }, [])

  return (
    <div>
      <DiskManagerDialog
        inRoom={false}
        removeText={t('disk.delete')}
        handleDelete={noop}
        removeSuccess={t('disk.deleteSuccess')}
        removeFailed={t('disk.deleteFailed')}
        fullWidth={false}
        visible={true}
        onClose={async () => {
          await storageStore.destroyDisk()
        }}
        dialogHeaderStyle={{
          minHeight: 40,
        }}
        paperStyle={{
          minWidth: 800,
          minHeight: 587,
          borderRadius: 20,
          overflowY: 'hidden',
        }}
        dialogContentStyle={{
          background: 'transparent',
          borderRadius: 20,
        }}
        questionBtnStyle={{
          top: 16,
          right: 80,
          color: 'white'
        }}
        closeBtnStyle={{
          top: 16,
          right: 18,
          color: 'white'
        }}
        showOpenItem={false}
        downloadDiskComponent={
          <DownloadDiskContainer />
        }
        diskText={{
          publicTab: t('disk.publicResources'),
          privateTab: t('disk.privateResources'),
          downloadTab: t('disk.downlownResources'),
          fileName: t('disk.fileName'),
          size: t('disk.size'),
          modificationTime: t('disk.modificationTime'),
          search: t('disk.search'),
          noFile: t('disk.noFile'),
          file: t('disk.file'),
          progress: t('disk.progress'),
          operation: t('disk.operation'),
          all: t('disk.all'),
          downloaded: t('disk.downloaded'),
          notDownload: t('disk.notDownload'),
          openFile: t('disk.openCourse'),
          download: t('disk.download'),
          delete: t('disk.delete'),
          downloading: t('disk.downloading'),


          downloadAll: t('disk.downloadAll'),
          clearCache: t('disk.clearCache'),
        }}
        fileTooltipText={{
          fileType: t('fileTip.fileType'),
          supportText: t('fileTip.supportText'),
          ppt: t('fileTip.ppt'),
          word: t('fileTip.word'),
          excel: t('fileTip.excel'),
          pdf: t('fileTip.pdf'),
          video: t('fileTip.video'),
          audio: t('fileTip.audio'),
          txt: t('fileTip.txt'),
          pic: t('fileTip.pic'),

          pptType: t('fileTip.pptType'),
          wordType: t('fileTip.wordType'),
          excelType: t('fileTip.excelType'),
          pdfType: t('fileTip.pdfType'),
          videoType: t('fileTip.videoType'),
          audioType: t('fileTip.audioType'),
          txtType: t('fileTip.txtType'),
          picType: t('fileTip.picType'),
        }}
      ></DiskManagerDialog>
    </div>
  )
})

export const StorageDisk = (props: any) => {
  return (
    <StylesProvider injectFirst generateClassName={generateClassName}>
      <Provider store={props.store}>
        <DiskContainer />
      </Provider>
    </StylesProvider>
  )
}