import { Meta } from '@storybook/react';
import React, { FC, useState } from 'react';
import { useDebugValue } from 'react';
import { CameraPlaceHolder } from '~components';
import { Button } from '~components/button';
import { changeLanguage } from '~components/i18n';
import { VideoMarqueeList, VideoPlayer, VideoPlayerProps, MidClassVideoMarqueeList } from '~components/video-player';
import { CSSTransition } from 'react-transition-group';
//@ts-ignore
import { AspectRatio } from 'react-aspect-ratio'
import { useEffect } from 'react';

const config = { "muted": true, "deviceState": 1, "online": true, "onPodium": true, "userType": "teacher", "hasStream": true, "isLocal": false, "type": "microphone", "uid": "3232", "disabled": true }
const meta: Meta = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  args: {
    size: 10,
    username: 'Lily True',
    micEnabled: true,
    whiteboardGranted: true,
    // stars: 5,
    // micVolume: 0.95,
    // hasStream: false,
    // online: false,
    // isLocal: false,
    // isOnPodium: false,
    // userType: 'student',
    // controlPlacement: 'bottom',
    ...config,
    placeholder: (
      <img
        src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
        alt="placeholder"
        style={{
          display: 'inline-block',
          maxHeight: '100%',
          maxWidth: '100%',
          borderRadius: 4,
        }}
      />
    ),
  },
};

export const Docs: FC<VideoPlayerProps> = ({ children, ...restProps }) => {

  return (
    <div className="m-10">
      <Button onClick={() => {
        changeLanguage('zh')
      }}>中文</Button>
      <Button onClick={() => {
        changeLanguage('en')
      }}>英文</Button>
      <VideoPlayer {...restProps} userType="teacher">{children}</VideoPlayer>
    </div>
  );
};

const student = {
  isHost: true,
  username: 'Lily True',
  stars: 5,
  micEnabled: true,
  whiteboardGranted: true,
  cameraEnabled: true,
  micVolume: 0.95,
  controlPlacement: 'bottom',
  hasStream: false,
  online: false,
  isLocal: false,
  isOnPodium: false,
  userType: 'student',
  placeholder: (
    <CameraPlaceHolder />
    // <img
    //   src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
    //   alt="placeholder"
    //   style={{
    //     display: 'inline-block',
    //     maxHeight: '100%',
    //     maxWidth: '100%',
    //     borderRadius: 4,
    //   }}
    // />
  ),
}

export const DocsSmall: FC<VideoPlayerProps & { size: number }> = ({ children, size, ...restProps }) => {

  const [userType, setUserType] = useState<string>('teacher')

  const list_ = [...'.'.repeat(10)].map((_, i: number) => ({
    ...student,
    username: `${i}-${student.username}`,
    uid: `uuid-${i}`,
    micEnabled: false,
    cameraEnabled: false,
    whiteboardGranted: true,
    cameraDevice: 2,
    micDevice: 1,
    hasStream: i % 5 === 0 ? true : false,
    online: true,
    // online: i % 5 === 0 ? true : false,
    isLocal: i === 0,
    isOnPodium: false,
    userType: userType,
    children: (<></>)
  })) as any[]

  const [list, setList] = useState(list_)

  useDebugValue(list, JSON.stringify)

  const roles = ['teacher', 'assistant', 'student', 'invisible']

  return (
    //@ts-ignore
    <>
      <Button onClick={() => {
        changeLanguage('zh')
      }}>中文</Button>
      <Button onClick={() => {
        changeLanguage('en')
      }}>英文</Button>
      <Button onClick={() => {
        const role = roles[roles.indexOf(userType) + 1 % roles.length]
        list.forEach((it: any) => {
          it.userType = role
        })
        setList([...list])
        setUserType(role)
        // setUserType('teacher')
      }}>{userType}</Button>
      <VideoMarqueeList
        videoStreamList={list}
        onCameraClick={(uid: any) => {
          list.forEach(item => {
            if (item.uid === uid) {
              item.cameraEnabled = !item.cameraEnabled
            }
          })
          setList([
            ...list
          ])
          console.log('onCameraClick uid', uid)
        }}
        onMicClick={(uid: any) => {
          list.forEach(item => {
            if (item.uid === uid) {
              item.micEnabled = !item.micEnabled
            }
          })
          setList([
            ...list
          ])
          console.log('onMicrophoneClick uid', uid)
        }}
        onWhiteboardClick={(uid: any) => {
          list.forEach(item => {
            if (item.uid === uid) {
              item.whiteboardGranted = !item.whiteboardGranted
            }
          })
          setList([
            ...list
          ])
          console.log('onWhiteboard Click', uid)
        }}
        onOffPodiumClick={(uid: any) => {
          list.forEach(item => {
            if (item.uid === uid) {
              item.isOnPodium = !item.isOnPodium
            }
          })
          setList([
            ...list
          ])
          console.log('off podium', uid)
        }}
        onSendStar={(uid,) => {
          return new Promise((resolve) => {
            list.forEach(item => {
              if (item.uid === uid) {
                item.stars += 1
              }
            })
            setList([
              ...list
            ])
            resolve('send star')
          })
        }}
      >
      </VideoMarqueeList>
    </>
  )
}

