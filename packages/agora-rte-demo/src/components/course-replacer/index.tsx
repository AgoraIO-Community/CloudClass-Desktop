import React from 'react'
import { AClassCourseWareItem, CourseReplacer } from "agora-aclass-ui-kit";
import { useBoardStore, useUIStore } from '@/hooks';
import './index.scss'
import { observer } from 'mobx-react';
import type { MaterialItem } from '@/stores/app/board';

export const CourseReplacerContent = observer(() => {
    const uiStore = useUIStore()
    const boardStore = useBoardStore()

    const data = {
        "Body": {
            "ResultInfo": [
                {
                    "CatID": 1293,
                    "SID": 140723,
                    "SubjectName": "China’s overheated school district housing market: causes and solutions"
                },
                {
                    "CatID": 1297,
                    "SID": 140722,
                    "SubjectName": "L6 Village in the Snow"
                },
                {
                    "CatID": 1297,
                    "SID": 140721,
                    "SubjectName": "L5 Castle Adventure"
                },
                {
                    "CatID": 1297,
                    "SID": 140720,
                    "SubjectName": "L4 Gran"
                },
                {
                    "CatID": 1297,
                    "SID": 140719,
                    "SubjectName": "L3 The Dragon Tree"
                },
                {
                    "CatID": 1297,
                    "SID": 140718,
                    "SubjectName": "L2 Pirate Adventure"
                },
                {
                    "CatID": 1297,
                    "SID": 140717,
                    "SubjectName": "L1 The Magic key"
                },
                {
                    "CatID": 1275,
                    "SID": 140716,
                    "SubjectName": "Test 19"
                },
                {
                    "CatID": 1234,
                    "SID": 140715,
                    "SubjectName": "Part 1 Lesson 3 I Sense the Seasons — New Words"
                },
                {
                    "CatID": 1240,
                    "SID": 140714,
                    "SubjectName": "Part 2 Lesson 47 Phonics Focus：spl"
                }
            ],
            "CurrentPage": 1,
            "Count": 68257,
            "PageSize": 10
        },
        "ErrorCode": 0,
        "Msg": ""
    }

    let items:AClassCourseWareItem[] = data.Body.ResultInfo.map(d => {
        return {
            name: d.SubjectName,
            type: 'ppt',
            id: d.SID
        }
    })

    return (
        <div style={{
            width:'100%',height:'100%', position:"absolute", background: 'transparent',
            display:'flex', 'alignItems':'center', 'justifyContent':'center',zIndex:10
        }} className={uiStore.courseReplacerVisible ? 'visibility' : 'hidden'}>
            <CourseReplacer
                items={items}
                onClose={() => {
                    uiStore.setCourseReplacerVisible(false)
                }}
                onReplaceCourse={(item: AClassCourseWareItem) => {
                    const data = {
                        "Body": {
                            "CourseWareList": [
                                {
                                    "ResourceName": "Static_Sick Leave _1",
                                    "ResourceUuid": "84774048_101899",
                                    "Ext": "pdf",
                                    "Url": "",
                                    "Conversion": {
                                        "Type": "static"
                                    },
                                    "Size": 9,
                                    "UpdateTime": 0,
                                    "Scenes": [
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/1.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 1"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/2.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 2"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/3.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 3"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/4.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 4"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/5.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 5"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/6.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 6"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/7.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 7"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/8.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 8"
                                        },
                                        {
                                            "Ppt": {
                                                "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/9.jpg",
                                                "Width": 1600,
                                                "Height": 900
                                            },
                                            "Name": "Scene 9"
                                        }
                                    ],
                                    "Convert": true,
                                    "TaskUuid": "1c325eb0efdf11ea8e14f53e3889d73a",
                                    "TaskToken": null,
                                    "TaskProgress": {
                                        "TotalPageSize": 9,
                                        "ConvertedPageSize": 9,
                                        "ConvertedPercentage": 100,
                                        "ConvertedFileList": [
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/1.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 1"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/2.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 2"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/3.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 3"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/4.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 4"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/5.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 5"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/6.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 6"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/7.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 7"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/8.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 8"
                                            },
                                            {
                                                "Ppt": {
                                                    "Src": "https://agoracategroy.acadsoc.com.cn/staticConvert/1c325eb0efdf11ea8e14f53e3889d73a/9.jpg",
                                                    "Width": 1600,
                                                    "Height": 900
                                                },
                                                "Name": "Scene 9"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "ChangeNum": -110
                        },
                        "ErrorCode": 0,
                        "Msg": ""
                    }
                    let firstData = data.Body.CourseWareList[0]
                    let material:MaterialItem = {
                        ext: firstData.Ext,
                        resourceName: firstData.ResourceName,
                        resourceUuid: firstData.ResourceUuid,
                        size: firstData.Size,
                        taskProgress: firstData.TaskProgress,
                        taskUuid: firstData.TaskUuid,
                        updateTime: 0,
                        url: firstData.Url,
                        scenes: firstData.Scenes.map(s => {
                            let scene = {}
                            let keys = Object.keys(s)
                            for(let i = 0; i < keys.length; i ++) {
                                let key = keys[i]
                                if(s[key].Src) {
                                    scene[key.toLowerCase()] = {
                                        src: s[key].Src,
                                        width: s[key].Width,
                                        height: s[key].Height
                                    }
                                } else {
                                    scene[key.toLowerCase()] = s[key]
                                }
                            }
                            return scene
                        })
                    }
                    boardStore.openReplaceResource(item, material)
                }}
            ></CourseReplacer>
        </div>
    )
})