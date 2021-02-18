import { GenAppContainer } from '@/containers/app-container'
import { RoomParameters } from '@/edu-sdk/declare'
import { AppStoreConfigParams } from '@/stores/app'
import React, { useEffect } from 'react'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import { observer, Provider } from 'mobx-react'
import { DiskManagerDialog, UploadFile, DiskButton } from 'agora-aclass-ui-kit'
import {t} from '@/i18n'
import { noop } from 'lodash'
import { diskAppStore, DiskAppStore, DiskLifeStateEnum } from '@/monolithic/disk/disk-store';

const generateClassName = createGenerateClassName({
  productionPrefix: 'agoraEduDisk',
})

type AppType = {
  store: any
}

const DiskContainer = observer((props: any) => {

  const handleClose = () => {
    console.log('close network disk')
  }

  return (
    <div>
      <DiskManagerDialog
        inRoom={false}
        removeText={t('disk.delete')}
        handleDelete={noop}
        removeSuccess={t('disk.deleteSuccess')}
        removeFailed={t('disk.deleteFailed')}
        fullWidth={false}
        visible={props.openDisk}
        onClose={props.handleClose}
        dialogHeaderStyle={{
          minHeight: 40,
        }}
        paperStyle={{
          minWidth: 800,
          minHeight: 587,
          // padding: 20,
          // paddingTop: 0,
          borderRadius: 20,
          overflowY: 'hidden',
        }}
        dialogContentStyle={{
          background: 'transparent',
          borderRadius: 20,
          // display: 'flex',
          // flexDirection: 'column',
          // background: '#DEF4FF',
          // padding: 25
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
        // downloadList={boardStore.allResources}
        // uploadComponent={uploadComponent()}
        // donwloadAllComponent={donwloadAllComponent()}
        // deleteAllCacheComponent={deleteAllCache()}
        // singleDownloadComponent={singleDonwload()}
        // singleDeleteComponent={singleDelete()}
        // handleOpenCourse={handleOpenCourse}
        showOpenItem={true}
        // deleteComponent={deleteComponent()}
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
    <StylesProvider generateClassName={generateClassName}>
      <Provider store={props.store}>
        <DiskContainer />
      </Provider>
    </StylesProvider>
  )
}