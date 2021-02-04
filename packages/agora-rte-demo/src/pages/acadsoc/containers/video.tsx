import { noop } from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import {Video} from 'agora-aclass-ui-kit'

// const Video = (props: any) => <div></div>


export const TeacherVideo = observer(() => {
  return (
    <Video
      className={""}
      uid={1}
      nickname="teacher"
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      videoState={false}
      audioState={false}
      onClick={() => {

      }}
      style={{
        width: '320px',
        height: '225px'
      }}
    >
    </Video>
  )
})

export const StudentVideo = observer(() => {
  return (
    <Video
      className={""}
      uid={1}
      nickname="student"
      minimal={true}
      resizable={false}
      trophyNumber={0}
      visibleTrophy={false}
      role={"teacher"}
      videoState={false}
      audioState={false}
      onClick={() => {
        
      }}
      style={{
        width: '320px',
        height: '225px'
      }}
    >
    </Video>
  )
})