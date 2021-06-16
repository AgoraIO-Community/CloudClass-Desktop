import React from 'react'
import { CourseReplacer } from "agora-aclass-ui-kit";
import { useUIStore } from '@/hooks';
import './index.scss'
import { observer } from 'mobx-react';

export const CourseReplacerContent = observer(() => {
    const uiStore = useUIStore()

    return (
        <div style={{
            width:'100%',height:'100%', position:"absolute", background: 'transparent',
            display:'flex', 'alignItems':'center', 'justifyContent':'center',zIndex:10
        }} className={uiStore.courseReplacerVisible ? 'visibility' : 'hidden'}>
            <CourseReplacer
                items={[{name:'example courseware'}]}
                onClose={() => {
                    uiStore.setCourseReplacerVisible(false)
                }}
            ></CourseReplacer>
        </div>
    )
})