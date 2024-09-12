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

    //监听教师流变更
    useEffect(() => {
        if (teacherCameraStream) {
            visibleStreams.set(teacherCameraStream.stream.streamUuid, teacherCameraStream.stream);
        }
        subscribeMass(visibleStreams);
    }, [teacherCameraStream]);
    //展示的视频流
    const streamList = sortStreamList
    //是否有白板、屏幕共享等widget
    const haveWidget = currentWidget && currentWidget !== undefined
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
        getters: { isBoardWidgetActive, teacherCameraStream },
        shareUIStore: { isLandscape },
        classroomStore: {
            streamStore: { setRemoteVideoStreamType },
            connectionStore: { rtcState },
        },
        streamUIStore: { screenShareStream, localVolume, remoteStreamVolume },
        layoutUIStore: { },
        handUpUIStore: { handsUpMap },
        deviceSettingUIStore: { isAudioRecordingDeviceEnabled },
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
    const timer = useRef<number | null>(null);
    const showAudioEffect = () => {
        setIsSpeak(true);
        if (timer.current) {
            window.clearTimeout(timer.current);
        }
        timer.current = window.setTimeout(() => {
            setIsSpeak(false);
            timer.current = null;
        }, duration);
    };
    //动态监听变量
    useEffect(() => {
        if (stream?.stream.isLocal) {
            if (localVolume > minTriggerVolume && isAudioRecordingDeviceEnabled) {
                showAudioEffect();
            }
        } else {
            const remoteVolume = remoteStreamVolume(stream);
            if (remoteVolume > minTriggerVolume && stream?.isMicStreamPublished) {
                showAudioEffect();
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
    //当前使用的每页数量
    const currentPageSize = isLandscape ? pageSize : (orientationUpToDown ? pageSize : columnRowCount);
    //显示的数据列表
    const [currentPageShowStreamList, setCurrentPageShowStreamList] = useState<EduStreamUI[]>([]);
    //最后一页页码
    const lastPageIndex = Math.floor(Number(streamList.length / currentPageSize)) + (streamList.length % currentPageSize !== 0 ? 1 : 0);
    //重置显示列表
    const resetShowList = () => {
        //当前页面显示的流列表
        const startIndex = currentPage ? currentPage * currentPageSize : 0
        setCurrentPageShowStreamList([...streamList.slice(startIndex, Math.min(streamList.length, startIndex + currentPageSize))])
    }
    useEffect(resetShowList, [currentPage,streamList])
    useEffect(()=>{resetShowList()}, [])
    // //当前页面显示的流列表
    // if (currentPage === 0) {
    //     resetShowList()
    // }
    //翻页按钮样式
    const pageLeftStyle = { display: currentPage > 0 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? '8px 9px auto auto' : orientationUpToDown ? 'auto auto auto 8px' : '9px auto auto 8px' }
    const pageRightStyle = { display: currentPage < lastPageIndex - 1 ? isLandscape ? 'unset' : 'inline-block' : 'none', margin: isLandscape ? 'auto 9px 8px auto' : orientationUpToDown ? 'auto 8px auto auto' : '9px 8px auto auto' }


    return (<div className={isLandscape ? 'all-streams-portrait-container all-streams-portrait-container-landscape' : 'all-streams-portrait-container'} style={{ height: isLandscape ? 'unset' : '100%' }}>
        <div className='show-stream' style={{
            gridTemplateColumns: `repeat(${isLandscape ? 1 : columnRowCount}, 1fr)`,
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