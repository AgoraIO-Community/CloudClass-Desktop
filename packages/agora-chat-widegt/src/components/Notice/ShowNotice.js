
import { Flex, Text, Image } from 'rebass'
import { RightOutlined } from '@ant-design/icons'
import iconNotice from '../../themes/img/icon-notice.svg'
import iconRight from '../../themes/img/icon-right.svg'


const ShowNotice = ({ hasEditPermisson, roomAnnouncement, onEdit, onMore }) => {

    // 判断公告字数，显示更多
    const shouldShowEllipsis = roomAnnouncement?.length > 0;
    // 辅导权限，可直接展示编辑
    const Edit = () => {
        return (
            // <Flex fontSize="12px" color="#0099ff" css={{ cursor: "pointer" }} >
                <Text fontSize="12px" color="#0099ff" css={{ cursor: "pointer", display: 'inline-block' }} onClick={onEdit}> 去编辑 </Text>
            // </Flex>
        )
    };
    // 展示更多
    const More = () => {
        return (
            <Flex alignItems="center" justifyContent="space-between" color="#A8ADB2" css={{cursor: "pointer"}}>
                <Text fontSize="12px" fontWeight="500" onClick={onMore}>更多</Text>
                <img src={iconRight} onClick={onMore} style={{width: 12, height: 12, cursor: 'pointer'}}/>
            </Flex>
        )
    }
    return (
        <div>
            <Flex alignItems="center" justifyContent="space-between" p="2px">
                <Flex alignItems="center" color="#A8ADB2">
                    <Image src={iconNotice} style={{ width: '14px' }} />
                    <Text ml="4px" fontSize="12px" fontWeight="500" whiteSpace="nowrap">公告：</Text>
                </Flex>
                {/* {hasEditPermisson && !shouldShowEllipsis && <Edit />} */}
                {shouldShowEllipsis && <More />}
            </Flex >
            <div className="content">
                {roomAnnouncement ? (
                    <div className="content-box" style={{overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'break-spaces'}}>
                        {/* {shouldShowEllipsis ? noticeContent.slice(0, 38) + "..." : noticeContent} */}
                        {roomAnnouncement}
                    </div>
                ) : (
                        <div className="content-no">
                            <span>暂无公告</span>{hasEditPermisson && <>，<Edit /></> }
                        </div>
                    )}
            </div>

        </div>
    )
}
export default ShowNotice;