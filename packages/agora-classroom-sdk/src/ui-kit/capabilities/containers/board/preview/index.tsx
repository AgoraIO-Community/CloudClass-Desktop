import { observer } from 'mobx-react';
import * as React from 'react';
import { useUIStore } from '@/infra/hooks/'
import PreviewController from "@netless/preview-controller";
import {Room} from "white-web-sdk";
import './index.css'

export const PreView: React.FC<{id:string ,room: Room}> = observer(({id,room}) => {
  const {
    removeDialog
  } = useUIStore()
  return (
    <div style={{width:'100%',height:'100%',background:'rgba(0,0,0,.29)'}} >
      <PreviewController handlePreviewState={(isopen:boolean)=>{isopen||removeDialog(id)}} isVisible={true}
                                           room={room}/>
    </div>
  )
})