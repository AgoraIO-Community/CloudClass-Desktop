import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HandsUp, StudentHandsUp, StudentsHandsUpList } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'


export const HandsUpContainer = observer(() => {

    const [stuHandsUpstate, setStuHandsUpstate] = useState<'default'|'handsUp'>('default')

    const handleStuHandsUp = () => {
        if(stuHandsUpstate === 'handsUp') {
            console.log('****** 学生取消举手')
            setStuHandsUpstate('default')
        } else {
            console.log('****** 学生举手了')
            setStuHandsUpstate('handsUp')
        }
        
    }


  return (
    <div className="hands-up-container">
        <div className="mt-4">
            <StudentHandsUp
                state={stuHandsUpstate}
                onClick={() => {handleStuHandsUp()}}
            />
        </div>
        {/* <div className="mt-4">
          <HandsUp
              state={'default'}
          />
        </div> */}
      {/* <div className="mt-4">
          <StudentHandsUp
              student={{
                  id: '1',
                  name: 'Peter'
              }}
          />
      </div>
      <div className="mt-4">
          <StudentsHandsUpList
              students={[...'.'.repeat(100)].map((item, index) => ({
                  id: 'student' + (index + 1),
                  name: 'student' + (index + 1),
              }))}
          />
      </div> */}
  </div>
  )
})