import { useAcadsocRoomStore, useUIStore } from '@/hooks';
import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { Popover } from 'agora-aclass-ui-kit'
import { storage } from '@/utils/custom-storage';


type PopoverGuideProps = {
    style?:any
}

export const PopoverGuide: FC<PopoverGuideProps> = ({
    style
}) => {
    return (
        <div style={style}>
            test
        </div>
    )
}

export const PopoverGuides = observer(() => {
    const roomStore = useAcadsocRoomStore()
    const uiStore = useUIStore()
    

    return (
        <>
            <Popover
                placement="bottom"
                visible={uiStore.guideVisible}
                overlay={
                    <div style={{width: 260, color:"#383839"}}>
                        <p style={{fontWeight:'bold'}}>New available feature: Replacing Courseware</p>
                        <p>Now you can click this button to search and replace the courseware when there is a problem with it.</p>
                        <div style={{display:'flex', justifyContent:'center'}}><button style={{
                            background: '#DFB635',
                            color: 'white',
                            padding: '8px 30px',
                            border: 0,
                            borderRadius: 20,
                            cursor:'pointer'
                        }} onClick={() => {
                            uiStore.guideVisible = false
                            storage.saveSkipGuide()
                        }}>I Know</button></div>
                    </div>
                }
            >
                <div
                    style={{
                        position: 'absolute',
                        left: roomStore.actionBarClientX + 8,
                        top: roomStore.actionBarClientY - 5,
                        width: 47,
                        height: roomStore.actionBarClientHeight
                    }}
                ></div>
            </Popover>
        </>
    )
})