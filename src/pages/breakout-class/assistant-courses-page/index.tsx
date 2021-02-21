import React, { useEffect } from 'react'
import { t } from '@/i18n';
import './index.scss';
import * as moment from 'moment';
import { observer } from 'mobx-react';
import { NavController } from '@/components/nav';
import { useParams, useHistory } from 'react-router-dom';
import { Loading } from '@/components/loading';
import { AutoplayToast } from '@/components/autoplay-toast';
import { makeStyles, Theme, createStyles, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@material-ui/core';
import { useUIStore, useBreakoutRoomStore } from '@/hooks';
import { BizLogger } from '@/utils/biz-logger';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 350,
    },
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

function getIpc() {
  return window.ipc
}

export const AssistantCoursesPage = observer((props: any) => {
  const uiStore = useUIStore()

  // useEffect(() => {
  //   const ipc = getIpc()
  //   if (ipc && ipc.send) {
  //     ipc.send('resize-window', { width: 990, height: 706 });
  //   }
  //   return () => {
  //     const ipc = getIpc()
  //     if (ipc && ipc.send) {
  //       ipc.send('resize-window', { width: 700, height: 500 });
  //     }
  //   }
  // }, [getIpc])

  return (
    <div className={`classroom breakout-class`}>
      {uiStore.loading ? <Loading /> : null}
      <AutoplayToast />
      <NavController />
      <CoursesPage />
    </div>
  )
})

const CoursesPage = observer(() => {

  const classes = useStyles()

  const uiStore = useUIStore()

  const breakoutRoomStore = useBreakoutRoomStore()

  const history = useHistory()

  const refresh = () => {
    window.location.reload()
  }

  const exit = () => {
    uiStore.showDialog({
      type: 'exitRoom',
      message: t('icon.exit-room')
    })
  }

  const {course_name} = useParams<{course_name: string}>()
  useEffect(() => {

    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = (evt: any) => {
      BizLogger.info('[pop] course_name', course_name)
      window.history.pushState(null, document.title, null);
      if (breakoutRoomStore.roomInfo.userRole === EduRoleTypeEnum.assistant) {
        if (breakoutRoomStore.joined && !uiStore.hasDialog('exitRoom')) {
          uiStore.showDialog({
            type: 'exitRoom',
            message: t('icon.exit-room'),
          })
        }
      }
    }
        
    if (course_name) {
      breakoutRoomStore.assistantJoinRoom(course_name)
    } else {
      breakoutRoomStore.loginAsAssistant()
    }
  }, [])

  return (
    <div className='room-container'>
    <div className="assistant-box">
        {
          breakoutRoomStore.courseList.length !== 0 ?
          <div className="assistant-table">
          <div className="table-title">{t('assistant.classList')}</div>
          <TableContainer>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow className="table-head">
                  <TableCell>{t('assistant.className')}</TableCell>
                  <TableCell align="center">{t('assistant.creatTime')}</TableCell>
                  <TableCell align="right">{t('assistant.operation')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breakoutRoomStore.courseList.map((course: any) => (
                  <TableRow key={course.roomUuid}>
                    <TableCell component="th" scope="row">{course.roomName}</TableCell>
                    <TableCell align="center">{moment.utc(course.createTime).local().format('HH:mm:ss')}</TableCell>
                    <TableCell align="right">
                      {<a style={{"cursor": "pointer"}} onClick={(evt: any) => {
                        breakoutRoomStore.roomInfo.groupName = course.roomName
                        history.push(`/breakout-class/assistant/courses/${course.roomUuid}`)
                      }}>
                        {t('assistant.enterClassRoom')} 
                      </a>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>  :
        <div className="data-null">
          <div className="null-box"></div>
          <div className="null-text">{t('assistant.data_null_text')}</div>
          <div className="null-btn">
            <div className="refresh-btn">
              <Button variant="outlined" onClick={refresh}>{t('assistant.refresh')}</Button>
            </div>
            <div className="exit-btn">
              <Button variant="outlined" onClick={exit}>{t('assistant.exit')}</Button>
            </div>
          </div>
        </div>
        }
    </div>
  </div>
  )
})