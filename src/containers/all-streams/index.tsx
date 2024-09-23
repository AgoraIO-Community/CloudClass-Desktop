import { observer } from 'mobx-react';
import { useStore } from '@classroom/hooks/ui-store';
import { useEffect, useRef, useState } from 'react';
import { EduStreamUI } from '@classroom/uistores/stream/struct';
import './index.css'
import classNames from 'classnames';
import { AgoraRteMediaPublishState, AGRemoteVideoStreamType, AGRtcState } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, RteRole2EduRole } from 'agora-edu-core';
import { TrackPlayer } from '../stream/track-player';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { transI18n } from 'agora-common-libs';
import { splitName } from '../stream';

export const AllStream = observer((
    { }: {
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
            visibleStreams,
            subscribeMass,
            sortStreamList
        },
        widgetUIStore: { currentWidget }
    } = useStore();
    //是否有白板、屏幕共享等widget
    const [haveWidget, setHaveWidget] = useState(false);
    //监听教师流变更
    useEffect(() => {
        setHaveWidget(currentWidget !== null && currentWidget !== undefined)
    }, [currentWidget]);

    //监听教师流变更
    useEffect(() => {
        if (teacherCameraStream) {
            visibleStreams.set(teacherCameraStream.stream.streamUuid, teacherCameraStream.stream);
        }
        subscribeMass(visibleStreams);
    }, [teacherCameraStream]);
    //展示的视频流
    const streamList = sortStreamList
    return (
        <>
            {
                isLandscape ? (<>
                    <GridListShow streamList={streamList} columnRowCount={1} pageSize={2} orientationUpToDown={true}></GridListShow>
                </>) : <div style={{ height: haveWidget ? '96px' : '100%' }}>
                    <GridListShow streamList={streamList} columnRowCount={2} pageSize={haveWidget ? 2 : 6} orientationUpToDown={!haveWidget}></GridListShow>
                </div>
            }
        </>
    );
});



