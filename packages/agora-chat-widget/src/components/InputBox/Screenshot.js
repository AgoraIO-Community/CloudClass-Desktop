import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { useSelector } from 'react-redux';
import isElctronPlatform, { ipcElecteonRenderer } from '../../utils/platform';
import { dataURLtoBlob } from '../../utils';
import { transI18n } from '~ui-kit';

const ScreenshotMenu = ({ couterRef }) => {
  const [isCloaking, setIsCloaking] = useState(true);
  const state = useSelector((state) => state);
  const { apis } = state;
  let isElectron = isElctronPlatform();
  let ipcRenderer = ipcElecteonRenderer();
  const captureScreen = (hideWindow) => {
    setIsCloaking(!hideWindow);
    isElectron && ipcRenderer.send('shortcutcapture', { hideWindow });
  };

  useEffect(() => {
    if (isElectron) {
      ipcRenderer.on('shortcutCaptureDone', (event, dataURL, bounds) => {
        const blob = dataURLtoBlob(dataURL);
        //dataURL = window.URL.createObjectURL(blob);
        let file = {
          url: dataURL,
          data: blob,
          filename: `${transI18n('chat.screenshots_file')}${new Date().getTime()}.png`,
          filetype: 'png',
          // 该参数用来标识图片发送对象的来源，主要告诉拦截器如果是截图，就不要在输入框生成缩略图了
          from: 'screenShot',
          imgsrc: dataURL,
        };
        apis.messageAPI.sendImgMsg(couterRef, file);
      });
    }
    return () => {
      ipcRenderer.removeAllListeners('shortcutCaptureDone');
    };
  }, []);

  return (
    <Menu defaultSelectedKeys={'1'}>
      <Menu.Item key="1" className="screenshot-menu" onClick={() => captureScreen(false)}>
        {isCloaking && <div className="screenshot-menu-select"></div>}
        <span>{transI18n('chat.screenshots')}</span>
      </Menu.Item>
      <Menu.Item key="2" className="screenshot-menu" onClick={() => captureScreen(true)}>
        {!isCloaking && <div className="screenshot-menu-select"></div>}
        <span>{transI18n('chat.hide_classroom_page_screenshots')}</span>
      </Menu.Item>
    </Menu>
  );
};

export default ScreenshotMenu;
