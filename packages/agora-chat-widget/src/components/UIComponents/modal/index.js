import React, { useState } from "react";
import { Flex } from 'rebass'
import './index.css'


// 模态框
const Modal = ({ show = 'none', setShow, content, onOk }) => {

  // const [showModal, setShowModal] = useState(show)

  return (
    <div style={{ display: show }}>
      <div className="mask"></div>
      <div className="im-content-card">
        <div className="card-txt">{content}</div>
        <Flex justifyContent="center">
          <div className="cancle-btn" onClick={() => {setShow('none')}}>取消</div>
          <div className="ok-btn" onClick={onOk}>确定</div>
        </Flex>
      </div>
    </div>
  )
}
export default Modal