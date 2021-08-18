import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Input } from 'antd'
import { Flex, Text, Button, Image } from 'rebass'
import { LeftOutlined } from '@ant-design/icons'
import { updateRoomNotice } from '../../api/chatroom'
import backImg from '../../themes/img/left-back.png'

const { TextArea } = Input;

const EditNotice = ({ hasEditPermisson, roomAnnouncement, onView}) => {
    const NOTICE_INPUT_LENGTH = 300;
    const roomId = useSelector((state) => state.room.info.id);

    // 公告栏内容
    const [newContent, setNewContent] = useState(roomAnnouncement)
    // 公告栏编辑字数
    const [count, setCount] = useState(Array.from(roomAnnouncement)?.length || 0);

    // 公告内容修改
    const changeContent = (e) => {
        const noticeTextArea = document.querySelector("#notice-textarea")

        let content = e.target.value;
        let tempTotalContent = Array.from(content);

        // 输入内容长于限制数 做截取
        if (tempTotalContent.length > NOTICE_INPUT_LENGTH) {
            tempTotalContent = tempTotalContent.slice(0, NOTICE_INPUT_LENGTH);
        }

        setCount(tempTotalContent.length);
        setNewContent(tempTotalContent.join(""));
        noticeTextArea.value = tempTotalContent.join("");
    }

    useEffect(() => {
        let isComposition = false;

        const noticeTextArea = document.querySelector("#notice-textarea")
        
        if (!noticeTextArea) return;
        
        noticeTextArea.value = roomAnnouncement;

        // 复合输入开始
        const compositionstartFunction = () => {
            isComposition = true;
        }
        noticeTextArea.addEventListener('compositionstart', compositionstartFunction);

        // 复合输入结束
        const addEventListenerFunction = (e) => {
            isComposition = false;
            changeContent(e);
        }
        noticeTextArea.addEventListener('compositionend', addEventListenerFunction);

        // 非复合输入
        const inputFunction = (e) => {
            if (isComposition) return;
            changeContent(e);
        }
        noticeTextArea.addEventListener('input', inputFunction);

        return () => {
            noticeTextArea.removeEventListener('compositionstart', compositionstartFunction);
            noticeTextArea.removeEventListener('compositionend', addEventListenerFunction);
            noticeTextArea.removeEventListener('input', inputFunction);
        }
    }, [])

    return (
        <>
            <Flex alignItems="center" justifyContent="space-between" color="#A8ADB2" pb="12px" sx={{borderBottom: '1px solid #22262E'}}>
                <Image src={backImg} style={{width: 16, height: 16, cursor: 'pointer'}} onClick={onView}/>
                <Text className="title_center">公告</Text>
                <span></span>
            </Flex>
            <textarea 
                id="notice-textarea"
                placeholder="请输入公告..." 
                // onChange={changeContent}
                className='update-content'
                // value={newContent}
            ></textarea>
            {/* <textarea 
                placeholder="请输入公告..."
                className='update-content'
            ></textarea> */}
            {
                hasEditPermisson && <div>
                    <Flex justifyContent='flex-end' mb='16px' fontSize={12} color='#626773'>{count}/{NOTICE_INPUT_LENGTH}</Flex>
                    <Button disabled={count === 0 || count > 300} variant='primary' className='save-btn' onClick={() => {
                        updateRoomNotice(roomId, newContent);
                        onView();
                    }}
                    >保存</Button>
                </div>
            }

        </>
    )
}

export default EditNotice;