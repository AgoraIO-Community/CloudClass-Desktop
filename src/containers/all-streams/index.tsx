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
        widgetUIStore: { currentWidget }
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
    //是否有白板、屏幕共享等widget
    const haveWidget = currentWidget && currentWidget !== undefined
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
                isLandscape ? (<>
                    <GridListShow streamList={streamList} columnRowCount={1} pageSize={2} orientationUpToDown={true}></GridListShow>
                </>) : <div style={{ height: haveWidget ? '100px' : '100%' }}>
                    <GridListShow streamList={streamList} columnRowCount={haveWidget ? 1 : 2} pageSize={haveWidget ? 2 : 6} orientationUpToDown={!haveWidget}></GridListShow>
                </div>
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
            <div className={classNames('placeholder-text', { 'placeholder-text-students': !isTeacher }, { 'placeholder-text-teacher': isTeacher })}>{`${first}${last}`}</div>
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
    //当前使用的每页数量
    const currentPageSize = isLandscape ? pageSize : orientationUpToDown ? columnRowCount : pageSize;
    //显示的数据列表
    const [currentPageShowStreamList, setCurrentPageShowStreamList] = useState<EduStreamUI[]>([]);
    //最后一页页码
    const lastPageIndex = Number(Number(streamList.length / currentPageSize).toFixed(0)) + (streamList.length % currentPageSize !== 0 ? 1 : 0);
    //重置显示列表
    const resetShowList = () => {
        //当前页面显示的流列表
        let startIndex = currentPage ? currentPage * currentPageSize : 0
        if (Math.min(streamList.length, startIndex + currentPageSize) - startIndex < currentPageSize) {
            startIndex = Math.min(streamList.length, startIndex + currentPageSize) - currentPageSize
        }
        setCurrentPageShowStreamList([...streamList.slice(startIndex, Math.min(streamList.length, startIndex + currentPageSize))])
    }
    useEffect(resetShowList, [currentPage])
    //当前页面显示的流列表
    if (currentPageShowStreamList.length == 0 && streamList.length > 0) {
        resetShowList()
    }
    //翻页按钮样式
    const pageLeftStyle = { display: currentPage > 0 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? '8px 9px auto auto' : orientationUpToDown ? 'auto auto auto 8px' : '9px auto auto 8px' }
    const pageRightStyle = { display: currentPage < lastPageIndex - 1 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? 'auto 9px 8px auto' : orientationUpToDown ? 'auto 8px auto auto' : '9px 8px auto auto' }


    return (<div className={isLandscape ? 'all-streams-portrait-container all-streams-portrait-container-landscape' : 'all-streams-portrait-container'} style={{ height: isLandscape ? 'unset' : '100%' }}>
        <div className='show-stream' style={{
            gridTemplateColumns: `repeat(${isLandscape ? 1 : currentPageSize}, 1fr)`,
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

        <div className="pagination" style={{ display: isLandscape ? 'grid' : 'flex' }}>
            {<div className="page-btn left-btn" style={pageLeftStyle} onClick={() => { setCurrentPage(Math.max(currentPage - 1, 0)) }}>
                <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24}
                    style={{ margin: 'auto', height: '100%', transform: isLandscape ? 'rotate(-90deg)' : 'rotate(180deg)' }}></SvgImg>
            </div>}
            {<div className="page-btn right-btn" style={pageRightStyle} onClick={() => { setCurrentPage(Math.min(currentPage + 1, lastPageIndex - 1)) }}>
                <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24}
                    style={{ margin: 'auto', height: '100%', transform: isLandscape ? 'rotate(90deg)' : 'unset' }}></SvgImg>
            </div>}
        </div>
    </div>)
});