export const DocsMidClassCarousel = () => {
  const [studentList, setStudentList] = useState([])
  return (
    <>
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto'
      }}>
        <Button onClick={() => {
          setStudentList([
            ...studentList,
            {
              username: `student-${studentList.length}`,
              uid: `uuid-student`,
              micEnabled: false,
              cameraEnabled: false,
              whiteboardGranted: true,
              cameraDevice: 2,
              micDevice: 1,
              hasStream: true,
              online: true,
              isLocal: true,
              isOnPodium: false,
              userType: 'student',
              children: (<></>)
            }
          ])
        }}>上台</Button>
        <Button onClick={() => {
          const copyArr = [...studentList]
          copyArr.splice(0, 1)
          setStudentList([...copyArr])
        }}>下台</Button>
      </div>
      <MidClassVideoMarqueeList
        teacherStream={{
          username: `teacher`,
          uid: `uuid-teacher`,
          micEnabled: false,
          cameraEnabled: false,
          whiteboardGranted: true,
          cameraDevice: 2,
          micDevice: 1,
          hasStream: true,
          online: true,
          isLocal: true,
          isOnPodium: false,
          userType: 'teacher',
          children: (<></>)
        }}
        videoStreamList={studentList}
      />
    </>
  )
}

export const DocsClassVideoPlayer = () => {
  const [studentList, setStudentList] = useState([])

  const [teacherList, setTeacherList] = useState([])


  // useEffect(() => {
  //   setTimeout(() => {
  //     setStream([
  //       {
  //         username: `teacher-${studentList.length}`,
  //         uid: `uuid-teacher`,
  //         micEnabled: false,
  //         cameraEnabled: false,
  //         whiteboardGranted: true,
  //         cameraDevice: 2,
  //         micDevice: 1,
  //         hasStream: true,
  //         online: true,
  //         isLocal: true,
  //         isOnPodium: false,
  //         userType: 'teacher',
  //         children: (<></>)
  //       }]
  //     )
  //   }, 2500)
  // }, [])

  return (
    <div>
      <Button onClick={() => {
        setTeacherList([
          ...teacherList,
          {
            username: `teacher-${teacherList.length}`,
            uid: `uuid-teacher`,
            micEnabled: false,
            cameraEnabled: false,
            whiteboardGranted: true,
            cameraDevice: 2,
            micDevice: 1,
            hasStream: true,
            online: true,
            isLocal: true,
            isOnPodium: false,
            userType: 'teacher',
            children: (<></>)
          }
        ])
      }}>老师上台</Button>
      <Button onClick={() => {
        const copyArr = [...teacherList]
        copyArr.splice(0, 1)
        setTeacherList([...copyArr])
      }}>老师下台</Button>
      <Button onClick={() => {
        setStudentList([
          ...studentList,
          {
            username: `student-${studentList.length}`,
            uid: `uuid-student`,
            micEnabled: false,
            cameraEnabled: false,
            whiteboardGranted: true,
            cameraDevice: 2,
            micDevice: 1,
            hasStream: true,
            online: true,
            isLocal: true,
            isOnPodium: false,
            userType: 'student',
            children: (<></>)
          }
        ])
      }}>上台</Button>
      <Button onClick={() => {
        const copyArr = [...studentList]
        copyArr.splice(0, 1)
        setStudentList([...copyArr])
      }}>下台</Button>
      <VideoMarqueeList
        teacherStream={teacherList[0]}
        teacherStreams={teacherList}
        videoStreamList={studentList}
        onCameraClick={(uid: any) => {
          // list.forEach(item => {
          //   if (item.uid === uid) {
          //     item.cameraEnabled = !item.cameraEnabled
          //   }
          // })
          // setList([
          //   ...list
          // ])
          // console.log('onCameraClick uid', uid)
        }}
        onMicClick={(uid: any) => {
          // list.forEach(item => {
          //   if (item.uid === uid) {
          //     item.micEnabled = !item.micEnabled
          //   }
          // })
          // setList([
          //   ...list
          // ])
          // console.log('onMicrophoneClick uid', uid)
        }}
        onWhiteboardClick={(uid: any) => {
          // list.forEach(item => {
          //   if (item.uid === uid) {
          //     item.whiteboardGranted = !item.whiteboardGranted
          //   }
          // })
          // setList([
          //   ...list
          // ])
          // console.log('onWhiteboard Click', uid)
        }}
        onOffPodiumClick={(uid: any) => {
          // list.forEach(item => {
          //   if (item.uid === uid) {
          //     item.isOnPodium = !item.isOnPodium
          //   }
          // })
          // setList([
          //   ...list
          // ])
          // console.log('off podium', uid)
        }}
        onSendStar={(uid,) => {
          // return new Promise((resolve) => {
          //   list.forEach(item => {
          //     if (item.uid === uid) {
          //       item.stars += 1
          //     }
          //   })
          //   setList([
          //     ...list
          //   ])
          //   resolve('send star')
          // })
        }}
      >
      </VideoMarqueeList>
      {/* {studentList.map((e: any, idx: number) => (
          <CSSVideoPlayer key={idx} {...e} />
        ))} */}
    </div>
    // <AspectRatio ratio="16/9" style={{display: 'flex', maxWidth: 320, minHeight: 180}}>
    // <div style={{backgroundColor: 'red'}}>
    //   1
    // </div>
    // </AspectRatio>
  )
}

export const DocsAnimTest = () => {
  const [students, setStudents] = useState([])
  const [showTeacher, setShowTeacher] = useState(true)
  return (
    <div>
      <h1>Anim Test</h1>
      <Button onClick={() => {
        setShowTeacher(true)
      }}>
        老师上台
      </Button>
      <Button onClick={() => {
        setShowTeacher(false)
      }}>
        老师下台
      </Button>
      <Button onClick={() => {
        setStudents([
          ...students,
          true
        ])
      }}>学生上台</Button>
      <div id="wrap">
        <div className="video-teacher">
          <CSSTransition
            in={showTeacher}
            timeout={1000}
            classNames='fade'
            unmountOnExit
            appear={true}
          >
            <div className="video-item"></div>
          </CSSTransition>
        </div>
        <div className="video-students-wrap" style={{
          width: `calc(100% / 7 * ${students.length})`
        }}>
          {students.map((item, index) => (
            <div className="video-student" key={index} style={{
              width: students.length <= 6 ? `calc(100% / ${students.length})` : `calc(100% / 6)`
            }}>
              <CSSTransition
                in={item}
                timeout={1000}
                classNames='fade'
                unmountOnExit
                appear={true}
              >
                <div className="video-item"></div>
              </CSSTransition>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default meta;