//所有的视频流的显示逻辑
const ALlStreamPlayer = observer(({ stream }: { stream: EduStreamUI }) => {
    const {
        getters: { isBoardWidgetActive, teacherCameraStream, calibratedTime },
        shareUIStore: { isLandscape },
        classroomStore: {
            streamStore: { setRemoteVideoStreamType },
            connectionStore: { rtcState },
        },
        streamUIStore: { screenShareStream, localVolume, remoteStreamVolume, handleReportDuration },
        layoutUIStore: { },
        handUpUIStore: { handsUpMap },
        deviceSettingUIStore: { isAudioRecordingDeviceEnabled }
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
    const duration = 3000;
    const minTriggerVolume = 35;
    //教室类型
    const roomType = EduClassroomConfig.shared.sessionInfo.roomType;
    //是否是教师
    const isTeacher = RteRole2EduRole(roomType, stream.fromUser.role) === EduRoleTypeEnum.teacher;
    //是否开启了屏幕共享
    const isScreenShare = !!screenShareStream
    //是否举手
    const isLiftHand = handsUpMap.has(stream.fromUser.userUuid);
    //是否讲话
    const [isSpeak, setIsSpeak] = useState(false);

    const startTime = useRef<number | null>(0);

    const reportDuration = useRef<Array<{ startTime: number | null, endTime: number }>>([]);

    const timer = useRef<number | null>(null);
    const reportTimer = useRef<number | null>(null);

    const showAudioEffect = (isLocal: boolean) => {
        setIsSpeak(true);

        if (isLocal) {
            if (!startTime.current) {
                startTime.current = calibratedTime;
            }

            if (!reportTimer.current) {
                reportTimer.current = window.setTimeout(async () => {
                    reportTimer.current = null;

                    const params = { events: timer.current ? [...reportDuration?.current, { startTime: startTime?.current, endTime: calibratedTime }] : [...reportDuration?.current], cmd: 1700 };
                    await handleReportDuration(params);

                    reportDuration.current = [];
                    startTime.current = 0;
                    reportTimer?.current && window.clearTimeout(reportTimer?.current);
                }, 1000 * 60);
            }
        }

        if (timer.current) {
            window.clearTimeout(timer.current);
        }
        timer.current = window.setTimeout(() => {
            setIsSpeak(false);
            timer.current = null;

            if (isLocal && reportTimer.current) {
                //记录一次开口
                reportDuration.current = [...reportDuration.current, { startTime: startTime?.current, endTime: calibratedTime }];
                startTime.current = 0;
            }

        }, duration);
    };
    //动态监听变量
    useEffect(() => {
        if (stream?.stream.isLocal) {
            if (localVolume > minTriggerVolume && isAudioRecordingDeviceEnabled) {
                showAudioEffect(true);
            }
        } else {
            const remoteVolume = remoteStreamVolume(stream);
            if (remoteVolume > minTriggerVolume && stream?.isMicStreamPublished) {
                showAudioEffect(false);
            }
        }
    }, [
        localVolume,
        remoteStreamVolume(stream),
        isAudioRecordingDeviceEnabled,
        stream?.isMicStreamPublished,
    ]);
    //当前布局
    const ref = useRef<HTMLDivElement | null>(null);

    return (
        <div style={{ width: "100%", height: '100%', position: 'relative' }}
            ref={ref}
            className={classNames(
                { 'all-streams-portrait-stream-speak': isSpeak },
                { 'all-streams-portrait-stream-lift-hand': isLiftHand }
            )}>
            <div className={classNames('placeholder-text',
                { 'placeholder-text-small': 100 >= (ref.current?.clientHeight ? ref.current?.clientHeight : 100) },
                { 'placeholder-text-students': !isTeacher }, { 'placeholder-text-teacher': isTeacher })}>{`${first}${last}`}</div>
            {<TrackPlayer stream={stream} />}
            {isLiftHand && <SvgImg
                className='all-streams-portrait-stream-lift-hand-container'
                type={SvgIconEnum.HANDS_UP_NEW}
                size={24}
                colors={{ iconPrimary: 'rgba(255, 255, 255, 1)' }} />}
            <div className='all-streams-portrait-stream-name-container'>
                {isTeacher && <SvgImg
                    className='all-streams-portrait-stream-name-container-icon'
                    type={SvgIconEnum.ICON_ROLE_TYPE_TEACHER}
                    size={18}
                    colors={{ iconPrimary: 'rgba(255, 255, 255, 1)' }} />}
                <span className='all-streams-portrait-stream-name-container-name'>{userName}</span>
                {isTeacher && <span className='all-streams-portrait-stream-name-container-name-suffix'>({transI18n('stream.teacher')})</span>}
                {isScreenShare && isTeacher && <SvgImg
                    className='all-streams-portrait-stream-name-container-screen-share'
                    type={SvgIconEnum.ICON_SCREEN_SHARE}
                    size={18}
                    colors={{ iconPrimary: 'var(--head-5, rgba(132, 189, 0, 1))' }} />}
            </div>
        </div>
    );
},
);
//宫格列表显示组件
const GridListShow = observer(({ streamList, columnRowCount = 2, orientationUpToDown, pageSize = 6 }: {
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
    const [lastPageIndex, setLastPageIndex] = useState<number>(0);
    //显示的数据列表
    const [currentPageShowStreamList, setCurrentPageShowStreamList] = useState<EduStreamUI[]>([]);
    //重置显示列表
    const resetShowList = () => {
        //当前使用的每页数量
        const currentPageSize = isLandscape ? pageSize : (orientationUpToDown ? pageSize : columnRowCount);
        //最后一页页码
        const lastPageIndex = Math.floor(Number(streamList.length / currentPageSize)) + (streamList.length % currentPageSize !== 0 ? 1 : 0);
        setLastPageIndex(lastPageIndex)
        //当前页面显示的流列表
        const startIndex = currentPage ? currentPage * currentPageSize : 0
        setCurrentPageShowStreamList([...streamList.slice(startIndex, Math.min(streamList.length, startIndex + currentPageSize))])
    }
    useEffect(resetShowList, [currentPage, streamList, isLandscape, orientationUpToDown])
    useEffect(() => {
        resetShowList()
        const observer = new ResizeObserver(() => {
            setCurrentPageShowStreamList([])
            setCurrentPage(0)
            resetShowList()
        });
        const viewport = document.querySelector(`.all-streams-portrait-container`);
        if (viewport) {
            observer.observe(viewport);
        }
    }, [])
    return (<div className={isLandscape ? 'all-streams-portrait-container all-streams-portrait-container-landscape' : 'all-streams-portrait-container'} style={{ height: isLandscape ? 'unset' : '100%' }}>
        {
            isLandscape && <>
                <div className='show-stream' style={{ gridTemplateColumns: `repeat(1, 1fr)` }}> {
                    currentPageShowStreamList.map((stream, index) => {
                        return <div key={index} className="grid-item" style={{ gridColumn: 'span 1' }}>
                            <ALlStreamPlayer stream={stream}></ALlStreamPlayer>
                        </div>;
                    })}
                </div>

                <div className="pagination" style={{ display: 'grid' }}>
                    {<div className="page-btn left-btn" style={{ display: currentPage > 0 ? 'unset' : 'none', margin: '8px 9px auto auto' }} onClick={() => { setCurrentPage(Math.max(currentPage - 1, 0)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'rotate(-90deg)' }}></SvgImg>
                    </div>}
                    {<div className="page-btn right-btn" style={{ display: currentPage < lastPageIndex - 1 ? 'unset' : 'none', margin: 'auto 9px 8px auto' }} onClick={() => { setCurrentPage(Math.min(currentPage + 1, lastPageIndex - 1)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'rotate(90deg)' }}></SvgImg>
                    </div>}
                </div>
            </>
        }
        {
            !isLandscape && !orientationUpToDown && <>
                <div className='show-stream' style={{ gridTemplateColumns: `repeat(${columnRowCount}, 1fr)` }}> {
                    currentPageShowStreamList.map((stream, index) => {
                        return <div key={index} className="grid-item" style={{ gridRow: 1, gridColumn: `span 1` }}>
                            <ALlStreamPlayer stream={stream}></ALlStreamPlayer>
                        </div>;
                    })}
                </div>

                <div className="pagination" style={{ display: 'flex' }}>
                    {<div className="page-btn left-btn" style={{ display: currentPage > 0 ? 'inline-block' : 'none', margin: 'auto auto auto 8px' }} onClick={() => { setCurrentPage(Math.max(currentPage - 1, 0)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'rotate(180deg)' }}></SvgImg>
                    </div>}
                    {<div className="page-btn right-btn" style={{ display: currentPage < lastPageIndex - 1 ? 'inline-block' : 'none', margin: 'auto 8px auto auto' }} onClick={() => { setCurrentPage(Math.min(currentPage + 1, lastPageIndex - 1)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'unset' }}></SvgImg>
                    </div>}
                </div>
            </>
        }
        {
            !isLandscape && orientationUpToDown && <>
                <div className='show-stream' style={{ gridTemplateColumns: `repeat(${columnRowCount}, 1fr)` }}> {
                    currentPageShowStreamList.map((stream, index) => {
                        const length = currentPageShowStreamList.length;
                        return <div key={index} className="grid-item" style={{ gridColumn: (length % columnRowCount !== 0 && index == 0 || length <= columnRowCount) ? `span ${columnRowCount}` : 'span 1' }}>
                            <ALlStreamPlayer stream={stream}></ALlStreamPlayer>
                        </div>;
                    })}
                </div>

                <div className="pagination" style={{ display: 'flex' }}>
                    {<div className="page-btn left-btn" style={{ display: currentPage > 0 ? 'inline-block' : 'none', margin: '9px auto auto 8px' }} onClick={() => { setCurrentPage(Math.max(currentPage - 1, 0)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'rotate(180deg)' }}></SvgImg>
                    </div>}
                    {<div className="page-btn right-btn" style={{ display: currentPage < lastPageIndex - 1 ? 'inline-block' : 'none', margin: '9px 8px auto auto' }} onClick={() => { setCurrentPage(Math.min(currentPage + 1, lastPageIndex - 1)) }}>
                        <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.ARROW_BACK} size={24} style={{ margin: 'auto', height: '100%', transform: 'unset' }}></SvgImg>
                    </div>}
                </div>
            </>
        }
    </div>)
});