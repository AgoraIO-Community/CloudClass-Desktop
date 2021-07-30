import React, { useRef, useEffect } from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'

export interface HandsUpSenderProps extends BaseProps {
  state?: 'default' | 'actived' | 'forbidden';
  onClick: (press:boolean) => Promise<void> | void;
  animate?: number
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({ onClick, state = 'default', animate = 0 }) => {

  const mapping = {
    'default': "#7B88A0",
    'actived': "#357BF6",
    'forbidden': "#BDBDCA"
  }

  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef && iconRef.current) {
      const onMouseDown = (e:any)=>{
        if (e.button == 0) { // left click
          onClick(true)
        }
      }

      const onMouseUp = (e:any)=>{
        if (e.button == 0) { // left click
          onClick(false)
        }
      }
      //@ts-ignore
      iconRef.current.addEventListener("mousedown", onMouseDown);

      //@ts-ignore
      iconRef.current.addEventListener("mouseup", onMouseUp);

      return ()=>{
        //@ts-ignore
        iconRef.current.removeEventListener("mousedown", onMouseDown);
        //@ts-ignore
        iconRef.current.removeEventListener("mouseup", onMouseUp);
      }
    }
  }, [iconRef.current,onClick])

  const color = mapping[state === 'forbidden' ? 'default' : state]

  return (
    <Card
      className={["hands-up-sender", 'sender-can-hover'].join(" ")}
      width={40}
      height={40}
      borderRadius={40}
    >
      {/*TODO: fix hover */}
      <Icon type={state === 'actived' ? "hands-up" : "hands-up-student"} color={color} />
      <span ref={iconRef} className={animate && state !== 'forbidden' ? 'handtip' : 'handtip-no'} >{animate || ''}</span>
    </Card>
  )
}