import { observer } from 'mobx-react';
import { useStore } from '@classroom/hooks/ui-store';
import { useEffect, useState } from 'react';
import { EduStreamUI } from '@classroom/uistores/stream/struct';
import { LocalTrackPlayer, LocalTrackPlayerContainer, splitName, StreamPlayer } from '../stream';
import './index.css'
import classNames from 'classnames';
import { AgoraRteMediaPublishState, AGRemoteVideoStreamType, AGRtcState } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, RteRole2EduRole } from 'agora-edu-core';
import { TrackPlayer } from '../stream/track-player';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';

export const AllStream = observer((
    { isTeacherInClass,
        isBoardWidgetActive,
        isMediaPlayerWidgetActive,
        isWebViewWidgetActive,
        isScreenSharing }: {
            isTeacherInClass: boolean,
            isBoardWidgetActive: boolean,
            isMediaPlayerWidgetActive: boolean,
            isWebViewWidgetActive: boolean,
            isScreenSharing: boolean,
        }) => {

    //store参数配置信息
    const {
        shareUIStore: { isLandscape },
        streamUIStore: {
            teacherCameraStream,
            containerH5VisibleCls,
            showTool,
            visibleStreams,
            subscribeMass,
            isPiP,
            teacherVideoStreamSize,
            studentVideoStreamSize,
            studentCameraStreams,
            studentVideoStreamContainerHeight,
            containerH5Extend,
            studentStreamsVisible,
            toolVisible,
            toggleTool,
        },
        classroomStore: {
            userStore: { rewards },
        },
        layoutUIStore: { },
        boardUIStore: { grantedUsers },
    } = useStore();

    //监听教师流变更
    useEffect(() => {
        if (teacherCameraStream) {
            visibleStreams.set(teacherCameraStream.stream.streamUuid, teacherCameraStream.stream);
        }
        subscribeMass(visibleStreams);
    }, [teacherCameraStream]);
    //展示的视频流
    const streamList: EduStreamUI[] = []
    //是否显示学生
    const showStudents = toolVisible && studentStreamsVisible;
    //是否显示老师
    const showTeacher = teacherCameraStream && !isPiP
    if (showTeacher) {
        streamList.push(teacherCameraStream)
    }
    if (showStudents) {
        streamList.push(...studentCameraStreams)
    }

    return (
        <>
            {
                // isLandscape ? (<LandscapeShow></LandscapeShow>) : (<PortraitShow streamList={streamList}></PortraitShow>)
                isLandscape ? (<>
                    <GridListShow streamList={streamList} columnRowCount={1} pageSize={2} orientationUpToDown={true}></GridListShow>
                </>) : (<>
                <GridListShow streamList={streamList} columnRowCount={2} pageSize={6} orientationUpToDown={true}></GridListShow>
                        {/* <PortraitShow streamList={streamList}></PortraitShow> */}
                    {/* <TeacherStream /> */}
                    {/* {<StudentStreamsContainer></StudentStreamsContainer>} */}
                </>)
            }
        </>
    );
});
//所有的视频流的显示逻辑
const ALlStreamPlayer = observer(({ stream }: { stream: EduStreamUI }) => {
    const {
        getters: { isBoardWidgetActive, isScreenSharing, teacherCameraStream },
        shareUIStore: { isLandscape },
        classroomStore: {
            streamStore: { setRemoteVideoStreamType },
            connectionStore: { rtcState },
        },
        streamUIStore: { isPiP },
        layoutUIStore: { },
    } = useStore();
    useEffect(() => {
        if (
            rtcState === AGRtcState.Connected &&
            stream.stream.videoState === AgoraRteMediaPublishState.Published
        ) {
            if (
                isLandscape &&
                stream.fromUser.userUuid === teacherCameraStream?.fromUser.userUuid &&
                !isBoardWidgetActive
            ) {
                setRemoteVideoStreamType(stream.stream.streamUuid, AGRemoteVideoStreamType.HIGH_STREAM);
            } else {
                setRemoteVideoStreamType(stream.stream.streamUuid, AGRemoteVideoStreamType.LOW_STREAM);
            }
        }
    }, [isLandscape, stream.stream.videoState, rtcState]);
    const userName = stream.fromUser.userName;
    const [first, last] = splitName(userName);
    //是否是本地的流
    const isLocal = stream.stream.isLocal;
    const roomType = EduClassroomConfig.shared.sessionInfo.roomType;
    const isTeacher = RteRole2EduRole(roomType, stream.fromUser.role) === EduRoleTypeEnum.teacher;
    return (
        <div style={{ width: "100%", height: '100%', position: 'relative' }}>
            <div className={classNames('placeholder-text')}>{`${first}${last}`}</div>
            {
                isLocal ? !stream?.isCameraMuted && (
                    <LocalTrackPlayer
                        renderAt="Window"
                        style={{
                            position: 'relative',
                            flexShrink: 0,
                        }}
                    />
                ) : <TrackPlayer stream={stream} />
            }
        </div>
    );
},
);
//宫格列表显示组件
const GridListShow = observer(({ streamList, columnRowCount = 2, orientationUpToDown = true, pageSize = 6 }: {
    //所有的流数据列表
    streamList: EduStreamUI[],
    //列或者行数量
    columnRowCount: number,
    //是否是从上至下排列
    orientationUpToDown: boolean,
    //每页数量
    pageSize: number,
}) => {
      //store参数配置信息
      const {
        shareUIStore: { isLandscape },
      } = useStore();
    //当前页码
    const [currentPage, setCurrentPage] = useState<number>(0);
    //显示的数据列表
    const [currentPageShowStreamList, setCurrentPageShowStreamList] = useState<EduStreamUI[]>([]);
    //最后一页页码
    const lastPageIndex = Number(Number(streamList.length / pageSize).toFixed(0)) + (streamList.length % length !== 0 ? 1 : 0);
    //重置显示列表
    const resetShowList = () => {
        //当前页面显示的流列表
        let startIndex = currentPage ? currentPage * pageSize : 0
        if (Math.min(streamList.length, startIndex + pageSize) - startIndex < pageSize) {
            startIndex = Math.min(streamList.length, startIndex + pageSize) - pageSize
        }
        setCurrentPageShowStreamList([...streamList.slice(startIndex, Math.min(streamList.length, startIndex + pageSize))])
    }
    useEffect(resetShowList, [currentPage])
    //当前页面显示的流列表
    if (currentPageShowStreamList.length == 0 && streamList.length > 0) {
        resetShowList()
    }
    return (<div className='all-streams-portrait-container'>
        <div className='show-stream' style={{
            gridTemplateColumns: orientationUpToDown ? `repeat(${columnRowCount}, 1fr)` : 'unset',
            gridTemplateRows: orientationUpToDown ? 'unset' : `repeat(${columnRowCount}, 1fr)`
        }}>
            {
                currentPageShowStreamList.map((stream, index) => {
                    const length = currentPageShowStreamList.length;
                    return <div key={index} className="grid-item"
                        style={{ gridColumn: (length % columnRowCount !== 0 && index == 0 || length <= columnRowCount) ? `span ${columnRowCount}` : 'span 1' }}
                    >
                        <ALlStreamPlayer stream={stream}></ALlStreamPlayer>
                    </div>;
                })
            }
        </div>
        <div className="pagination" style={{display:isLandscape ? 'grid' : 'flex'}}>
            {<div className="page-btn left-btn"
                style={{ display: currentPage > 0 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? '8px auto auto auto' : 'auto auto auto 8px' }}
                onClick={() => { setCurrentPage(Math.max(currentPage - 1, 0)) }}>
                <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24}
                    style={{ margin: 'auto', height: '100%', transform: isLandscape ?  'rotate(-90deg)': 'rotate(180deg)' }}></SvgImg>
            </div>}
            {<div className="page-btn right-btn" 
                style={{ display: currentPage < lastPageIndex - 1 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? 'auto auto 8px auto' : 'auto 8px auto auto' }}
                onClick={() => { setCurrentPage(Math.min(currentPage + 1, lastPageIndex - 1)) }}>
                <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24}
                    style={{ margin: 'auto', height: '100%', transform: isLandscape ? 'rotate(90deg)' : 'unset' }}></SvgImg>
            </div>}
        </div>
    </div>)
});