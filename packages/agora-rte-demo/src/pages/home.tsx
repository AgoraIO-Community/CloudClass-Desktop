import React, { useEffect, useState } from 'react';
import { Theme, FormControl, Tooltip, Checkbox, FormControlLabel } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {CustomButton} from '@/components/custom-button';
import { RoleRadio } from '@/components/role-radio';
import {CustomIcon} from '@/components/icon';
import {FormInput} from '@/components/form-input';
import {FormSelect} from '@/components/form-select';
import {LangSelect} from '@/components/lang-select';
import {useHistory} from 'react-router-dom';
import { Loading } from '@/components/loading';
import { t } from '../i18n';
import { useUIStore, useAppStore, useBoardStore, useHomeStore, useHomeUIStore } from '@/hooks';
import { AppStore, UIStore } from '@/stores/app';
import { GlobalStorage, storage } from '@/utils/custom-storage';
import { EduManager, GenericErrorWrapper } from 'agora-rte-sdk';
import {isElectron} from '@/utils/platform';
import { EduRoleTypeEnum } from 'agora-rte-sdk';
import {observer} from 'mobx-react';
import { homeApi } from '@/services/home-api';
import { BizLogger } from '@/utils/biz-logger';
// import {CloudDiskUpload} from '@/components/upload'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dayjs from 'dayjs'
import { AgoraEduSDK, CourseWareItem, LaunchOption } from '@/edu-sdk';
import { mapFileType } from '@/services/upload-service';
import {agoraCaches} from '@/utils/web-download.file'
import { PPTProgress } from '@/components/netless-board/loading';
import { StorageDisk } from '@/monolithic/disk/index'
import { AgoraEduEvent } from '@/edu-sdk/declare';
import { startDownload } from '@/utils/utils';
import { Progress } from '@/components/progress/progress';

const transformPPT = (data: any): CourseWareItem[] => {
  return [].concat(data).map((item: any) => ({
    ...item,
    type: mapFileType(item.ext),
    scenes: item.taskProgress.convertedFileList,
  }))
}

export async function fetchPPT() {
  let res = await fetch("https://api-solutions-dev.bj2.agoralab.co/scene/apps/f488493d1886435f963dfb3d95984fd4/v1/rooms/courseware0/users/liyang1/properties/resources", {
    method: 'GET',
    headers: {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJwcmltYXJ5U3RyZWFtVXVpZCI6IjE5NjU3ODQ1MzgiLCJhcHBJZCI6ImY0ODg0OTNkMTg4NjQzNWY5NjNkZmIzZDk1OTg0ZmQ0IiwidXNlclV1aWQiOiJsaXlhbmcxIiwicm9vbVV1aWQiOiJjb3Vyc2V3YXJlMCIsImlhdCI6MTYxMzEzMjE0Mn0.ZqBsGg-fEpBNM-ZB7yA4meWwIPX0eq4pildVwkUrCd4"
    },
  })
  const resText: any = await res.text()
  const result = JSON.parse(resText)
  if (result.code !== 0) {
   throw GenericErrorWrapper({
      message: result.msg,
      code: result.code
    })
  }
  const pptList = []
  for (let key of Object.keys(result.data)) {
    pptList.push(result.data[key])
  }
  return pptList
}

const useStyles = makeStyles ((theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  formControl: {
    minWidth: '240px',
    maxWidth: '240px',
  }
}));

type SessionInfo = {
  roomName: string,
  roomType: number,
  userName: string,
  role: string,
  startTime: string,
  duration: number,
  pretest: boolean
}

const roleName = [
  '',
  'teacher',
  'student',
  'assistant',
  'invisible'
]

const roles = {
  'teacher': EduRoleTypeEnum.teacher,
  'student': EduRoleTypeEnum.student,
  'assistant': EduRoleTypeEnum.assistant,
  'invisible': EduRoleTypeEnum.invisible
}

const getRoleType = (role: EduRoleTypeEnum): string => roleName[role] || ""

