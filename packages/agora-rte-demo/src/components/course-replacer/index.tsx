import React, {useState} from 'react'
import { AClassCourseWareItem, CourseReplacer, dialogManager } from "agora-aclass-ui-kit";
import { useAPIStore, useAppStore, useBoardStore, useUIStore } from '@/hooks';
import './index.scss'
import { observer } from 'mobx-react';
import { CourseWareItem } from '@/edu-sdk';
import CamelCaseKeys from 'camelcase-keys'
import { controller } from '@/edu-sdk/controller'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { BizLogger } from '@/modules/utils/biz-logger';
import { debounce, get } from 'lodash';
import { GenericErrorWrapper } from 'agora-rte-sdk';
import { GlobalStorage } from '@/utils/custom-storage';
import { t } from '@/i18n';

const listData = {
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
}

const detailData = {
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
}

let latestFetchListSeqId = -1

export const CourseReplacerContent = observer(() => {
    const uiStore = useUIStore()
    const appStore = useAppStore()
    const boardStore = useBoardStore()
    const apiStore = useAPIStore()


    const [items, setItems] = useState<AClassCourseWareItem[]>([])
    const [currentSubject, setCurrentSubject] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [totalCount, setTotalCount] = useState<number>(0)

    const debouncedSearch = debounce(async (value:string) => {
        if(!value) {
            return
        }
        setLoading(true)
        // setTimeout(() => {
        //     //@ts-ignore
        //     window.globalStore.apiStore.externalAPICallback(apiStore.seqId - 1, null, listData)
        // }, Math.floor(Math.random() * 1000))
        try {
            setCurrentSubject(value)
            latestFetchListSeqId = apiStore.seqId
            let seqId = apiStore.seqId
            let result:any = await apiStore.callExternalAPI("SearchCourseInfoByName", {
                subjectName: value,
                pageSize: 10,
                currentPage: 1
            })

            if(seqId < latestFetchListSeqId) {
                BizLogger.info(`[CourseReplacer] SeqId ${seqId} is older than ${latestFetchListSeqId}, ignored`)
                return
            }

            let items = get(result, 'ResultInfo', []).map((item:any) => {
                return {
                    id:item.SID,
                    name: item.SubjectName,
                    type: 'ppt'
                }
            })
            let totalItems = get(result, 'Count', 0)
            setTotalCount(totalItems)
            setItems(items)
            setLoading(false)
        }catch(e) {
            setLoading(false)
            BizLogger.error(`[CourseReplacer] Search failed: ${e.message}`)
        }
    }, 500)

    const openCourse = async (item: AClassCourseWareItem) => {
        // setTimeout(() => {
        //     //@ts-ignore
        //     window.globalStore.apiStore.externalAPICallback(apiStore.seqId - 1, null, detailData)
        // }, 1000)

        let userType = 0

        if(appStore.params.roomInfoParams?.userRole === 0 || appStore.params.roomInfoParams?.userRole === 1) {
            userType = appStore.params.roomInfoParams?.userRole
        }

        let result:any = await apiStore.callExternalAPI("ChangeSidByLessonInfo", {
            clid:parseInt(appStore.params.roomInfoParams?.roomName || "0"),
            userid:parseInt(appStore.params.roomInfoParams?.userUuid || "0"),
            changedSid: item.id,
            userType,
            //2 represents agora
            classToolType:2
        })

        let list = get(result, 'CourseWareList', [])

        if(list.length > 0) {
            let firstData = list[0]
            let lowerData:any = CamelCaseKeys(firstData, {deep:true})
            let courseWare:CourseWareItem = {
                resourceName: lowerData.resourceName,
                resourceUuid: lowerData.resourceUuid,
                ext: lowerData.ext,
                url: lowerData.url,
                size: lowerData.size,
                scenes: lowerData.scenes,
                updateTime: lowerData.updateTime,
                convert: lowerData.convert,
                taskUuid: lowerData.taskUuid,
                taskToken: lowerData.taskToken,
                taskProgress: lowerData.taskProgress,
                conversion: lowerData.conversion
            }
            await boardStore.openReplaceResource(courseWare)
        } else {
            throw GenericErrorWrapper(new Error('NO_COURSE_MATCHED'))
        }
    }

    return (
        <div style={{
            width:'100%',height:'100%', position:"absolute", background: 'transparent',
            display:'flex', 'alignItems':'center', 'justifyContent':'center',zIndex:25
        }} className={uiStore.courseReplacerVisible ? 'course-replacer-visible' : 'course-replacer-hidden'}>
            <CourseReplacer
                items={items}
                onClose={() => {
                    uiStore.setCourseReplacerVisible(false)
                }}
                onCancel={() => {setLoading(false)}}
                totalCount={totalCount}
                loading={loading}
                onSearchValueChange={debouncedSearch}
                onChangePage={async (activeIdx:number) => {
                    setLoading(true)
                    // setTimeout(() => {
                    //     //@ts-ignore
                    //     window.globalStore.apiStore.externalAPICallback(apiStore.seqId - 1, null, listData)
                    // }, Math.floor(Math.random() * 1000))
                    try {
                        // the next seqId callExternalAPI will use
                        latestFetchListSeqId = apiStore.seqId
                        let seqId = apiStore.seqId
                        let result:any = await apiStore.callExternalAPI("SearchCourseInfoByName", {
                            subjectName: currentSubject,
                            pageSize: 10,
                            currentPage: activeIdx + 1
                        })

                        if(seqId < latestFetchListSeqId) {
                            BizLogger.info(`[CourseReplacer] SeqId ${seqId} is older than ${latestFetchListSeqId}, ignored`)
                            return
                        }


                        let items = get(result, 'ResultInfo', []).map((item:any) => {
                            return {
                                id:item.SID,
                                name: item.SubjectName,
                                type: 'ppt'
                            }
                        })
                        let totalItems = get(result, 'Count', 0)
                        setTotalCount(totalItems)
                        setItems(items)
                        setLoading(false)
                    }catch(e) {
                        setLoading(false)
                        BizLogger.error(`[CourseReplacer] Search failed: ${e.message}`)
                    }
                }}
                onReplaceCourse={(item: AClassCourseWareItem) => {
                    dialogManager.show({
                        text: t(`toast.opening_courseware`, {reason: item.name}),
                        showConfirm: true,
                        showCancel: true,
                        confirmText: t('aclass.confirm.open'),
                        visible: true,
                        cancelText: t('aclass.confirm.no'),
                        onConfirm: () => {
                            setLoading(true)
                            setTimeout(async () => {
                                try {
                                    await openCourse(item)
                                    setLoading(false)
                                    uiStore.setCourseReplacerVisible(false)
                                }catch(e) {
                                    setLoading(false)
                                    BizLogger.error(`[CourseReplacer] Search failed: ${e.message}`)
                                }
                            }, 0)
                        },
                        onCancel: () => {
                        }
                    })
                }}
            ></CourseReplacer>
        </div>
    )
})