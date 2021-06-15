import React from 'react'
import { CourseReplacer } from "agora-aclass-ui-kit";

export const CourseReplacerContent = () => {
    return (
        <div style={{
            width:'100%',height:'100%', position:"absolute", background: 'transparent',
            display:'flex', 'alignItems':'center', 'justifyContent':'center',zIndex:10
            }}>
            <CourseReplacer
                items={[]}
            ></CourseReplacer>
        </div>
    )
}