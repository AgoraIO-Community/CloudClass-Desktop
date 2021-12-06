import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AgoraRtcVideoCanvas,
  AgoraRteEngine,
  AgoraRteEngineConfig,
  AgoraRteEventType,
  AgoraRteLogLevel,
  AgoraRteMediaPublishState,
  AgoraRteScene,
  AgoraStream,
  AgoraRtcLocalVideoCanvas,
  AGRtcConnectionType,
} from 'agora-rte-sdk';

function Renderer({ scene, stream }: { scene: AgoraRteScene; stream: AgoraStream }) {
  const key = `remote-${stream.streamUuid}`;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      const canvas = new AgoraRtcVideoCanvas(stream.streamUuid, scene.sceneId, ref.current);
      scene.localUser?.setupRemoteVideo(canvas);
    }
  }, [ref]);

  return <div ref={ref} key={key} id={key} style={{ width: 640, height: 480 }}></div>;
}

function App() {
  const [scene, setScene] = useState<AgoraRteScene | null>(null);
  const [roomName, setRoomName] = useState<string>('Maths Class A');
  const [roomUuid, setRoomUuid] = useState<string>('plutoless');
  const [streams, setStreams] = useState<Map<string, AgoraStream>>(new Map<string, AgoraStream>());
  const users = [
    {
      token:
        '00647b7535dcb9a4bb4aa592115266eae98IADu//8UccSDAGk5r97TfnZGBq8xBq3ar1DCaZKC7XHLOAx+f9gAAAAAEACWOPX3e9hyYQEA6AN72HJh',
      userUuid: 'test',
      userName: 'Bob',
      role: 1,
      rteRole: 'host',
    },
    {
      token:
        '00647b7535dcb9a4bb4aa592115266eae98IACf08T0ZIEWW6f5gys0m5tWy55BWKHmzO9uwyrYwrVKl+LcsooAAAAAEACWOPX3ithyYQEA6AOK2HJh',
      userUuid: 'test1',
      userName: 'Ann',
      role: 2,
      rteRole: 'audience',
    },
  ];
  const [idx, setIdx] = useState<number>(0);

  const onJoin = () => {
    let config = new AgoraRteEngineConfig(import.meta.env.VITE_REACT_APP_AGORA_APP_ID);
    config.service.host = import.meta.env.VITE_REACT_APP_AGORA_APP_SDK_DOMAIN;
    config.logLevel = import.meta.env.DEV ? AgoraRteLogLevel.VERBOSE : AgoraRteLogLevel.INFO;
    let engine = AgoraRteEngine.createWithConfig(config);

    const user = users[idx];

    engine.login(user.token, user.userUuid).then(async () => {
      console.log(`login success!`);
      // in real case checkin should be moved to top
      engine.getApiService().checkIn(roomUuid, user.userUuid, roomName, user.userName, +user.role);
      const scene = engine.createAgoraRteScene(roomUuid);
      setScene(scene);

      // streamId defaults to 0 means server allocate streamId for you
      await scene.joinScene({ userName: user.userName, userRole: user.rteRole, streamId: '0' });
      //join rtc
      await scene.joinRTC();

      const cameraTrack = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
      const canvas1 = new AgoraRtcLocalVideoCanvas(document.getElementById('local-cam')!);
      cameraTrack.setView(canvas1);

      const screenTrack = AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack();
      const canvas2 = new AgoraRtcLocalVideoCanvas(document.getElementById('local-screen')!);
      screenTrack.setView(canvas2);
    });
  };

  const onJoinSub = async () => {
    let streamUuid = scene?.localUser?.subStream?.streamUuid;
    let token = scene?.localUser?.subStream?.rtcToken;

    if (streamUuid === undefined || token === undefined) {
      return alert('no sub stream info');
    }

    //join rtc
    await scene?.joinRTC({
      connectionType: AGRtcConnectionType.sub,
      streamUuid,
      token,
    });
  };

  useEffect(() => {
    scene
      ?.removeAllListeners(AgoraRteEventType.RemoteStreamAdded)
      .on(AgoraRteEventType.RemoteStreamAdded, (newStreams: AgoraStream[]) => {
        console.log(`[demo] user added [${newStreams.join(',')}]`);
        newStreams.forEach((stream) => streams.set(stream.streamUuid, stream));
        setStreams(new Map(streams));
      });
    scene
      ?.removeAllListeners(AgoraRteEventType.RemoteStreamUpdate)
      .on(AgoraRteEventType.RemoteStreamUpdate, (updatedStreams: AgoraStream[]) => {
        console.log(`[demo] user updated [${updatedStreams.join(',')}]`);
        updatedStreams.forEach((stream) => streams.set(stream.streamUuid, stream));
        setStreams(new Map(streams));
      });
    scene
      ?.removeAllListeners(AgoraRteEventType.RemoteStreamRemove)
      .on(AgoraRteEventType.RemoteStreamRemove, (removedStreams: AgoraStream[]) => {
        console.log(`[demo] user removed [${removedStreams.join(',')}]`);
        removedStreams.forEach((stream) => streams.delete(stream.streamUuid));
        setStreams(new Map(streams));
      });
  }, [scene]);

  const onUpdateRoomProperties = () => {
    scene?.localUser?.setSceneProperties({ test: { test2: { test3: 'test' } } }, {});
  };

  const onDeleteRoomProperties = () => {
    scene?.localUser?.deleteSceneProperties(['test'], {});
  };

  const onUpdateUserProperties = () => {
    scene?.localUser?.setUserProperties({ test: { test2: { test3: 'test' } } }, {});
  };

  const onDeleteUserProperties = () => {
    scene?.localUser?.deleteUserProperties(['test'], {});
  };

  const onPublishLocalStream = () => {
    scene?.localUser?.updateLocalMediaStream({
      publishVideo: AgoraRteMediaPublishState.Published,
      publishAudio: AgoraRteMediaPublishState.Published,
    });
  };

  const onUpdateLocalStream = () => {
    scene?.localUser?.updateLocalMediaStream({
      publishVideo: AgoraRteMediaPublishState.Unpublished,
      publishAudio: AgoraRteMediaPublishState.Published,
    });
  };

  const onUnpublishLocalStream = () => {
    scene?.localUser?.deleteLocalMediaStream();
  };

  const onSendRoomMessage = () => {
    scene?.localUser?.sendRoomMessage('test message');
  };

  const onSetupLocalVideo = () => {
    const cameraTrack = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    const canvas = new AgoraRtcLocalVideoCanvas(document.getElementById('local-cam')!);
    cameraTrack.setView(canvas);
  };

  const onSetupLocalScreen = () => {
    const screenTrack = AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack();
    const canvas = new AgoraRtcLocalVideoCanvas(document.getElementById('local-screen')!);
    screenTrack.setView(canvas);
  };

  const onEnableLocalVideo = () => {
    const cameraTrack = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    cameraTrack.start();
  };

  const onDisableLocalVideo = () => {
    const cameraTrack = AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack();
    cameraTrack.stop();
  };

  const onEnableLocalAudio = () => {
    const micTrack = AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack();
    micTrack.start();
  };

  const onDisableLocalAudio = () => {
    const micTrack = AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack();
    micTrack.stop();
  };

  const onEnableScreenShare = () => {
    const screenTrack = AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack();
    screenTrack.start();
  };

  const onDisableScreenShare = () => {
    const screenTrack = AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack();
    screenTrack.stop();
  };

  const onChangeRoomUuid = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomUuid(event.currentTarget.value);
  };

  const onChangeRoomName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.currentTarget.value);
  };

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let idx = +event.currentTarget.value;
    setIdx(+idx);
  };

  const onPublishScreenStream = async () => {
    const { data } = await scene?.localUser?.updateLocalMediaStream(
      {
        publishVideo: AgoraRteMediaPublishState.Published,
        publishAudio: AgoraRteMediaPublishState.Unpublished,
      },
      AGRtcConnectionType.sub,
    );
    const { streamUuid, rtcToken } = data;

    if (scene && scene.localUser) {
      scene.localUser.subStream = {
        streamUuid,
        rtcToken: rtcToken,
      };
    }
    await scene?.joinRTC({
      streamUuid,
      connectionType: AGRtcConnectionType.sub,
      token: rtcToken,
    });
  };

  const onUnpublishScreenStream = () => {
    scene?.localUser?.deleteLocalScreenStream();
  };

  console.log(`[demo] streams [${Array.from(streams.keys()).join(',')}]`);

  return (
    <div className="App">
      <div>version: {AgoraRteEngine.getVersion()}</div>
      <div>
        <select onChange={onSelect} value={`${idx}`}>
          <option value="0">Bob - Teacher</option>
          <option value="1">Ann - Student</option>
        </select>
        <input placeholder="roomUuid" value={roomUuid} onChange={onChangeRoomUuid}></input>
        <input placeholder="roomName" value={roomName} onChange={onChangeRoomName}></input>
        <button onClick={onJoin}>join main</button>
        <button onClick={onJoinSub}>join sub</button>
      </div>
      <div>
        <button onClick={onUpdateRoomProperties}>UpdateRoomProperties</button>
        <button onClick={onDeleteRoomProperties}>DeleteRoomProperties</button>
        <button onClick={onUpdateUserProperties}>UpdateUserProperties</button>
        <button onClick={onDeleteUserProperties}>DeleteUserProperties</button>
        <button onClick={onPublishLocalStream}>PublishLocalStream</button>
        <button onClick={onUpdateLocalStream}>updateLocalStream</button>
        <button onClick={onUnpublishLocalStream}>unPublishLocalStream</button>
        <button onClick={onSendRoomMessage}>SendRoomMessage</button>
        <button onClick={onUpdateLocalStream}>updateLocalStream</button>
        <button onClick={onPublishScreenStream}>PublishScreenStream</button>
        <button onClick={onUnpublishScreenStream}>unPublishScreenStream</button>
      </div>

      <div>
        <button onClick={onSetupLocalVideo}>SetupLocalVideo</button>
        <button onClick={onEnableLocalVideo}>EnableLocalVideo</button>
        <button onClick={onDisableLocalVideo}>DisableLocalVideo</button>
        <button onClick={onEnableLocalAudio}>EnableLocalAudio</button>
        <button onClick={onDisableLocalAudio}>DisableLocalAudio</button>
        <button onClick={onEnableScreenShare}>EnableScreenShare</button>
        <button onClick={onDisableScreenShare}>onDisableScreenShare</button>
        <button onClick={onSetupLocalScreen}>SetupLocalScreen</button>
        <button onClick={onDisableLocalAudio}>DisableLocalAudio</button>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        <div id="local-cam" style={{ width: 640, height: 480 }}></div>
        <div id="local-screen" style={{ width: 640, height: 480 }}></div>
        {Array.from(streams.values()).map((stream) => {
          return <Renderer scene={scene!} stream={stream}></Renderer>;
        })}
      </div>
    </div>
  );
}

export default App;
