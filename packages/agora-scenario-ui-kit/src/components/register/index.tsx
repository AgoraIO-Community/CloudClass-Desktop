import React, { FC, useEffect, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import { Icon, IconTypes } from '~components/icon';

export interface PersonnelListType {
  id: string,
  name: string,
  onStage?: boolean,
  grantBoard?: boolean,   // 白板授权
  cameraState?: number,   // 0 关闭 1开启
  microphoneState?: number,
  reward?: number,
  isKicked?: boolean,
}

export interface PersonnelListProps {
  role: 'teacher' | 'student' | 'assistant' | 'audience',
  userList: Array<PersonnelListType>,
  handleClickEvent: (event: PersonnelListType) => void,
  teacherName: string,
  username: string,
}

export const Register: FC<PersonnelListProps> = ({
  userList,
  teacherName,
  handleClickEvent,
  role,
  username,
}) => {

  const forbidden = (type:string, item: PersonnelListType) => {
    let especialItem = ['camera', 'camera-off', 'microphone-on-outline', 'microphone-off-outline']
    if(role === 'student') {
      if(item.name === username && especialItem.includes(type)) {
        return false
      }
      return true
    }
    return false
  }

  const settingIconColor = (icon:string, item: PersonnelListType) => {
    let disabled = forbidden(icon, item)
    if(disabled) {
      return '#7B88A0'
    }
    if(icon === 'camera-off' || icon === 'microphone-off-outline') {
      return '#F04C36'
    }
    return '#0073FF'
  }

  const settingHover = (icon:string, item: PersonnelListType) => {
    let disabled = forbidden(icon, item)
    if(disabled) {
      return 'mouse-disable'
    }
    return 'mouse-hover'
  }

  const settingWidth = () => {
    if(role !== 'student') {
      return {
        width: '606px'
      }
    }
    return { width: '516px' }
  }

  const titleList = ['学生姓名', '上下台', '授权', '摄像头', '麦克风', '奖励', '踢人']

  const otherList = userList.filter(e => e.name !== username)

  const userItem = userList.filter(e => e.name === username)[0]

  const newList = [userItem, ...otherList]

  return(
    <>
    <div className="register-container" style={settingWidth()}>
      <div className="register-header">
        <div className="register-line bacg-color">
          <span className="mar-22">人员列表</span> 
        </div>
        <div className="register-line">
          <span className="title-text mar-22">教师姓名：</span> <span className="name-text">{teacherName}</span> 
        </div>
        <div className="register-line bacg-color">
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                {
                  titleList.map((item: string) => {
                    return (
                      role !== 'student' || item !== '踢人' ?
                      <th className="register-table-column title-text" key={item}>{item}</th>
                      : null
                    )
                  })
                }
              </tr>
            </thead>
          </table> 
        </div>
      </div>
      <div className="register-list">
        <table>
          <tbody>
            {
              newList.map((item: PersonnelListType) => {
                return (
                  <tr key={item.id}>
                    <td className="register-table-column name-text">
                      <div className="name-box truncate ...">
                        <span style={{display: 'flex'}}>{item.name}</span>
                      </div>
                    </td>
                    <td className="register-table-column">
                      <div className="icon-box" >
                        {
                          item.onStage ? 
                          <Icon type={'on-podium'} size={22} 
                            onClick={() => {handleClickEvent(item)}} 
                            color={settingIconColor('on-podium', item)} 
                            className={settingHover('on-podium', item)}>
                          </Icon>
                          :
                          <Icon type={'invite-to-podium'} size={22} 
                            onClick={() => {handleClickEvent(item)}} 
                            color={settingIconColor('invite-to-podium', item)} 
                            className={settingHover('invite-to-podium', item)}>
                          </Icon>
                        }
                      </div>
                    </td>
                    <td className="register-table-column">
                      <div className="icon-box">
                        {
                          item.grantBoard ?
                          <Icon type={'authorized'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('authorized', item)} 
                            className={settingHover('authorized', item)}>
                          </Icon>
                          :
                          <Icon type={'whiteboard'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('whiteboard', item)} 
                            className={settingHover('whiteboard', item)}>
                          </Icon>
                        }
                      </div>
                    </td>
                    <td className="register-table-column">
                      <div className="icon-box">
                        {
                          item.cameraState === 1 ?
                          <Icon type={'camera'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('camera', item)} 
                            className={settingHover('camera', item)}>
                          </Icon>
                          :
                          <Icon type={'camera-off'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('camera-off', item)} 
                            className={settingHover('camera-off', item)}>
                          </Icon>
                        }
                      </div>
                    </td>
                    <td className="register-table-column">
                      <div className="icon-box">
                        {
                          item.microphoneState === 1 ?
                          <Icon type={'microphone-on-outline'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('microphone-on-outline', item)} 
                            className={settingHover('microphone-on-outline', item)}>
                          </Icon>
                          :
                          <Icon type={'microphone-off-outline'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={settingIconColor('microphone-off-outline', item)} 
                            className={settingHover('microphone-off-outline', item)}>
                          </Icon>
                        }
                      </div>
                    </td>
                    <td className="register-table-column">
                      <div className="star-box">
                        <Icon type={'star-outline'} size={22} color={'#7B88A0'}></Icon>
                        <span style={{color: '#7B88A0'}}> x{item.reward}</span>
                      </div>
                    </td>
                    <td className="register-table-column">
                      {
                        role !== 'student' ?
                        <div className="icon-box">
                          <Icon type={'kick-out'} size={22} 
                            onClick={() => {handleClickEvent(item)}}
                            color={'#7B88A0'} className={'mouse-hover'}>
                          </Icon>
                        </div> : null
                      }
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}


