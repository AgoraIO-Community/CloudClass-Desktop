import { Text, Image, Flex } from "rebass";
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Tag } from 'antd'
import scrollElementToBottom from '../../../utils/scrollElementToBottom'
import AntModal from 'react-modal'
import { dateFormat } from '../../../utils';
import { saveReadMsgID } from '../../../api/qaReadMsg'

// 助教端 提问消息列表
const QaMessage = () => {
    const qaList = useSelector(state => state.messages.qaList) || [];
    const currentUser = useSelector(state => state.currentUser);
    const [newUser, setNewUser] = useState([]);
    const [maxImg, setMaxImg] = useState(false);
    const [maxImgUrl, setMaxImgUrl] = useState('');
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    const showMaximumPicture = (message) => {
        setMaxImgUrl(message.url || message.body.url)
        setMaxImg(true)
    }

    useEffect(() => {
        const currentMsg = qaList[currentUser]?.msg
        const option = {
            lastUserId: currentUser,
            lastUserMsg: currentMsg && (currentMsg[currentMsg.length - 1].id)
        }
        setNewUser(currentMsg)
        saveReadMsgID(option)
    }, [qaList[currentUser]])

    useEffect(() => {
        scrollPageBottom()
    }, [qaList[currentUser]])

    const scrollPageBottom = () => {
        let scrollElement = document.getElementById('qa-box-tag')
        scrollElementToBottom(scrollElement)
    }

    return (
        <div className='qa' id='qa-box-tag'>
            {
                newUser && newUser.map((message, index) => {
                    let isText = message.type === "txt" || message.contentsType === "TEXT"
                    let isPic = message.type === "img" || message.contentsType === "IMAGE"
                    return (
                        <div key={index} className='qa-msg' >
                            <Flex>
                                {/* 主讲/辅导tag */}
                                {(message.ext.role === 1 || message.ext.role === 3) && <Tag className='tags'>
                                    {message.ext.role === 1 && '主讲老师'}{message.ext.role === 3 && '辅导老师'}
                                </Tag>}
                                {/* 昵称 */}
                                <Text className='msg-sender' mb='5px' color={(message.ext.role === 1 || message.ext.role === 3) && '#0099FF'}>{message.ext.nickName || message.from}</Text>
                                {/* 时间戳 */}
                                <Tag className="time-tag">
                                    {dateFormat(Number(message.time), 'H:i')}
                                    {/* { message.time } */}
                                </Tag>
                            </Flex>
                            {isText && <Text className='msg-text'>{message.msg || message.data}</Text>}
                            {isPic && <Image src={message.url || message.body.url} style={{ width: '180px' }} onLoad={scrollPageBottom} onClick={() => showMaximumPicture(message)} />}
                        </div>
                    )
                })
            }
            <AntModal
                isOpen={maxImg}
                onRequestClose={() => { setMaxImg(false) }}
                style={customStyles}
            >
                <img src={maxImgUrl} alt="picture load failed" />
            </AntModal>
        </div>
    )
}

export default QaMessage;