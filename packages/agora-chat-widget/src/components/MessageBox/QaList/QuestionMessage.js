import { useSelector } from 'react-redux'
import { Flex, Image, Text } from 'rebass'
import { useState, useEffect } from 'react'
import { Tag } from 'antd'
import scrollElementToBottom from '../../../utils/scrollElementToBottom'
import './QaMessage.css'
import avatarUrl from '../../../themes/img/avatar-big@2x.png'
import { dateFormat } from '../../../utils';
import AntModal from 'react-modal'

// 学生端 提问消息列表
const QuestionMessage = ({ userName, isLoadGif, isMoreHistory, getHistoryMessages }) => {
    const [maxImg, setMaxImg] = useState(false);
    const [maxImgUrl, setMaxImgUrl] = useState('');
    const qaList = useSelector(state => state.messages.qaList) || [];
    const idQaList = qaList[userName] !== undefined;
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            height: 'calc(100% - 100px)',
            width: 'calc(100% - 100px);'
        },
    };

    useEffect(() => {
        scrollPageBottom()
    }, [qaList[userName]])

    const scrollPageBottom = () => {
        let scrollElement = document.getElementById('qa-box-tag')
        scrollElementToBottom(scrollElement)
    }

    const showMaximumPicture = (message) => (e) => {
        e.preventDefault()
        setMaxImgUrl(message.url || message.body.url)
        setMaxImg(true)
    }

    return (
        <div className="student-qa-list" id="qa-box-tag">
            {/* {!isLoadGif && (isMoreHistory ? <div className='more-msg' onClick={() => { getHistoryMessages(true) }}>加载更多</div> : <div className='more-msg'>没有更多消息啦~</div>)} */}
            {
                idQaList ? (
                    qaList[userName]?.msg.map((message, index) => {
                        let isText = message.type === "txt" || message.contentsType === "TEXT"
                        let isPic = message.type === "img" || message.contentsType === "IMAGE"
                        return (
                            <Flex className="msg-list-item" key={index}>
                                <img className='msg-img' src={message.ext.avatarUrl || avatarUrl} />
                                <Flex flexDirection="column" className="flex-1">
                                    <div style={{ marginBottom: 5 }}>
                                        <Flex alignItems="center" >
                                            {/* 主讲/辅导tag */}
                                            {(message.ext.role === 1 || message.ext.role === 3) && <Tag className='tags'>
                                                {message.ext.role === 1 && '主讲老师'}{message.ext.role === 3 && '辅导老师'}
                                            </Tag>}
                                            {/* 昵称/姓名 */}
                                            <Text className='msg-sender' color={(message.ext.role === 1 || message.ext.role === 3) && '#0099FF'}>{message.ext.nickName || message.from}</Text>
                                            {/* 时间戳 */}
                                            <Tag className="time-tag">
                                                {dateFormat(Number(message.time), 'H:i')}
                                                {/* { message.time } */}
                                            </Tag>
                                        </Flex>
                                    </div>
                                    {isText && <Text className='msg-text'>{message.msg || message.data}</Text>}
                                    {isPic && <Image src={message.url || message.body.url} style={{ width: '180px' }} onLoad={scrollPageBottom} onClick={showMaximumPicture(message)} />}
                                </Flex>
                            </Flex>
                        )
                    }
                    )) : (
                    <></>
                )
            }
            <AntModal
                isOpen={maxImg}
                onRequestClose={() => { setMaxImg(false) }}
                style={customStyles}
                appElement={document.body}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={maxImgUrl} style={{ objectFit: 'revert', width: '70%' }} alt="picture load failed" />
                    <button className='close-btn' onClick={() => { setMaxImg(false) }}>X</button>
                </div>
            </AntModal>
        </div>
    )
}

export default QuestionMessage;