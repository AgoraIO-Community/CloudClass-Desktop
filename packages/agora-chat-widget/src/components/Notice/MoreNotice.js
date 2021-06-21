import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Input } from 'antd'
import { Flex, Text, Button, Image } from 'rebass'
import { LeftOutlined } from '@ant-design/icons'
import { updateRoomNotice } from '../../api/chatroom'
import iconLeft from '../../themes/img/icon-left.svg'
import Modal from '../UIComponents/modal';


const { TextArea } = Input;

const EditNotice = ({ hasEditPermisson, roomAnnouncement, onView, onEdit }) => {
    const [showModal, setShowModal] = useState('none');
    const roomId = useSelector((state) => state.room.info.id);
    // 公告栏编辑字数
    const [count, setCount] = useState(0);
    // 公告栏内容
    const [newContent, setNewContent] = useState(roomAnnouncement)
    // 公告内容修改
    const changeContent = (e) => {
        let content = e.target.value;
        setCount(content.length);
        setNewContent(content);
    }

    const Edit = () => {
        return (
            <Text fontSize="12px" color="#0099ff" css={{ cursor: "pointer", display: 'inline-block' }} onClick={onEdit}>编辑</Text>
        )
    };

    return (
        <>
            <Flex alignItems="center" justifyContent="space-between" color="#A8ADB2" pb="12px" sx={{borderBottom: '1px solid #22262E'}}>
                <Image src={iconLeft} style={{width: 16, height: 16, cursor: 'pointer'}} onClick={onView}/>
                <Text className="title_center">公告</Text>
                {hasEditPermisson ? <Edit /> : <span></span>}
            </Flex>
            <div className="content more-content">
                <div className='content-box'>{roomAnnouncement}</div>
            </div>
            {
                hasEditPermisson && 
                <div>
                    <Button 
                        variant='primary' 
                        className='save-btn' 
                        onClick={() => {setShowModal('block')}} 
                    >删除</Button>
                </div>
            }
            {/* 弹窗 */}
            <Modal show={showModal} content="确定删除公告吗？" setShow={setShowModal} onOk={() => { updateRoomNotice(roomId, ""); onView(); }}></Modal>
        </>
    )
}

export default EditNotice;