const roomTypes = UIStore.roomTypes

export const HomePage = observer(() => {
  document.title = t(`home.short_title.title`)

  const classes = useStyles();

  const history = useHistory();

  const uiStore = useHomeUIStore();

  const homeStore = useHomeStore()

  const [courseWareList, updateCourseWareList] = useState<any[]>(storage.getCourseWareSaveList())

  const handleSetting = (evt: any) => {
    history.push({pathname: '/setting'})
  }

  const [lock, setLock] = useState<boolean>(false);

  const handleUpload = async (evt: any) => {
    try {
      setLock(true)
      // const id = await EduManager.uploadLog('0')
      // uiStore.showDialog({
      //   type: 'feedLog',
      //   message: `id: ${id}`
      // })
      setLock(false)
    } catch (err) {
      uiStore.addToast(t('upload_log_failed'))
      setLock(false)
    }
  }

  const [session, setSessionInfo] = useState<SessionInfo>({
    roomName: '',
    roomType: 0,
    role: '',
    userName: '',
    startTime: dayjs().add(2, 'minute').format("YYYY-MM-DDTHH:mm"),
    duration: 30,
    pretest: true,
    // roomName: appStore.roomInfo.roomName,
    // roomType: appStore.roomInfo.roomType,
    // role: getRoleType(appStore.roomInfo.userRole),
    // userName: appStore.roomInfo.userName,
    // startTime: dayjs().add(2, 'minute').format("YYYY-MM-DDTHH:mm"),
    // duration: 30
  });

  //@ts-ignore
  window.session = session

  const [required, setRequired] = useState<any>({} as any);

  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async () => {
    if (!session.roomName) {
      setRequired({...required, roomName: t('home.missing_room_name')});
      return;
    }

    if (!session.userName) {
      setRequired({...required, userName: t('home.missing_your_name')});
      return;
    }

    if (!session.role) {
      setRequired({...required, role: t('home.missing_role')});
      return;
    }
    
    if (!roomTypes[session.roomType]) return;

    const roomType = roomTypes[session.roomType].value

    const userRole = roles[session.role]

    const roomUuid = `${session.roomName}${roomType}`;
    const uid = `${session.userName}${userRole}`;
    const pretest = !!(session.pretest)

    // try {
    //   setLoading(true)
    //   let {userUuid, rtmToken} = await homeApi.login(uid)
    //   setLoading(false)
    //   appStore.setRoomInfo({
    //     rtmUid: userUuid,
    //     rtmToken: rtmToken,
    //     roomType: roomType,
    //     roomName: session.roomName,
    //     userName: session.userName,
    //     userRole: userRole,
    //     userUuid: `${userUuid}`,
    //     roomUuid: `${roomUuid}`,
    //   })
      
    //   appStore.params.startTime = +dayjs(session.startTime)
    //   appStore.params.duration = session.duration * 60

    //   const path = roomTypes[session.roomType].path
    //   history.push(`${path}`)
    // } catch (err) {
    //   BizLogger.warn(JSON.stringify(err))
    //   setLoading(false)
    // }

    const language = uiStore.language

    try {
      setLoading(true)
      let {userUuid, rtmToken} = await homeApi.login(uid)
      homeStore.setLaunchConfig({
        rtmUid: userUuid,
        pretest,
        courseWareList: courseWareList.slice(0, 1),
        personalCourseWareList: courseWareList.slice(1, courseWareList.length),
        translateLanguage: "auto",
        language: language,
        userUuid: `${userUuid}`,
        rtmToken,
        roomUuid,
        roomType: roomType,
        roomName: session.roomName,
        userName: session.userName,
        roleType: userRole,
        startTime: +dayjs(session.startTime),
        duration: session.duration * 60,
        recordLanguage: 'en',
      })
      setLoading(false)
      history.push('/acadsoc/launch')
      // history.push(roomTypes[0].path)
    } catch (err) {
      BizLogger.warn(JSON.stringify(err))
      setLoading(false)
    }
  }

  const fetchCourseWareList = async () => {
    const list = await fetchPPT()
    const courseWareList = transformPPT(list)
    storage.saveCourseWareList(JSON.stringify(courseWareList))
    updateCourseWareList(courseWareList)
  }

  const [downloading, setDownloading] = useState<boolean>(false)

  const [progressing, setProgressing] = useState<number>(0)

  async function downloadPPT(taskUuid: string) {
    setDownloading(true)
    await startDownload(window.isElectron, taskUuid, (progress: number) => {
      setProgressing(progress)

    })
    setDownloading(false)
  }

  const fetchCourseWareZip = async () => {
    for (const item of courseWareList) {
      if (item.taskUuid) {
        await downloadPPT(item.taskUuid)
      }
    }
  }

  return (
    <div className={`flex-container home-cover-web`}>
      {/* <CloudDiskUpload /> */}
      {loading ? <Loading /> : null}
      {/* <PPTProgress /> */}
      {downloading ? <Progress title={`downloading: ${progressing}%`} /> : null}
      {/* {downloading ? <} */}
      {false ? null : 
      <div className="web-menu">
        <div className="web-menu-container">
          <div className="short-title">
            <span className="title">{t('home.short_title.title')}</span>
            <span className="subtitle">{t('home.short_title.subtitle')}</span>
            <span className="build-version">{t("build_version")}</span>
          </div>
          <div className="setting-container">
            <div className="flex-row">
              <Tooltip title={t("icon.upload-log")} placement="top">
                <span>
                  <CustomIcon className={lock ? "icon-loading" : "icon-upload"} onClick={handleUpload}></CustomIcon>
                </span>
              </Tooltip>
              <Tooltip title={t("icon.setting")} placement="top">
                <span>
                  <CustomIcon className="icon-setting" onClick={handleSetting}/>
                </span>
              </Tooltip>
            </div>
              <LangSelect
                value={uiStore.languageIdx}
                onChange={(evt: any) => {
                  const value = evt.target.value;
                  if (value === 0) {
                    uiStore.setLanguage('zh');
                  } else if (value === 2) {
                    uiStore.setLanguage('zh-hk');
                  } else {
                    uiStore.setLanguage('en');
                  }
                }}
                items={UIStore.languages}>
              </LangSelect>
          </div>
        </div>
      </div>
      }
      <div className="custom-card">
        {/* {!uiStore.isElectron ? <GithubIcon /> : null} */}
        <div className="flex-item cover">
          {false ? 
          <>
          <div className={`short-title ${GlobalStorage.getLanguage()}`}>
            <span className="title">{t('home.short_title.title')}</span>
            <span className="subtitle">{t('home.short_title.subtitle')}</span>
          </div>
          <div className={`cover-placeholder ${t('home.cover_class')}`}></div>
          <div className='build-version'>{t("build_version")}</div>
          </>
          : 
          // 测试 demo
          <div className="test-demo">
            <div style={{margin: '30px'}}>
              <form className={classes.container} noValidate>
                <TextField
                  id="datetime-local"
                  label={t("aclass.home.begin_time")}
                  type="datetime-local"
                  // defaultValue={session.startTime}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={session.startTime}
                  style={{width: '250px'}}
                  onChange={(e: any) => {
                    setSessionInfo({
                      ...session,
                      startTime: e.target.value
                    })
                  }}
                />
                <TextField 
                  style={{marginLeft: '10px'}} 
                  id="time-test1"
                  value={session.duration}
                  onChange={(e: any) => {
                    setSessionInfo({
                      ...session,
                      duration: e.target.value
                    })
                  }}
                  label={t("aclass.home.duration")}
                />
              </form>
            </div>
            <div style={{margin: '20px'}}>
            <Button variant="contained" style={{margin: '5px'}} color="primary" onClick={fetchCourseWareList}>
              {t("aclass.home.material_list")}
            </Button>
            <Button variant="contained" style={{margin: '5px'}} color="primary" onClick={fetchCourseWareZip}>
              {t("aclass.home.download_course")}
            </Button>
            <Button variant="contained" style={{margin: '5px'}} color="primary" onClick={() => {
              console.log('清空课件缓存')
            }}>
             {t("aclass.home.clear_course_cache")}
            </Button>
            <Button variant="contained" style={{margin: '5px'}} color="primary" onClick={() => {
              setSessionInfo({
                ...session,
                roomName: 'test_' + session.roomName
              });
              handleSubmit()
            }}>
             {t("aclass.home.join_test_room")}
            </Button>
            <Button onClick={async () => {
              const dom = document.createElement("div")
              Object.assign(dom.style, {
                position: 'absolute',
                width: '500px',
                height: '500px',
              })
              dom.id = "disk"
              document.body.appendChild(dom)
              try {
                await AgoraEduSDK.openDisk(dom, {
                  language: uiStore.language,
                  courseWareList: storage.getCourseWareSaveList(),
                  listener: (evt: any) => {
                    if (evt === AgoraEduEvent.destroyed) {
                      history.push('/')
                    }
                  }
                })
              } catch (err) {
                console.error(err)
                const targetDom$ = document.querySelector(`#${dom.id}`)
                if (targetDom$) {
                  targetDom$.parentElement?.removeChild(targetDom$)
                }
              }

            }} style={{margin: '5px'}} variant="contained" component="a" color="primary">
              {t("aclass.downloadPage")}
            </Button>
            </div>
          </div>
          // <div className={`cover-placeholder-web ${t('home.cover_class')}`}></div>
          }
        </div>
        <div className="flex-item card">
          <div className="position-top card-menu">
            {false && 
            <>
                <Tooltip title={t("icon.setting")} placement="bottom">
                  <span>
                    <CustomIcon className="icon-setting" onClick={handleSetting}/>
                  </span>
                </Tooltip>
                {/* <div className="icon-container">
                  <CustomIcon className="icon-minimum" onClick={() => {
                    uiStore.windowMinimum()
                  }}/>
                  <CustomIcon className="icon-close" onClick={() => {
                    uiStore.windowClose()
                  }}/>
                </div> */}
            </>
            }
          </div>
          <div className="position-content flex-direction-column">
            <FormControl className={classes.formControl}>
              <FormInput
                alphabetical={true}
                Label={t('home.room_name')}
                value={session.roomName}
                onChange={
                  (val: string) => {
                    setSessionInfo({
                      ...session,
                      roomName: val
                    });
                  }
                }
                requiredText={required.roomName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormInput
                alphabetical={true}
                Label={t('home.nickname')}
                value={session.userName}
                onChange={(val: string) => {
                  setSessionInfo({
                    ...session,
                    userName: val
                  });
                }}
                requiredText={required.userName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormSelect 
                Label={t('home.room_type')}
                value={session.roomType}
                onChange={(evt: any) => {
                  setSessionInfo({
                    ...session,
                    role: '',
                    roomType: evt.target.value
                  });
                }}
                items={roomTypes
                  .map((it: any) => ({
                  value: it.value,
                  text: t(`${it.text}`),
                  path: it.path
                }))}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <RoleRadio role={session.role} type={session.roomType} onChange={(evt: any) => {
                 setSessionInfo({
                   ...session,
                   role: evt.target.value
                 });
              }} requiredText={required.role}></RoleRadio>
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormControlLabel
                control={<Checkbox checked={session.pretest} onChange={(evt: any) => {
                  setSessionInfo({
                    ...session,
                    pretest: evt.target.checked
                  });
                }} color="primary" name="pretest" />}
                label={t('aclass.pretest')} 
              />
            </FormControl>
            <CustomButton name={t('home.room_join')} onClick={handleSubmit}/>
          </div>
        </div>
      </div>
    </div>
    // fixme 临时调试下载课件
  // return  <StorageDisk></StorageDisk>
  )
})