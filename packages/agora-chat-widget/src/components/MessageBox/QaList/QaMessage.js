import { Text, Image, Flex } from "rebass";
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Tag } from 'antd'
import scrollElementToBottom from '../../../utils/scrollElementToBottom'

// 助教端 提问消息列表
const QaMessage = (props) => {
    const qaList = useSelector(state => state.messages.qaList) || [];
    const [newUser, setNewUser] = useState([]);
    useEffect(() => {
        setNewUser(qaList[props.currentUser]?.msg)
    }, [qaList[props.currentUser]])

    useEffect(() => {
        let scrollElement = document.getElementById('qa-box-tag')
        scrollElementToBottom(scrollElement)
    }, [qaList[props.currentUser]])

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
                                <Text className='msg-sender' mb='5px' color={(message.ext.role === 1 || message.ext.role === 3) && '#0099FF'}>{message.ext.nickName || message.from}</Text>
                            </Flex>
                            {isText && <Text className='msg-text'>{message.msg || message.data}</Text>}
                            {isPic && <Image src={message.url || message.body.url} style={{ width: '180px' }} />}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default QaMessage;