import React from 'react'
import { AClassVideoTutorial } from "agora-aclass-ui-kit";
import { useUIStore } from '@/hooks';
import './index.scss'
import { observer } from 'mobx-react';
import { t } from '@/i18n';
import { storage } from '@/utils/custom-storage';

export const AClassVideoTutorialContent = observer(() => {
    const uiStore = useUIStore()
    
    return (
        <div style={{
            width:'100%',height:'100%', position:"absolute", background: 'rgba(0,0,0,0.4)',
            display:'flex', 'alignItems':'center', 'justifyContent':'center',zIndex:25
        }} className={uiStore.videoTutorialVisible ? 'video-tutorial-visible' : 'video-tutorial-hidden'}>
            {uiStore.videoTutorialVisible ?
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <AClassVideoTutorial url="https://solutions-apaas.agora.io/acadsoc/static/guide.mp4" />
                    <div className="close-btn" onClick={() => {
                        uiStore.videoTutorialVisible = false
                        storage.saveSkipGuide()
                    }}>Got it</div>
                </div> : null}
        </div>
    )
})