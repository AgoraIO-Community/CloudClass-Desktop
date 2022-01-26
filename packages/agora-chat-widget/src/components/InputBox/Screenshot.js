import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { sendImgMsg } from '../../api/message';

const ScreenshotMenu = ({ couterRef }) => {
  const ipcRenderer = window.require('electron').ipcRenderer;
  const [isCloaking, setIsCloaking] = useState(true);
  const isElectron = window.navigator.userAgent.indexOf('Electron') !== -1;
  const captureScreen = (hideWindow) => {
    setIsCloaking(!hideWindow);
    isElectron && ipcRenderer.send('shortcutcapture', { hideWindow });
  };
  useEffect(() => {
    if (isElectron) {
      const dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      ipcRenderer.removeAllListeners('shortcutCaptureDone');
      ipcRenderer.on('shortcutCaptureDone', (event, dataURL, bounds) => {
        const blob = dataURLtoBlob(dataURL);
        //dataURL = window.URL.createObjectURL(blob);
        let file = {
          url: dataURL,
          data: blob,
          filename: `截图文件${new Date().getTime()}.png`,
          filetype: 'png',
          // 该参数用来标识图片发送对象的来源，主要告诉拦截器如果是截图，就不要在输入框生成缩略图了
          from: 'screenShot',
          imgsrc: dataURL,
        };
        sendImgMsg(couterRef, file);
      });
    }
  }, []);

  return (
    <Menu defaultSelectedKeys={'1'}>
      <Menu.Item key="1" className="screenshot-menu" onClick={() => captureScreen(false)}>
        {isCloaking && <div className="screenshot-menu-select"></div>}
        <span>截图</span>
      </Menu.Item>
      <Menu.Item key="2" className="screenshot-menu" onClick={() => captureScreen(true)}>
        {!isCloaking && <div className="screenshot-menu-select"></div>}
        <span>截图时隐藏教室页面</span>
      </Menu.Item>
    </Menu>
  );
};

export default ScreenshotMenu;
