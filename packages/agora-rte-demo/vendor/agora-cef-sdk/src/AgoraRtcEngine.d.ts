/**
 * Types in AgoraBase.h
 */
export declare namespace AgoraRtcEngine {
  enum INTERFACE_ID_TYPE {
    AGORA_IID_AUDIO_DEVICE_MANAGER = 1,
    AGORA_IID_VIDEO_DEVICE_MANAGER = 2,
    AGORA_IID_RTC_ENGINE_PARAMETER = 3,
    AGORA_IID_MEDIA_ENGINE = 4,
    AGORA_IID_SIGNALING_ENGINE = 8
  }
  /**
   * Warning code.
   */
  enum WARN_CODE_TYPE {
    /**
     * 8: The specified view is invalid. Specify a view when using the video call function.
     */
    WARN_INVALID_VIEW = 8,
    /**
     * 16: Failed to initialize the video function, possibly caused by a lack of resources. The users cannot see the video
     * while the voice communication is not affected.
     */
    WARN_INIT_VIDEO = 16,
    /**
     * 20: The request is pending, usually due to some module not being ready, and the SDK postponed processing the request.
     */
    WARN_PENDING = 20,
    /**
     * 103: No channel resources are available. Maybe because the server cannot allocate any channel resource.
     */
    WARN_NO_AVAILABLE_CHANNEL = 103,
    /**
     * 104: A timeout occurs when looking up the channel. When joining a channel, the SDK looks up the specified channel. This
     * warning usually occurs when the network condition is too poor for the SDK to connect to the server.
     */
    WARN_LOOKUP_CHANNEL_TIMEOUT = 104,
    /**
     * @deprecated 105: The server rejects the request to look up the channel. The server cannot process this request or the
     * request is illegal.
     *
     * Use CONNECTION_CHANGED_REJECTED_BY_SERVER(10) in the [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged}
     * callback instead.
     */
    WARN_LOOKUP_CHANNEL_REJECTED = 105,
    /**
     * 106: A timeout occurs when opening the channel. Once the specific channel is found, the SDK opens the channel.
     * This warning usually occurs when the network condition is too poor for the SDK to connect to the server.
     */
    WARN_OPEN_CHANNEL_TIMEOUT = 106,
    /**
     * 107: The server rejects the request to open the channel. The server cannot process this request or the request is illegal.
     */
    WARN_OPEN_CHANNEL_REJECTED = 107,
    /**
     * 111: A timeout occurs when switching to the live video.
     */
    WARN_SWITCH_LIVE_VIDEO_TIMEOUT = 111,
    /**
     * 118: A timeout occurs when setting the client role in the live interactive streaming profile.
     */
    WARN_SET_CLIENT_ROLE_TIMEOUT = 118,
    /**
     * 121: The ticket to open the channel is invalid.
     */
    WARN_OPEN_CHANNEL_INVALID_TICKET = 121,
    /**
     * 122: Try connecting to another server.
     */
    WARN_OPEN_CHANNEL_TRY_NEXT_VOS = 122,
    /**
     * 131: The channel connection cannot be recovered.
     */
    WARN_CHANNEL_CONNECTION_UNRECOVERABLE = 131,
    /**
     * 132: The IP address has changed.
     */
    WARN_CHANNEL_CONNECTION_IP_CHANGED = 132,
    /**
     * 133: The port has changed.
     */
    WARN_CHANNEL_CONNECTION_PORT_CHANGED = 133,
    /**
     * 701: An error occurs in opening the audio mixing file.
     */
    WARN_AUDIO_MIXING_OPEN_ERROR = 701,
    /**
     * 1014: Audio Device Module: A warning occurs in the playback device.
     */
    WARN_ADM_RUNTIME_PLAYOUT_WARNING = 1014,
    /**
     * 1016: Audio Device Module: a warning occurs in the recording device.
     */
    WARN_ADM_RUNTIME_RECORDING_WARNING = 1016,
    /**
     * 1019: Audio Device Module: no valid audio data is recorded.
     */
    WARN_ADM_RECORD_AUDIO_SILENCE = 1019,
    /**
     * 1020: Audio device module: The audio playback frequency is abnormal, which may cause audio freezes. This abnormality
     * is caused by high CPU usage. Agora recommends stopping other apps.
     */
    WARN_ADM_PLAYOUT_MALFUNCTION = 1020,
    /**
     * 1021: Audio device module: the audio recording frequency is abnormal, which may cause audio freezes. This abnormality
     * is caused by high CPU usage. Agora recommends stopping other apps.
     */
    WARN_ADM_RECORD_MALFUNCTION = 1021,
    /**
     * 1025: The audio playback or recording is interrupted by system events (such as a phone call).
     */
    WARN_ADM_CALL_INTERRUPTION = 1025,
    /**
     * 1029: During a call, the audio session category should be set to
     * AVAudioSessionCategoryPlayAndRecord, and agora monitors this value.
     * If the audio session category is set to other values, this warning code
     * is triggered and agora will forcefully set it back to
     * AVAudioSessionCategoryPlayAndRecord.
     */
    WARN_ADM_IOS_CATEGORY_NOT_PLAYANDRECORD = 1029,
    /**
     * 1031: Audio Device Module: The recorded audio voice is too low.
     */
    WARN_ADM_RECORD_AUDIO_LOWLEVEL = 1031,
    /**
     * 1032: Audio Device Module: The playback audio voice is too low.
     */
    WARN_ADM_PLAYOUT_AUDIO_LOWLEVEL = 1032,
    /**
     * 1033: Audio device module: The audio recording device is occupied.
     */
    WARN_ADM_RECORD_AUDIO_IS_ACTIVE = 1033,
    /**
     * 1040: Audio device module: An exception occurs with the audio drive.
     * Solutions:
     * - Disable or re-enable the audio device.
     * - Re-enable your device.
     * - Update the sound card drive.
     */
    WARN_ADM_WINDOWS_NO_DATA_READY_EVENT = 1040,
    /**
     * 1042: Audio device module: The audio recording device is different from the audio playback device,
     * which may cause echoes problem. Agora recommends using the same audio device to record and playback
     * audio.
     */
    WARN_ADM_INCONSISTENT_AUDIO_DEVICE = 1042,
    /**
     * 1051: (Communication profile only) Audio processing module: A howling sound is detected when recording the audio data.
     */
    WARN_APM_HOWLING = 1051,
    /**
     * 1052: Audio Device Module: The device is in the glitch state.
     */
    WARN_ADM_GLITCH_STATE = 1052,
    /**
     * 1053: Audio Processing Module: A residual echo is detected, which may be caused by the belated scheduling of system threads
     * or the signal overflow.
     */
    WARN_APM_RESIDUAL_ECHO = 1053,
    /** @ignore */
    WARN_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322,
    /**
     * 1323: Audio device module: No available playback device.
     * Solution: Plug in the audio device.
     */
    WARN_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323,
    /**
     * 1324: Audio device module: The capture device is released improperly.
     * Solutions:
     * - Disable or re-enable the audio device.
     * - Re-enable your device.
     * - Update the sound card drive.
     */
    WARN_ADM_WIN_CORE_IMPROPER_CAPTURE_RELEASE = 1324,
    /**
     * 1610: Super-resolution warning: The original video dimensions of the remote user exceed 640 * 480.
     */
    WARN_SUPER_RESOLUTION_STREAM_OVER_LIMITATION = 1610,
    /**
     * 1611: Super-resolution warning: Another user is using super resolution.
     */
    WARN_SUPER_RESOLUTION_USER_COUNT_OVER_LIMITATION = 1611,
    /**
     * 1612: The device is not supported.
     */
    WARN_SUPER_RESOLUTION_DEVICE_NOT_SUPPORTED = 1612,
    /** @ignore */
    WARN_RTM_LOGIN_TIMEOUT = 2005,
    /** @ignore */
    WARN_RTM_KEEP_ALIVE_TIMEOUT = 2009
  }
  /**
   * Error code.
   */
  enum ERROR_CODE_TYPE {
    /**
     * 0: No error occurs.
     */
    ERR_OK = 0,
    /**
     * 1: A general error occurs (no specified reason).
     */
    ERR_FAILED = 1,
    /**
     * 2: An invalid parameter is used. For example, the specific channel name includes illegal characters.
     */
    ERR_INVALID_ARGUMENT = 2,
    /**
     * 3: The SDK module is not ready. Possible solutions:
     * - Check the audio device.
     * - Check the completeness of the application.
     * - Re-initialize the Agora engine.
     */
    ERR_NOT_READY = 3,
    /**
     * 4: The SDK does not support this function.
     */
    ERR_NOT_SUPPORTED = 4,
    /**
     * 5: The request is rejected.
     */
    ERR_REFUSED = 5,
    /**
     * 6: The buffer size is not big enough to store the returned data.
     */
    ERR_BUFFER_TOO_SMALL = 6,
    /**
     * 7: The SDK is not initialized before calling this method.
     */
    ERR_NOT_INITIALIZED = 7,
    /**
     * 9: No permission exists. Check if the user has granted access to the audio or video device.
     */
    ERR_NO_PERMISSION = 9,
    /**
     * 10: An API method timeout occurs. Some API methods require the SDK to return the execution result, and this error occurs if
     * the request takes too long (more than 10 seconds) for the SDK to process.
     */
    ERR_TIMEDOUT = 10,
    /**
     * 11: The request is canceled. This is for internal SDK use only, and it does not return to the application through any method
     * or callback.
     */
    ERR_CANCELED = 11,
    /**
     * 12: The method is called too often. This is for internal SDK use only, and it does not return to the application through any
     * method or callback.
     */
    ERR_TOO_OFTEN = 12,
    /**
     * 13: The SDK fails to bind to the network socket. This is for internal SDK use only, and it does not return to the application
     * through any method or callback.
     */
    ERR_BIND_SOCKET = 13,
    /**
     * 14: The network is unavailable. This is for internal SDK use only, and it does not return to the application through any
     * method or callback.
     */
    ERR_NET_DOWN = 14,
    /**
     * 15: No network buffers are available. This is for internal SDK internal use only, and it does not return to the application
     * through any method or callback.
     */
    ERR_NET_NOBUFS = 15,
    /**
     * 17: The request to join the channel is rejected.
     *
     * - This error usually occurs when the user is already in the channel, and still calls the method to join the channel, for
     * example, [joinChannel]{@link AgoraRtcEngine.joinChannel} .
     * - This error usually occurs when the user tries to join a channel during a call test
     * ([startEchoTest]{@link AgoraRtcEngine.startEchoTest}). Once you call [startEchoTest]{@link AgoraRtcEngine.startEchoTest} , you need to call
     * [stopEchoTest]{@link AgoraRtcEngine.stopEchoTest} before joining a channel.
     */
    ERR_JOIN_CHANNEL_REJECTED = 17,
    /**
     * 18: The request to leave the channel is rejected.
     *
     * This error usually occurs:
     * - When the user has left the channel and still calls [leaveChannel]{@link AgoraRtcEngine.leaveChannel} to leave the channel.
     * In this case, stop calling [leaveChannel]{@link AgoraRtcEngine.leaveChannel}.
     * - When the user has not joined the channel and still calls [leaveChannel]{@link AgoraRtcEngine.leaveChannel} to leave the channel.
     * In this case, no extra operation is needed.
     */
    ERR_LEAVE_CHANNEL_REJECTED = 18,
    /**
     * 19: Resources are occupied and cannot be reused.
     */
    ERR_ALREADY_IN_USE = 19,
    /**
     * 20: The SDK gives up the request due to too many requests.
     */
    ERR_ABORTED = 20,
    /**
     * 21: In Windows, specific firewall settings can cause the SDK to fail to initialize and crash.
     */
    ERR_INIT_NET_ENGINE = 21,
    /**
     * 22: The application uses too much of the system resources and the SDK fails to allocate the resources.
     */
    ERR_RESOURCE_LIMITED = 22,
    /**
     * 101: The specified App ID is invalid. Please try to rejoin the channel with a valid App ID.
     */
    ERR_INVALID_APP_ID = 101,
    /**
     * 102: The specified channel name is invalid. Please try to rejoin the channel with a valid channel name.
     */
    ERR_INVALID_CHANNEL_NAME = 102,
    /**
     * 103: Fails to get server resources in the specified region. Please try to specify another region when calling
     * [init]{@link AgoraRtcEngine.init} .
     */
    ERR_NO_SERVER_RESOURCES = 103,
    /**
     * @deprecated 109: Use `CONNECTION_CHANGED_TOKEN_EXPIRED(9)` in the
     * [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback instead.
     *
     * The token expired due to one of the following reasons:
     * - Authorized Timestamp expired: The timestamp is represented by the number of seconds elapsed since 1/1/1970. The user can
     * use the Token to access the Agora service within 24 hours after the Token is generated. If the user does not access the
     * Agora service after 24 hours, this Token is no longer valid.
     * - Call Expiration Timestamp expired: The timestamp is the exact time when a user can no longer use the Agora service
     * (for example, when a user is forced to leave an ongoing call). When a value is set for the Call Expiration Timestamp,
     * it does not mean that the token will expire, but that the user will be banned from the channel.
     */
    ERR_TOKEN_EXPIRED = 109,
    /**
     * @deprecated 110: Use `CONNECTION_CHANGED_INVALID_TOKEN(8)` in the
     * [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback instead.
     *
     * The token is invalid due to one of the following reasons:
     * - The App Certificate for the project is enabled in Console, but the user is still using the App ID. Once the App
     * Certificate is enabled, the user must use a token.
     * - The uid is mandatory, and users must set the same uid as the one set in the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
     */
    ERR_INVALID_TOKEN = 110,
    /**
     * 111: The internet connection is interrupted. This applies to the Agora Web SDK only.
     */
    ERR_CONNECTION_INTERRUPTED = 111,
    /**
     * 112: The internet connection is lost. This applies to the Agora Web SDK only.
     */
    ERR_CONNECTION_LOST = 112,
    /**
     * 113: The user is not in the channel when calling the method.
     */
    ERR_NOT_IN_CHANNEL = 113,
    /**
     * 114: The size of the sent data is over 1024 bytes when the user calls the
     * [sendStreamMessage]{@link AgoraRtcEngine.sendStreamMessage} method.
     */
    ERR_SIZE_TOO_LARGE = 114,
    /**
     * 115: The bitrate of the sent data exceeds the limit of 6 Kbps when the user calls the
     * [sendStreamMessage]{@link AgoraRtcEngine.sendStreamMessage} method.
     */
    ERR_BITRATE_LIMIT = 115,
    /**
     * 116: Too many data streams (over 5 streams) are created when the user calls the
     * [createDataStream]{@link AgoraRtcEngine.createDataStream} method.
     */
    ERR_TOO_MANY_DATA_STREAMS = 116,
    /**
     * 117: The data stream transmission timed out.
     */
    ERR_STREAM_MESSAGE_TIMEOUT = 117,
    /**
     * 119: Switching roles fail. Please try to rejoin the channel.
     */
    ERR_SET_CLIENT_ROLE_NOT_AUTHORIZED = 119,
    /** 120: Decryption fails. The user may have used a different encryption password to join the channel. Check your settings
     * or try rejoining the channel.
     */
    ERR_DECRYPTION_FAILED = 120,
    /**
     * 123: The client is banned by the server.
     */
    ERR_CLIENT_IS_BANNED_BY_SERVER = 123,
    /**
     * 124: Incorrect watermark file parameter.
     */
    ERR_WATERMARK_PARAM = 124,
    /**
     * 125: Incorrect watermark file path.
     */
    ERR_WATERMARK_PATH = 125,
    /**
     * 126: Incorrect watermark file format.
     */
    ERR_WATERMARK_PNG = 126,
    /**
     * 127: Incorrect watermark file information.
     */
    ERR_WATERMARKR_INFO = 127,
    /**
     * 128: Incorrect watermark file data format.
     */
    ERR_WATERMARK_ARGB = 128,
    /**
     * 129: An error occurs in reading the watermark file.
     */
    ERR_WATERMARK_READ = 129,
    /**
     * 130: Encryption is enabled when the user calls the [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method
     * (CDN live streaming does not support encrypted streams).
     */
    ERR_ENCRYPTED_STREAM_NOT_ALLOWED_PUBLISH = 130,
    /**
     * 134: The user account is invalid.
     */
    ERR_INVALID_USER_ACCOUNT = 134,
    /**
     * 151: CDN related errors. Remove the original URL address and add a new one by calling the
     * [removePublishStreamUrl]{@link AgoraRtcEngine.removePublishStreamUrl} and [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} methods.
     */
    ERR_PUBLISH_STREAM_CDN_ERROR = 151,
    /**
     * 152: The host publishes more than 10 URLs. Delete the unnecessary URLs before adding new ones.
     */
    ERR_PUBLISH_STREAM_NUM_REACH_LIMIT = 152,
    /**
     * 153: The host manipulates other hosts' URLs. Check your app logic.
     */
    ERR_PUBLISH_STREAM_NOT_AUTHORIZED = 153,
    /**
     * 154: An error occurs in Agora's streaming server. Call the addPublishStreamUrl method to publish the streaming again.
     */
    ERR_PUBLISH_STREAM_INTERNAL_SERVER_ERROR = 154,
    /**
     * 155: The server fails to find the stream.
     */
    ERR_PUBLISH_STREAM_NOT_FOUND = 155,
    /**
     * 156: The format of the RTMP stream URL is not supported. Check whether the URL format is correct.
     */
    ERR_PUBLISH_STREAM_FORMAT_NOT_SUPPORTED = 156,
    /**
     * @ignore
     */
    ERR_LOGOUT_OTHER = 400,
    /**
     * @ignore
     */
    ERR_LOGOUT_USER = 401,
    /**
     * @ignore
     */
    ERR_LOGOUT_NET = 402,
    /**
     * @ignore
     */
    ERR_LOGOUT_KICKED = 403,
    /**
     * @ignore
     */
    ERR_LOGOUT_PACKET = 404,
    /**
     * @ignore
     */
    ERR_LOGOUT_TOKEN_EXPIRED = 405,
    /**
     * @ignore
     */
    ERR_LOGOUT_OLDVERSION = 406,
    /**
     * @ignore
     */
    ERR_LOGOUT_TOKEN_WRONG = 407,
    /**
     * @ignore
     */
    ERR_LOGOUT_ALREADY_LOGOUT = 408,
    /**
     * @ignore
     */
    ERR_LOGIN_OTHER = 420,
    /**
     * @ignore
     */
    ERR_LOGIN_NET = 421,
    /**
     * @ignore
     */
    ERR_LOGIN_FAILED = 422,
    /**
     * @ignore
     */
    ERR_LOGIN_CANCELED = 423,
    /**
     * @ignore
     */
    ERR_LOGIN_TOKEN_EXPIRED = 424,
    /**
     * @ignore
     */
    ERR_LOGIN_OLD_VERSION = 425,
    /**
     * @ignore
     */
    ERR_LOGIN_TOKEN_WRONG = 426,
    /**
     * @ignore
     */
    ERR_LOGIN_TOKEN_KICKED = 427,
    /**
     * @ignore
     */
    ERR_LOGIN_ALREADY_LOGIN = 428,
    /**
     * @ignore
     */
    ERR_JOIN_CHANNEL_OTHER = 440,
    /**
     * @ignore
     */
    ERR_SEND_MESSAGE_OTHER = 440,
    /**
     * @ignore
     */
    ERR_SEND_MESSAGE_TIMEOUT = 441,
    /**
     * @ignore
     */
    ERR_QUERY_USERNUM_OTHER = 450,
    /**
     * @ignore
     */
    ERR_QUERY_USERNUM_TIMEOUT = 451,
    /**
     * @ignore
     */
    ERR_QUERY_USERNUM_BYUSER = 452,
    /**
     * @ignore
     */
    ERR_LEAVE_CHANNEL_OTHER = 460,
    /**
     * @ignore
     */
    ERR_LEAVE_CHANNEL_KICKED = 461,
    /**
     * @ignore
     */
    ERR_LEAVE_CHANNEL_BYUSER = 462,
    /**
     * @ignore
     */
    ERR_LEAVE_CHANNEL_LOGOUT = 463,
    /**
     * @ignore
     */
    ERR_LEAVE_CHANNEL_DISCONNECTED = 464,
    /**
     * @ignore
     */
    ERR_INVITE_OTHER = 470,
    /**
     * @ignore
     */
    ERR_INVITE_REINVITE = 471,
    /**
     * @ignore
     */
    ERR_INVITE_NET = 472,
    /**
     * @ignore
     */
    ERR_INVITE_PEER_OFFLINE = 473,
    /**
     * @ignore
     */
    ERR_INVITE_TIMEOUT = 474,
    /**
     * @ignore
     */
    ERR_INVITE_CANT_RECV = 475,
    /**
     * 1001: Fails to load the media engine.
     */
    ERR_LOAD_MEDIA_ENGINE = 1001,
    /**
     * 1002: Fails to start the call after enabling the media engine.
     */
    ERR_START_CALL = 1002,
    /**
     * @deprecated 1003: Fails to start the camera.
     * Use `LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE(4)` in the
     * [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback instead.
     */
    ERR_START_CAMERA = 1003,
    /**
     * 1004: Fails to start the video rendering module.
     */
    ERR_START_VIDEO_RENDER = 1004,
    /**
     * 1005: A general error occurs in the Audio Device Module (no specified reason). Check if the audio device is used by
     * another application, or try rejoining the channel.
     */
    ERR_ADM_GENERAL_ERROR = 1005,
    /**
     * 1006: Audio Device Module: An error occurs in using the Java resources.
     */
    ERR_ADM_JAVA_RESOURCE = 1006,
    /**
     * 1007: Audio Device Module: An error occurs in setting the sampling frequency.
     */
    ERR_ADM_SAMPLE_RATE = 1007,
    /**
     * 1008: Audio Device Module: An error occurs in initializing the playback device.
     */
    ERR_ADM_INIT_PLAYOUT = 1008,
    /**
     * 1009: Audio Device Module: An error occurs in starting the playback device.
     */
    ERR_ADM_START_PLAYOUT = 1009,
    /**
     * 1010: Audio Device Module: An error occurs in stopping the playback device.
     */
    ERR_ADM_STOP_PLAYOUT = 1010,
    /**
     * 1011: Audio Device Module: An error occurs in initializing the recording device.
     */
    ERR_ADM_INIT_RECORDING = 1011,
    /**
     * 1012: Audio Device Module: An error occurs in starting the recording device.
     */
    ERR_ADM_START_RECORDING = 1012,
    /**
     * 1013: Audio Device Module: An error occurs in stopping the recording device.
     */
    ERR_ADM_STOP_RECORDING = 1013,
    /**
     * 1015: Audio Device Module: A playback error occurs. Check your playback device and try rejoining the channel.
     */
    ERR_ADM_RUNTIME_PLAYOUT_ERROR = 1015,
    /**
     * 1017: Audio Device Module: A recording error occurs.
     */
    ERR_ADM_RUNTIME_RECORDING_ERROR = 1017,
    /**
     * 1018: Audio Device Module: Fails to record.
     */
    ERR_ADM_RECORD_AUDIO_FAILED = 1018,
    /**
     * 1022: Audio Device Module: An error occurs in initializing the
     * loopback device.
     */
    ERR_ADM_INIT_LOOPBACK = 1022,
    /**
     * 1023: Audio Device Module: An error occurs in starting the loopback
     * device.
     */
    ERR_ADM_START_LOOPBACK = 1023,
    /**
     * 1027: Audio Device Module: No recording permission exists. Check if the
     *  recording permission is granted.
     */
    ERR_ADM_NO_PERMISSION = 1027,
    /**
     * 1033: Audio device module: The device is occupied.
     */
    ERR_ADM_RECORD_AUDIO_IS_ACTIVE = 1033,
    /**
     * 1101: Audio device module: A fatal exception occurs.
     */
    ERR_ADM_ANDROID_JNI_JAVA_RESOURCE = 1101,
    /**
     * 1108: Audio device module: The recording frequency is lower than 50.
     * 0 indicates that the recording is not yet started. We recommend
     * checking your recording permission.
     */
    ERR_ADM_ANDROID_JNI_NO_RECORD_FREQUENCY = 1108,
    /**
     * 1109: The playback frequency is lower than 50. 0 indicates that the
     * playback is not yet started. We recommend checking if you have created
     * too many AudioTrack instances.
     */
    ERR_ADM_ANDROID_JNI_NO_PLAYBACK_FREQUENCY = 1109,
    /**
     * 1111: Audio device module: AudioRecord fails to start up. A ROM system
     * error occurs. We recommend the following options to debug:
     * - Restart your App.
     * - Restart your cellphone.
     * - Check your recording permission.
     */
    ERR_ADM_ANDROID_JNI_JAVA_START_RECORD = 1111,
    /**
     * 1112: Audio device module: AudioTrack fails to start up. A ROM system
     * error occurs. We recommend the following options to debug:
     * - Restart your App.
     * - Restart your cellphone.
     * - Check your playback permission.
     */
    ERR_ADM_ANDROID_JNI_JAVA_START_PLAYBACK = 1112,
    /**
     * 1115: Audio device module: AudioRecord returns error. The SDK will
     * automatically restart AudioRecord.
     */
    ERR_ADM_ANDROID_JNI_JAVA_RECORD_ERROR = 1115,
    /** @deprecated */
    ERR_ADM_ANDROID_OPENSL_CREATE_ENGINE = 1151,
    /** @deprecated */
    ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_RECORDER = 1153,
    /** @deprecated */
    ERR_ADM_ANDROID_OPENSL_START_RECORDER_THREAD = 1156,
    /** @deprecated */
    ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_PLAYER = 1157,
    /** @deprecated */
    ERR_ADM_ANDROID_OPENSL_START_PLAYER_THREAD = 1160,
    /**
     * 1201: Audio device module: The current device does not support audio
     * input, possibly because you have mistakenly configured the audio session
     *  category, or because some other app is occupying the input device. We
     * recommend terminating all background apps and re-joining the channel.
     */
    ERR_ADM_IOS_INPUT_NOT_AVAILABLE = 1201,
    /**
     * 1206: Audio device module: Cannot activate the Audio Session.
     */
    ERR_ADM_IOS_ACTIVATE_SESSION_FAIL = 1206,
    /**
     * 1210: Audio device module: Fails to initialize the audio device,
     * normally because the audio device parameters are wrongly set.
     */
    ERR_ADM_IOS_VPIO_INIT_FAIL = 1210,
    /**
     * 1213: Audio device module: Fails to re-initialize the audio device,
     * normally because the audio device parameters are wrongly set.
     */
    ERR_ADM_IOS_VPIO_REINIT_FAIL = 1213,
    /**
     * 1214: Fails to re-start up the Audio Unit, possibly because the audio session category is not compatible
     * with the settings of the Audio Unit.
     */
    ERR_ADM_IOS_VPIO_RESTART_FAIL = 1214,
    /** @ignore */
    ERR_ADM_IOS_SET_RENDER_CALLBACK_FAIL = 1219,
    /** @deprecated */
    ERR_ADM_IOS_SESSION_SAMPLERATR_ZERO = 1221,
    /**
     * 1301: Audio device module: An audio driver abnomality or a
     * compatibility issue occurs. Solutions: Disable and restart the audio
     * device, or reboot the system
     */
    ERR_ADM_WIN_CORE_INIT = 1301,
    /**
     * 1303: Audio device module: A recording driver abnomality or a
     * compatibility issue occurs. Solutions: Disable and restart the audio
     * device, or reboot the system.
     */
    ERR_ADM_WIN_CORE_INIT_RECORDING = 1303,
    /**
     * 1306: Audio device module: A playout driver abnomality or a
     * compatibility issue occurs. Solutions: Disable and restart the audio
     * device, or reboot the system.
     */
    ERR_ADM_WIN_CORE_INIT_PLAYOUT = 1306,
    /**
     * 1307: Audio device module: No audio device is available. Solutions:
     * Plug in a proper audio device.
     */
    ERR_ADM_WIN_CORE_INIT_PLAYOUT_NULL = 1307,
    /**
     * 1309: Audio device module: An audio driver abnomality or a
     * compatibility issue occurs. Solutions: Disable and restart the audio
     * device, or reboot the system.
     */
    ERR_ADM_WIN_CORE_START_RECORDING = 1309,
    /**
     * 1311: Audio device module: Insufficient system memory or poor device
     * performance. Solutions: Reboot the system or replace the device.
     */
    ERR_ADM_WIN_CORE_CREATE_REC_THREAD = 1311,
    /**
     * 1314: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.*/
    ERR_ADM_WIN_CORE_CAPTURE_NOT_STARTUP = 1314,
    /**
     * 1319: Audio device module: Insufficient system memory or poor device
     * performance. Solutions: Reboot the system or replace the device. */
    ERR_ADM_WIN_CORE_CREATE_RENDER_THREAD = 1319,
    /**
     * 1320: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Replace the device.
     */
    ERR_ADM_WIN_CORE_RENDER_NOT_STARTUP = 1320,
    /**
     * 1322: Audio device module: No audio sampling device is available.
     * Solutions: Plug in a proper recording device.
     */
    ERR_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322,
    /**
     * 1323: Audio device module: No audio playout device is available.
     * Solutions: Plug in a proper playback device.
     */
    ERR_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323,
    /**
     * 1351: Audio device module: An audio driver abnormality or a
     * compatibility issue occurs. Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.
     */
    ERR_ADM_WIN_WAVE_INIT = 1351,
    /**
     * 1353: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.
     */
    ERR_ADM_WIN_WAVE_INIT_RECORDING = 1353,
    /**
     * 1354: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.
     */
    ERR_ADM_WIN_WAVE_INIT_MICROPHONE = 1354,
    /**
     * 1355: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver. */
    ERR_ADM_WIN_WAVE_INIT_PLAYOUT = 1355,
    /**
     * 1356: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.
     */
    ERR_ADM_WIN_WAVE_INIT_SPEAKER = 1356,
    /**
     * 1357: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver. */
    ERR_ADM_WIN_WAVE_START_RECORDING = 1357,
    /**
     * 1358: Audio device module: An audio driver abnormality occurs.
     * Solutions:
     * - Disable and then re-enable the audio device.
     * - Reboot the system.
     * - Upgrade your audio card driver.*/
    ERR_ADM_WIN_WAVE_START_PLAYOUT = 1358,
    /**
     * 1359: Audio Device Module: No recording device exists.
     */
    ERR_ADM_NO_RECORDING_DEVICE = 1359,
    /**
     * 1360: Audio Device Module: No playback device exists.
     */
    ERR_ADM_NO_PLAYOUT_DEVICE = 1360,
    /**
     * 1501: Video Device Module: The camera is unauthorized.
     */
    ERR_VDM_CAMERA_NOT_AUTHORIZED = 1501,
    /**
     * @deprecated 1502: Video Device Module: The camera in use.
     *
     * Use `LOCAL_VIDEO_STREAM_ERROR_DEVICE_BUSY(3)` in the
     * [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback instead.
     */
    ERR_VDM_WIN_DEVICE_IN_USE = 1502,
    /**
     * 1600: Video Device Module: An unknown error occurs.
     */
    ERR_VCM_UNKNOWN_ERROR = 1600,
    /**
     * 1601: Video Device Module: An error occurs in initializing the video encoder.
     */
    ERR_VCM_ENCODER_INIT_ERROR = 1601,
    /**
     * 1602: Video Device Module: An error occurs in encoding.
     */
    ERR_VCM_ENCODER_ENCODE_ERROR = 1602,
    /**
     * 1603: Video Device Module: An error occurs in setting the video encoder.
     */
    ERR_VCM_ENCODER_SET_ERROR = 1603
  }
  /**
   * Output log filter level.
   */
  enum LOG_FILTER_TYPE {
    /**
     * 0: Do not output any log information.
     */
    LOG_FILTER_OFF = 0,
    /**
     * 0x080f: Output all log information.
     * Set your log filter as debug if you want to get the most complete log file.
     */
    LOG_FILTER_DEBUG = 2063,
    /**
     * 0x000f: Output CRITICAL, ERROR, WARNING, and INFO level log information.
     * We recommend setting your log filter as this level.
     */
    LOG_FILTER_INFO = 15,
    /**
     * 0x000e: Outputs CRITICAL, ERROR, and WARNING level log information.
     */
    LOG_FILTER_WARN = 14,
    /**
     * 0x000c: Outputs CRITICAL and ERROR level log information.
     */
    LOG_FILTER_ERROR = 12,
    /**
     * 0x0008: Outputs CRITICAL level log information.
     */
    LOG_FILTER_CRITICAL = 8,
    /** @ignore */
    LOG_FILTER_MASK = 2063
  }
}
/**
 * Types in IAgoraMediaEngine.h
 */
export declare namespace AgoraRtcEngine {
  /**
   * @deprecated Type of audio device.
   */
  enum MEDIA_SOURCE_TYPE {
    /**
     * Audio playback device.
     */
    AUDIO_PLAYOUT_SOURCE = 0,
    /**
     * Microphone.
     */
    AUDIO_RECORDING_SOURCE = 1
  }
  /**
   * The frame type.
   */
  enum AUDIO_FRAME_TYPE {
    /**
     * 0: PCM16.
     */
    FRAME_TYPE_PCM16 = 0
  }
  /**
   * Definition of AudioFrame
   */
  interface AudioFrame {
    /**
     * The type of the audio frame. See #AUDIO_FRAME_TYPE
     */
    type: AUDIO_FRAME_TYPE;
    /**
     * The number of samples per channel in the audio frame.
     */
    samples: number;
    /**
     * The number of bytes per audio sample, which is usually 16-bit (2-byte).
     */
    bytesPerSample: number;
    /**
     * The number of audio channels.
     * - 1: Mono
     * - 2: Stereo (the data is interleaved)
     */
    channels: number;
    /**
     * The sample rate.
     */
    samplesPerSec: number;
    /**
     * The data buffer of the audio frame. When the audio frame uses a stereo channel, the data buffer is interleaved.
     *
     * The size of the data buffer is as follows: `buffer` = `samples` × `channels` × `bytesPerSample`.
     */
    buffer: Uint8Array;
    /**
     * The timestamp (ms) of the external audio frame. You can use this parameter for the following purposes:
     * - Restore the order of the captured audio frame.
     * - Synchronize audio and video frames in video-related scenarios, including where external video sources are used.
     */
    renderTimeMs: number;
    /**
     * Reserved parameter.
     */
    avsync_type: number;
  }
  /**
   * The video frame type.
   */
  enum VIDEO_FRAME_TYPE {
    /**
     * 0: YUV420
     */
    FRAME_TYPE_YUV420 = 0,
    /**
     * 1: YUV422
     */
    FRAME_TYPE_YUV422 = 1,
    /**
     * 2: RGBA
     */
    FRAME_TYPE_RGBA = 2
  }
  /**
   * The frame position of the video observer.
   */
  enum VIDEO_OBSERVER_POSITION {
    /**
     * 1: The post-capturer position, which corresponds to the video data in the onCaptureVideoFrame callback.
     */
    POSITION_POST_CAPTURER = 1,
    /**
     * 2: The pre-renderer position, which corresponds to the video data in the onRenderVideoFrame callback.
     */
    POSITION_PRE_RENDERER = 2,
    /**
     * 4: The pre-encoder position, which corresponds to the video data in the onPreEncodeVideoFrame callback.
     */
    POSITION_PRE_ENCODER = 4
  }
  /**
   * Video frame information. The video data format is YUV420. The buffer provides a pointer to a pointer. The interface cannot modify the pointer of the buffer, but can modify the content of the buffer only.
   */
  interface VideoFrame {
    type: VIDEO_FRAME_TYPE;
    /**
     * Video pixel width.
     */
    width: number;
    /**
     * Video pixel height.
     */
    height: number;
    /**
     * Line span of the Y buffer within the YUV data.
     */
    yStride: number;
    /**
     * Line span of the U buffer within the YUV data.
     */
    uStride: number;
    /**
     * Line span of the V buffer within the YUV data.
     */
    vStride: number;
    /**
     * Pointer to the Y buffer pointer within the YUV data.
     */
    yBuffer: Uint8Array;
    /**
     * Pointer to the U buffer pointer within the YUV data.
     */
    uBuffer: Uint8Array;
    /**
     * Pointer to the V buffer pointer within the YUV data.
     */
    vBuffer: Uint8Array;
    /** Set the rotation of this frame before rendering the video. Supports 0, 90, 180, 270 degrees clockwise.
     */
    rotation: number;
    /**
     * The timestamp (ms) of the external audio frame. It is mandatory. You can use this parameter for the following purposes:
     * - Restore the order of the captured audio frame.
     * - Synchronize audio and video frames in video-related scenarios, including scenarios where external video sources are used.
     * @note This timestamp is for rendering the video stream, and not for capturing the video stream.
     */
    renderTimeMs: number;
    avsync_type: number;
  }
  enum PLANE_TYPE {
    Y_PLANE = 0,
    U_PLANE = 1,
    V_PLANE = 2,
    NUM_OF_PLANES = 3
  }
  enum VIDEO_TYPE {
    VIDEO_TYPE_UNKNOWN = 0,
    VIDEO_TYPE_I420 = 1,
    VIDEO_TYPE_IYUV = 2,
    VIDEO_TYPE_RGB24 = 3,
    VIDEO_TYPE_ABGR = 4,
    VIDEO_TYPE_ARGB = 5,
    VIDEO_TYPE_ARGB4444 = 6,
    VIDEO_TYPE_RGB565 = 7,
    VIDEO_TYPE_ARGB1555 = 8,
    VIDEO_TYPE_YUY2 = 9,
    VIDEO_TYPE_YV12 = 10,
    VIDEO_TYPE_UYVY = 11,
    VIDEO_TYPE_MJPG = 12,
    VIDEO_TYPE_NV21 = 13,
    VIDEO_TYPE_NV12 = 14,
    VIDEO_TYPE_BGRA = 15,
    VIDEO_TYPE_RGBA = 16,
    VIDEO_TYPE_I422 = 17
  }
  /**
   * @deprecated
   */
  interface ExternalVideoRenerContext {
    /**
     * Video display window.
     */
    view: any;
    /**
     * Video display mode: \ref agora::rtc::RENDER_MODE_TYPE "RENDER_MODE_TYPE"
     */
    renderMode: number;
    /**
     * The image layer location.
     * - 0: (Default) The image is at the bottom of the stack
     * - 100: The image is at the top of the stack.
     * @note If the value is set to below 0 or above 100, the #ERR_INVALID_ARGUMENT error occurs.
     */
    zOrder: number;
    /**
     * Video layout distance from the left.
     */
    left: number;
    /**
     * Video layout distance from the top.
     */
    top: number;
    /**
     * Video layout distance from the right.
     */
    right: number;
    /**
     * Video layout distance from the bottom.
     */
    bottom: number;
  }
  /**
   * The video buffer type.
   */
  enum VIDEO_BUFFER_TYPE {
    /**
     * 1: The video buffer in the format of raw data.
     */
    VIDEO_BUFFER_RAW_DATA = 1
  }
  /**
   * The video pixel format.
   *
   * @note The SDK does not support the alpha channel, and discards any alpha value passed to the SDK.
   */
  enum VIDEO_PIXEL_FORMAT {
    /**
     * 0: The video pixel format is unknown.
     */
    VIDEO_PIXEL_UNKNOWN = 0,
    /**
     * 1: The video pixel format is I420.
     */
    VIDEO_PIXEL_I420 = 1,
    /**
     * 2: The video pixel format is BGRA.
     */
    VIDEO_PIXEL_BGRA = 2,
    /**
     * 3: The video pixel format is NV21.
     */
    VIDEO_PIXEL_NV21 = 3,
    /**
     * 4: The video pixel format is RGBA.
     */
    VIDEO_PIXEL_RGBA = 4,
    /**
     * 5: The video pixel format is IMC2.
     */
    VIDEO_PIXEL_IMC2 = 5,
    /**
     * 7: The video pixel format is ARGB.
     */
    VIDEO_PIXEL_ARGB = 7,
    /**
     * 8: The video pixel format is NV12.
     */
    VIDEO_PIXEL_NV12 = 8,
    /**
     * 16: The video pixel format is I422.
     */
    VIDEO_PIXEL_I422 = 16
  }
  /**
   * The external video frame.
   */
  interface ExternalVideoFrame {
    /**
     * The buffer type. See #VIDEO_BUFFER_TYPE
     */
    type: VIDEO_BUFFER_TYPE;
    /**
     * The pixel format. See #VIDEO_PIXEL_FORMAT
     */
    format: VIDEO_PIXEL_FORMAT;
    /**
     * The video buffer.
     */
    buffer: Uint8Array;
    /**
     * Line spacing of the incoming video frame, which must be in pixels instead of bytes. For textures, it is the width of the texture.
     */
    stride: number;
    /** Height of the incoming video frame.
     */
    height: number;
    /** [Raw data related parameter] The number of pixels trimmed from the left. The default value is 0.
     */
    cropLeft: number;
    /** [Raw data related parameter] The number of pixels trimmed from the top. The default value is 0.
     */
    cropTop: number;
    /** [Raw data related parameter] The number of pixels trimmed from the right. The default value is 0.
     */
    cropRight: number;
    /** [Raw data related parameter] The number of pixels trimmed from the bottom. The default value is 0.
     */
    cropBottom: number;
    /** [Raw data related parameter] The clockwise rotation of the video frame. You can set the rotation angle as 0, 90, 180, or 270. The default value is 0.
     */
    rotation: number;
    /** Timestamp (ms) of the incoming video frame. An incorrect timestamp results in frame loss or unsynchronized audio and video.
     */
    timestamp: number;
  }
}
/**
 * Types in IAgoraRtcEngine.h
 */
export declare namespace AgoraRtcEngine {
  /**
   * Maximum length of the device ID.
   */
  enum MAX_DEVICE_ID_LENGTH_TYPE {
    /**
     * The maximum length of the device ID is 512 bytes.
     */
    MAX_DEVICE_ID_LENGTH = 512
  }
  /**
   * Maximum length of user account.
   */
  enum MAX_USER_ACCOUNT_LENGTH_TYPE {
    /**
     * The maximum length of user account is 255 bytes.
     */
    MAX_USER_ACCOUNT_LENGTH = 256
  }
  /**
   * Maximum length of channel ID.
   */
  enum MAX_CHANNEL_ID_LENGTH_TYPE {
    /**
     * The maximum length of channel id is 64 bytes.
     */
    MAX_CHANNEL_ID_LENGTH = 65
  }
  /**
   * Formats of the quality report.
   */
  enum QUALITY_REPORT_FORMAT_TYPE {
    /**
     * 0: The quality report in JSON format,
     */
    QUALITY_REPORT_JSON = 0,
    /**
     * 1: The quality report in HTML format.
     */
    QUALITY_REPORT_HTML = 1
  }
  enum MEDIA_ENGINE_EVENT_CODE_TYPE {
    /**
     * 0: For internal use only.
     */
    MEDIA_ENGINE_RECORDING_ERROR = 0,
    /**
     * 1: For internal use only.
     */
    MEDIA_ENGINE_PLAYOUT_ERROR = 1,
    /**
     * 2: For internal use only.
     */
    MEDIA_ENGINE_RECORDING_WARNING = 2,
    /**
     * 3: For internal use only.
     */
    MEDIA_ENGINE_PLAYOUT_WARNING = 3,
    /**
     * 10: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_FILE_MIX_FINISH = 10,
    /**
     * 12: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_FAREND_MUSIC_BEGINS = 12,
    /**
     * 13: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_FAREND_MUSIC_ENDS = 13,
    /**
     * 14: For internal use only.
     */
    MEDIA_ENGINE_LOCAL_AUDIO_RECORD_ENABLED = 14,
    /**
     * 15: For internal use only.
     */
    MEDIA_ENGINE_LOCAL_AUDIO_RECORD_DISABLED = 15,
    /**
     * 20: For internal use only.
     */
    MEDIA_ENGINE_ROLE_BROADCASTER_SOLO = 20,
    /**
     * 21: For internal use only.
     */
    MEDIA_ENGINE_ROLE_BROADCASTER_INTERACTIVE = 21,
    /**
     * 22: For internal use only.
     */
    MEDIA_ENGINE_ROLE_AUDIENCE = 22,
    /**
     * 23: For internal use only.
     */
    MEDIA_ENGINE_ROLE_COMM_PEER = 23,
    /**
     * 24: For internal use only.
     */
    MEDIA_ENGINE_ROLE_GAME_PEER = 24,
    /**
     * 110: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ADM_REQUIRE_RESTART = 110,
    /**
     * 111: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ADM_SPECIAL_RESTART = 111,
    /**
     * 112: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ADM_USING_COMM_PARAMS = 112,
    /**
     * 113: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ADM_USING_NORM_PARAMS = 113,
    /**
     * 710: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_EVENT_MIXING_PLAY = 710,
    /**
     * 711: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_EVENT_MIXING_PAUSED = 711,
    /**
     * 712: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_EVENT_MIXING_RESTART = 712,
    /**
     * 713: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_EVENT_MIXING_STOPPED = 713,
    /**
     * 714: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_EVENT_MIXING_ERROR = 714,
    /**
     * 701: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ERROR_MIXING_OPEN = 701,
    /**
     * 702: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ERROR_MIXING_TOO_FREQUENT = 702,
    /**
     * 703: The audio mixing file playback is interrupted. For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ERROR_MIXING_INTERRUPTED_EOF = 703,
    /**
     * 0: For internal use only.
     */
    MEDIA_ENGINE_AUDIO_ERROR_MIXING_NO_ERROR = 0
  }
  /**
   * The states of the local user's audio mixing file.
   */
  enum AUDIO_MIXING_STATE_TYPE {
    /**
     * 710: The audio mixing file is playing after the method call of [startAudioMixing]{@link AgoraRtcEngine.startAudioMixing} or
     * [resumeAudioMixing]{@link AgoraRtcEngine.resumeAudioMixing} succeeds.
     */
    AUDIO_MIXING_STATE_PLAYING = 710,
    /**
     * 711: The audio mixing file pauses playing after the method call of [pauseAudioMixing]{@link AgoraRtcEngine.pauseAudioMixing} succeeds.
     */
    AUDIO_MIXING_STATE_PAUSED = 711,
    /**
     * 713: The audio mixing file stops playing after the method call of [stopAudioMixing]{@link AgoraRtcEngine.stopAudioMixing} succeeds.
     */
    AUDIO_MIXING_STATE_STOPPED = 713,
    /**
     * 714: An exception occurs when playing the audio mixing file. See
     * [AUDIO_MIXING_ERROR_TYPE]{@link AgoraRtcEngine.AUDIO_MIXING_ERROR_TYPE}.
     */
    AUDIO_MIXING_STATE_FAILED = 714
  }
  /**
   * The error codes of the local user's audio mixing file.
   */
  enum AUDIO_MIXING_ERROR_TYPE {
    /**
     * 701: The SDK cannot open the audio mixing file.
     */
    AUDIO_MIXING_ERROR_CAN_NOT_OPEN = 701,
    /**
     * 702: The SDK opens the audio mixing file too frequently.
     */
    AUDIO_MIXING_ERROR_TOO_FREQUENT_CALL = 702,
    /**
     * 703: The audio mixing file playback is interrupted.
     */
    AUDIO_MIXING_ERROR_INTERRUPTED_EOF = 703,
    /**
     * 0: The SDK can open the audio mixing file.
     */
    AUDIO_MIXING_ERROR_OK = 0
  }
  /**
   * Media device states.
   */
  enum MEDIA_DEVICE_STATE_TYPE {
    /**
     * 1: The device is active.
     */
    MEDIA_DEVICE_STATE_ACTIVE = 1,
    /**
     * 2: The device is disabled.
     */
    MEDIA_DEVICE_STATE_DISABLED = 2,
    /**
     * 4: The device is not present.
     */
    MEDIA_DEVICE_STATE_NOT_PRESENT = 4,
    /**
     * 8: The device is unplugged.
     */
    MEDIA_DEVICE_STATE_UNPLUGGED = 8
  }
  /**
   * Media device types.
   */
  enum MEDIA_DEVICE_TYPE {
    /**
     * -1: Unknown device type.
     */
    UNKNOWN_AUDIO_DEVICE = -1,
    /**
     * 0: Audio playback device.
     */
    AUDIO_PLAYOUT_DEVICE = 0,
    /**
     * 1: Audio recording device.
     */
    AUDIO_RECORDING_DEVICE = 1,
    /**
     * 2: Video renderer.
     */
    VIDEO_RENDER_DEVICE = 2,
    /**
     * 3: Video capturer.
     */
    VIDEO_CAPTURE_DEVICE = 3,
    /**
     * 4: Application audio playback device.
     */
    AUDIO_APPLICATION_PLAYOUT_DEVICE = 4
  }
  /**
   * Local video state types
   */
  enum LOCAL_VIDEO_STREAM_STATE {
    /**
     * 0: Initial state
     */
    LOCAL_VIDEO_STREAM_STATE_STOPPED = 0,
    /**
     * 1: The local video capturing device starts successfully.
     *
     * The SDK also reports this state when you share a maximized window by calling
     * [startScreenCaptureByWindowId]{@link AgoraRtcEngine.startScreenCaptureByWindowId}.
     */
    LOCAL_VIDEO_STREAM_STATE_CAPTURING = 1,
    /**
     * 2: The first video frame is successfully encoded.
     */
    LOCAL_VIDEO_STREAM_STATE_ENCODING = 2,
    /**
     * 3: The local video fails to start.
     */
    LOCAL_VIDEO_STREAM_STATE_FAILED = 3
  }
  /**
   * Local video state error codes
   */
  enum LOCAL_VIDEO_STREAM_ERROR {
    /**
     * 0: The local video is normal.
     */
    LOCAL_VIDEO_STREAM_ERROR_OK = 0,
    /**
     * 1: No specified reason for the local video failure.
     */
    LOCAL_VIDEO_STREAM_ERROR_FAILURE = 1,
    /**
     * 2: No permission to use the local video capturing device.
     */
    LOCAL_VIDEO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2,
    /**
     * 3: The local video capturing device is in use.
     */
    LOCAL_VIDEO_STREAM_ERROR_DEVICE_BUSY = 3,
    /**
     * 4: The local video capture fails. Check whether the capturing device is working properly.
     */
    LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE = 4,
    /**
     * 5: The local video encoding fails.
     */
    LOCAL_VIDEO_STREAM_ERROR_ENCODE_FAILURE = 5,
    /**
     * 11: The shared window is minimized when you call
     * [startScreenCaptureByWindowId]{@link AgoraRtcEngine.startScreenCaptureByWindowId} to share a window.
     */
    LOCAL_VIDEO_STREAM_ERROR_SCREEN_CAPTURE_WINDOW_MINIMIZED = 11
  }
  /**
   * Local audio state types.
   */
  enum LOCAL_AUDIO_STREAM_STATE {
    /**
     * 0: The local audio is in the initial state.
     */
    LOCAL_AUDIO_STREAM_STATE_STOPPED = 0,
    /**
     * 1: The recording device starts successfully.
     */
    LOCAL_AUDIO_STREAM_STATE_RECORDING = 1,
    /**
     * 2: The first audio frame encodes successfully.
     */
    LOCAL_AUDIO_STREAM_STATE_ENCODING = 2,
    /**
     * 3: The local audio fails to start.
     */
    LOCAL_AUDIO_STREAM_STATE_FAILED = 3
  }
  /**
   * Local audio state error codes.
   */
  enum LOCAL_AUDIO_STREAM_ERROR {
    /**
     * 0: The local audio is normal.
     */
    LOCAL_AUDIO_STREAM_ERROR_OK = 0,
    /**
     * 1: No specified reason for the local audio failure.
     */
    LOCAL_AUDIO_STREAM_ERROR_FAILURE = 1,
    /**
     * 2: No permission to use the local audio device.
     */
    LOCAL_AUDIO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2,
    /**
     * 3: The microphone is in use.
     */
    LOCAL_AUDIO_STREAM_ERROR_DEVICE_BUSY = 3,
    /**
     * 4: The local audio recording fails. Check whether the recording device
     * is working properly.
     */
    LOCAL_AUDIO_STREAM_ERROR_RECORD_FAILURE = 4,
    /**
     * 5: The local audio encoding fails.
     */
    LOCAL_AUDIO_STREAM_ERROR_ENCODE_FAILURE = 5
  }
  /**
   * Audio recording qualities.
   */
  enum AUDIO_RECORDING_QUALITY_TYPE {
    /**
     * 0: Low quality. The sample rate is 32 kHz, and the file size is around
     * 1.2 MB after 10 minutes of recording.
     */
    AUDIO_RECORDING_QUALITY_LOW = 0,
    /**
     * 1: Medium quality. The sample rate is 32 kHz, and the file size is
     * around 2 MB after 10 minutes of recording.
     */
    AUDIO_RECORDING_QUALITY_MEDIUM = 1,
    /**
     * 2: High quality. The sample rate is 32 kHz, and the file size is
     * around 3.75 MB after 10 minutes of recording.
     */
    AUDIO_RECORDING_QUALITY_HIGH = 2
  }
  /**
   * Network quality types.
   */
  enum QUALITY_TYPE {
    /**
     * 0: The network quality is unknown.
     */
    QUALITY_UNKNOWN = 0,
    /**
     * 1: The network quality is excellent.
     */
    QUALITY_EXCELLENT = 1,
    /**
     * 2: The network quality is quite good, but the bitrate may be slightly lower than excellent.
     */
    QUALITY_GOOD = 2,
    /**
     * 3: Users can feel the communication slightly impaired.
     */
    QUALITY_POOR = 3,
    /**
     * 4: Users cannot communicate smoothly.
     */
    QUALITY_BAD = 4,
    /**
     * 5: The network is so bad that users can barely communicate.
     */
    QUALITY_VBAD = 5,
    /**
     * 6: The network is down and users cannot communicate at all.
     */
    QUALITY_DOWN = 6,
    /**
     * 7: Users cannot detect the network quality. (Not in use.)
     */
    QUALITY_UNSUPPORTED = 7,
    /**
     * 8: Detecting the network quality.
     */
    QUALITY_DETECTING = 8
  }
  /**
   * Video display modes.
   */
  enum RENDER_MODE_TYPE {
    /**
     * 1: Uniformly scale the video until it fills the visible boundaries (cropped). One dimension of the video may have
     * clipped contents.
     */
    RENDER_MODE_HIDDEN = 1,
    /**
     * 2: Uniformly scale the video until one of its dimension fits the boundary (zoomed to fit). Areas that are not filled due
     * to disparity in the aspect ratio are filled with black.
     */
    RENDER_MODE_FIT = 2,
    /**
     * @deprecated 3: This mode is deprecated.
     */
    RENDER_MODE_ADAPTIVE = 3,
    /**
     4: The fill mode. In this mode, the SDK stretches or zooms the video to fill the display window.
     */
    RENDER_MODE_FILL = 4
  }
  /**
   * Video mirror modes.
   */
  enum VIDEO_MIRROR_MODE_TYPE {
    /**
     * 0: (Default) The SDK enables the mirror mode.
     */
    VIDEO_MIRROR_MODE_AUTO = 0,
    /**
     * 1: Enable mirror mode.
     */
    VIDEO_MIRROR_MODE_ENABLED = 1,
    /**
     * 2: Disable mirror mode.
     */
    VIDEO_MIRROR_MODE_DISABLED = 2
  }
  /**
   * @deprecated Video profiles.
   */
  enum VIDEO_PROFILE_TYPE {
    /**
     * 0: 160 * 120, frame rate 15 fps, bitrate 65 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_120P = 0,
    /**
     * 2: 120 * 120, frame rate 15 fps, bitrate 50 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_120P_3 = 2,
    /**
     * 10: 320*180, frame rate 15 fps, bitrate 140 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_180P = 10,
    /**
     * 12: 180 * 180, frame rate 15 fps, bitrate 100 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_180P_3 = 12,
    /**
     * 13: 240 * 180, frame rate 15 fps, bitrate 120 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_180P_4 = 13,
    /**
     * 20: 320 * 240, frame rate 15 fps, bitrate 200 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_240P = 20,
    /**
     * 22: 240 * 240, frame rate 15 fps, bitrate 140 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_240P_3 = 22,
    /**
     * 23: 424 * 240, frame rate 15 fps, bitrate 220 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_240P_4 = 23,
    /**
     * 30: 640 * 360, frame rate 15 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P = 30,
    /**
     * 32: 360 * 360, frame rate 15 fps, bitrate 260 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_3 = 32,
    /**
     * 33: 640 * 360, frame rate 30 fps, bitrate 600 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_4 = 33,
    /**
     * 35: 360 * 360, frame rate 30 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_6 = 35,
    /**
     * 36: 480 * 360, frame rate 15 fps, bitrate 320 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_7 = 36,
    /**
     * 37: 480 * 360, frame rate 30 fps, bitrate 490 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_8 = 37,
    /**
     * 38: 640 * 360, frame rate 15 fps, bitrate 800 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_9 = 38,
    /**
     * 39: 640 * 360, frame rate 24 fps, bitrate 800 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_10 = 39,
    /**
     * 100: 640 * 360, frame rate 24 fps, bitrate 1000 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_LANDSCAPE_360P_11 = 100,
    /**
     * 40: 640 * 480, frame rate 15 fps, bitrate 500 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P = 40,
    /**
     * 42: 480 * 480, frame rate 15 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_3 = 42,
    /**
     * 43: 640 * 480, frame rate 30 fps, bitrate 750 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_4 = 43,
    /**
     * 45: 480 * 480, frame rate 30 fps, bitrate 600 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_6 = 45,
    /**
     * 47: 848 * 480, frame rate 15 fps, bitrate 610 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_8 = 47,
    /**
     * 48: 848 * 480, frame rate 30 fps, bitrate 930 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_9 = 48,
    /**
     * 49: 640 * 480, frame rate 10 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_480P_10 = 49,
    /**
     * 50: 1280 * 720, frame rate 15 fps, bitrate 1130 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_720P = 50,
    /**
     * 52: 1280 * 720, frame rate 30 fps, bitrate 1710 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_720P_3 = 52,
    /**
     * 54: 960 * 720, frame rate 15 fps, bitrate 910 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_720P_5 = 54,
    /**
     * 55: 960 * 720, frame rate 30 fps, bitrate 1380 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_720P_6 = 55,
    /**
     * 60: 1920 * 1080, frame rate 15 fps, bitrate 2080 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_1080P = 60,
    /**
     * 62: 1920 * 1080, frame rate 30 fps, bitrate 3150 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_1080P_3 = 62,
    /**
     * 64: 1920 * 1080, frame rate 60 fps, bitrate 4780 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_1080P_5 = 64,
    /**
     * 66: 2560 * 1440, frame rate 30 fps, bitrate 4850 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_1440P = 66,
    /**
     * 67: 2560 * 1440, frame rate 60 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_1440P_2 = 67,
    /**
     * 70: 3840 * 2160, frame rate 30 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_4K = 70,
    /**
     * 72: 3840 * 2160, frame rate 60 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_LANDSCAPE_4K_3 = 72,
    /**
     * 1000: 120 * 160, frame rate 15 fps, bitrate 65 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_120P = 1000,
    /**
     * 1002: 120 * 120, frame rate 15 fps, bitrate 50 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_120P_3 = 1002,
    /**
     * 1010: 180 * 320, frame rate 15 fps, bitrate 140 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_180P = 1010,
    /**
     * 1012: 180 * 180, frame rate 15 fps, bitrate 100 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_180P_3 = 1012,
    /**
     * 1013: 180 * 240, frame rate 15 fps, bitrate 120 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_180P_4 = 1013,
    /**
     * 1020: 240 * 320, frame rate 15 fps, bitrate 200 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_240P = 1020,
    /**
     * 1022: 240 * 240, frame rate 15 fps, bitrate 140 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_240P_3 = 1022,
    /**
     * 1023: 240 * 424, frame rate 15 fps, bitrate 220 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_240P_4 = 1023,
    /**
     * 1030: 360 * 640, frame rate 15 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P = 1030,
    /**
     * 1032: 360 * 360, frame rate 15 fps, bitrate 260 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P_3 = 1032,
    /**
     * 1033: 360 * 640, frame rate 30 fps, bitrate 600 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P_4 = 1033,
    /**
     * 1035: 360 * 360, frame rate 30 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P_6 = 1035,
    /**
     * 1036: 360 * 480, frame rate 15 fps, bitrate 320 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P_7 = 1036,
    /**
     * 1037: 360 * 480, frame rate 30 fps, bitrate 490 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_360P_8 = 1037,
    /**
     * 1038: 360 * 640, frame rate 15 fps, bitrate 800 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_PORTRAIT_360P_9 = 1038,
    /**
     * 1039: 360 * 640, frame rate 24 fps, bitrate 800 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_PORTRAIT_360P_10 = 1039,
    /**
     * 1100: 360 * 640, frame rate 24 fps, bitrate 1000 Kbps.
     * @note `LIVE_BROADCASTING` profile only.
     */
    VIDEO_PROFILE_PORTRAIT_360P_11 = 1100,
    /**
     * 1040: 480 * 640, frame rate 15 fps, bitrate 500 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P = 1040,
    /**
     * 1042: 480 * 480, frame rate 15 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_3 = 1042,
    /**
     * 1043: 480 * 640, frame rate 30 fps, bitrate 750 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_4 = 1043,
    /**
     * 1045: 480 * 480, frame rate 30 fps, bitrate 600 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_6 = 1045,
    /**
     * 1047: 480 * 848, frame rate 15 fps, bitrate 610 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_8 = 1047,
    /**
     * 1048: 480 * 848, frame rate 30 fps, bitrate 930 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_9 = 1048,
    /**
     * 1049: 480 * 640, frame rate 10 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_480P_10 = 1049,
    /**
     * 1050: 720 * 1280, frame rate 15 fps, bitrate 1130 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_720P = 1050,
    /**
     * 1052: 720 * 1280, frame rate 30 fps, bitrate 1710 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_720P_3 = 1052,
    /**
     * 1054: 720 * 960, frame rate 15 fps, bitrate 910 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_720P_5 = 1054,
    /**
     * 1055: 720 * 960, frame rate 30 fps, bitrate 1380 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_720P_6 = 1055,
    /**
     * 1060: 1080 * 1920, frame rate 15 fps, bitrate 2080 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_1080P = 1060,
    /**
     * 1062: 1080 * 1920, frame rate 30 fps, bitrate 3150 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_1080P_3 = 1062,
    /**
     * 1064: 1080 * 1920, frame rate 60 fps, bitrate 4780 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_1080P_5 = 1064,
    /**
     * 1066: 1440 * 2560, frame rate 30 fps, bitrate 4850 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_1440P = 1066,
    /**
     * 1067: 1440 * 2560, frame rate 60 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_1440P_2 = 1067,
    /**
     * 1070: 2160 * 3840, frame rate 30 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_4K = 1070,
    /**
     * 1072: 2160 * 3840, frame rate 60 fps, bitrate 6500 Kbps.
     */
    VIDEO_PROFILE_PORTRAIT_4K_3 = 1072,
    /**
     * Default 640 * 360, frame rate 15 fps, bitrate 400 Kbps.
     */
    VIDEO_PROFILE_DEFAULT = 30
  }
  /**
   * Audio profiles. Sets the sample rate, bitrate, encoding mode, and the number of channels.
   */
  enum AUDIO_PROFILE_TYPE {
    /**
     * 0: Default audio profile:
     * - For the interactive streaming profile: A sample rate of 48 KHz, music encoding, mono, and a bitrate of up to 64 Kbps.
     * - For the `COMMUNICATION` profile: A sample rate of 32 KHz, music encoding, mono, and a bitrate of up to 18 Kbps.
     */
    AUDIO_PROFILE_DEFAULT = 0,
    /**
     * 1: A sample rate of 32 KHz, audio encoding, mono, and a bitrate of up to 18 Kbps.
     */
    AUDIO_PROFILE_SPEECH_STANDARD = 1,
    /**
     * 2: A sample rate of 48 KHz, music encoding, mono, and a bitrate of up to 64 Kbps.
     */
    AUDIO_PROFILE_MUSIC_STANDARD = 2,
    /**
     * 3: A sample rate of 48 KHz, music encoding, stereo, and a bitrate of up to 80 Kbps.
     */
    AUDIO_PROFILE_MUSIC_STANDARD_STEREO = 3,
    /**
     * 4: A sample rate of 48 KHz, music encoding, mono, and a bitrate of up to 96 Kbps.
     */
    AUDIO_PROFILE_MUSIC_HIGH_QUALITY = 4,
    /**
     * 5: A sample rate of 48 KHz, music encoding, stereo, and a bitrate of up to 128 Kbps.
     */
    AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO = 5,
    /**
     * 6: A sample rate of 16 KHz, audio encoding, mono, and Acoustic Echo Cancellation (AES) enabled.
     */
    AUDIO_PROFILE_IOT = 6,
    /**
     * The number of elements in the enumeration.
     */
    AUDIO_PROFILE_NUM = 7
  }
  /**
   * Audio application scenarios.
   */
  enum AUDIO_SCENARIO_TYPE {
    /**
     * 0: Default audio scenario..
     */
    AUDIO_SCENARIO_DEFAULT = 0,
    /**
     * 1: Entertainment scenario where users need to frequently switch the user role.
     */
    AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT = 1,
    /**
     * 2: Education scenario where users want smoothness and stability.
     */
    AUDIO_SCENARIO_EDUCATION = 2,
    /**
     * 3: High-quality audio chatroom scenario where hosts mainly play music.
     */
    AUDIO_SCENARIO_GAME_STREAMING = 3,
    /**
     * 4: Showroom scenario where a single host wants high-quality audio.
     */
    AUDIO_SCENARIO_SHOWROOM = 4,
    /**
     * 5: Gaming scenario for group chat that only contains the human voice.
     */
    AUDIO_SCENARIO_CHATROOM_GAMING = 5,
    /**
     * 6: IoT (Internet of Things) scenario where users use IoT devices with low power consumption.
     */
    AUDIO_SCENARIO_IOT = 6,
    /**
     * The number of elements in the enumeration.
     */
    AUDIO_SCENARIO_NUM = 7
  }
  /**
   * The channel profile.
   */
  enum CHANNEL_PROFILE_TYPE {
    /**
     * (Default) Communication. This profile applies to scenarios such as an audio call or video call,
     * where all users can publish and subscribe to streams.
     */
    CHANNEL_PROFILE_COMMUNICATION = 0,
    /**
     * Live streaming. In this profile, uses have roles, namely, host and audience (default).
     *
     * A host both publishes and subscribes to streams, while an audience subscribes to streams only.
     * This profile applies to scenarios such as a chat room or interactive video streaming.
     */
    CHANNEL_PROFILE_LIVE_BROADCASTING = 1,
    /**
     * 2: Agora recommends not using this profile.
     */
    CHANNEL_PROFILE_GAME = 2
  }
  /**
   * Client roles in the live interactive streaming.
   */
  enum CLIENT_ROLE_TYPE {
    /**
     * 1: Host. A host can both send and receive streams.
     */
    CLIENT_ROLE_BROADCASTER = 1,
    /**
     * 2: Audience, the default role. An audience can only receive streams.
     */
    CLIENT_ROLE_AUDIENCE = 2
  }
  /**
   * The latency level of an audience member in a live interactive streaming.
   *
   * @note Takes effect only when the user role is `CLIENT_ROLE_BROADCASTER`.
   */
  enum AUDIENCE_LATENCY_LEVEL_TYPE {
    /**
     * 1: Low latency.
     */
    AUDIENCE_LATENCY_LEVEL_LOW_LATENCY = 1,
    /**
     * 2: (Default) Ultra low latency.
     */
    AUDIENCE_LATENCY_LEVEL_ULTRA_LOW_LATENCY = 2
  }
  /**
   * The reason why the super-resolution algorithm is not successfully enabled.
   */
  enum SUPER_RESOLUTION_STATE_REASON {
    /**
     * 0: The super-resolution algorithm is successfully enabled.
     */
    SR_STATE_REASON_SUCCESS = 0,
    /**
     * 1: The origin resolution of the remote video is beyond the range where
     * the super-resolution algorithm can be applied.
     */
    SR_STATE_REASON_STREAM_OVER_LIMITATION = 1,
    /**
     * 2: Another user is already using the super-resolution algorithm.
     */
    SR_STATE_REASON_USER_COUNT_OVER_LIMITATION = 2,
    /**
     * 3: The device does not support the super-resolution algorithm.
     */
    SR_STATE_REASON_DEVICE_NOT_SUPPORTED = 3
  }
  /**
   * Reasons for a user being offline.
   */
  enum USER_OFFLINE_REASON_TYPE {
    /**
     * 0: The user quits the call.
     */
    USER_OFFLINE_QUIT = 0,
    /**
     * 1: The SDK times out and the user drops offline because no data packet is received within a certain period of time. If
     * the user quits the call and the message is not passed to the SDK (due to an unreliable channel), the SDK assumes the user
     * dropped offline.
     */
    USER_OFFLINE_DROPPED = 1,
    /**
     * 2: (`LIVE_BROADCASTING` only.) The client role switched from the host to the audience. */
    USER_OFFLINE_BECOME_AUDIENCE = 2
  }
  /**
   * States of the RTMP streaming.
   */
  enum RTMP_STREAM_PUBLISH_STATE {
    /**
     * The RTMP streaming has not started or has ended. This state is also triggered after you remove an RTMP address from
     * the CDN by calling [removePublishStreamUrl]{@link AgoraRtcEngine.removePublishStreamUrl}.
     */
    RTMP_STREAM_PUBLISH_STATE_IDLE = 0,
    /**
     * The SDK is connecting to Agora streaming server and the RTMP server. This state is triggered after you call the
     * [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method.
     */
    RTMP_STREAM_PUBLISH_STATE_CONNECTING = 1,
    /**
     * The RTMP streaming publishes. The SDK successfully publishes the RTMP streaming and returns this state.
     */
    RTMP_STREAM_PUBLISH_STATE_RUNNING = 2,
    /**
     * The RTMP streaming is recovering. When exceptions occur to the CDN, or the streaming is interrupted, the SDK tries to resume
     * RTMP streaming and returns this state.
     * - If the SDK successfully resumes the streaming, `RTMP_STREAM_PUBLISH_STATE_RUNNING(2)` returns.
     * - If the streaming does not resume within 60 seconds or server errors occur,
     * [RTMP_STREAM_PUBLISH_STATE_FAILURE]{@link AgoraRtcEngine.RTMP_STREAM_PUBLISH_STATE.RTMP_STREAM_PUBLISH_STATE_FAILURE}(4) returns.
     * You can also reconnect to the server by calling the [removePublishStreamUrl]{@link AgoraRtcEngine.removePublishStreamUrl} and
     * [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} methods.
     */
    RTMP_STREAM_PUBLISH_STATE_RECOVERING = 3,
    /**
     * The RTMP streaming fails. See the `errCode` parameter for the detailed error information. You can also call the
     * [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method to publish the RTMP streaming again.
     */
    RTMP_STREAM_PUBLISH_STATE_FAILURE = 4
  }
  /**
   * Error codes of the RTMP streaming.
   */
  enum RTMP_STREAM_PUBLISH_ERROR {
    /**
     * The RTMP streaming publishes successfully.
     */
    RTMP_STREAM_PUBLISH_ERROR_OK = 0,
    /**
     * Invalid argument used. If, for example, you do not call the [setLiveTranscoding]{@link AgoraRtcEngine.setLiveTranscoding} method to
     * configure the [LiveTranscoding]{@link AgoraRtcEngine.LiveTranscoding} parameters before calling the
     * [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method, the SDK returns this error. Check whether you set the
     * parameters in the *setLiveTranscoding* method properly.
     */
    RTMP_STREAM_PUBLISH_ERROR_INVALID_ARGUMENT = 1,
    /**
     * The RTMP streaming is encrypted and cannot be published.
     */
    RTMP_STREAM_PUBLISH_ERROR_ENCRYPTED_STREAM_NOT_ALLOWED = 2,
    /**
     * Timeout for the RTMP streaming. Call the [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method to publish
     * the streaming again.
     */
    RTMP_STREAM_PUBLISH_ERROR_CONNECTION_TIMEOUT = 3,
    /**
     * An error occurs in Agora's streaming server. Call the [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl} method to
     * publish the streaming again.
     */
    RTMP_STREAM_PUBLISH_ERROR_INTERNAL_SERVER_ERROR = 4,
    /**
     * An error occurs in the RTMP server.
     */
    RTMP_STREAM_PUBLISH_ERROR_RTMP_SERVER_ERROR = 5,
    /**
     * The RTMP streaming publishes too frequently.
     */
    RTMP_STREAM_PUBLISH_ERROR_TOO_OFTEN = 6,
    /**
     * The host publishes more than 10 URLs. Delete the unnecessary URLs before adding new ones.
     */
    RTMP_STREAM_PUBLISH_ERROR_REACH_LIMIT = 7,
    /**
     * The host manipulates other hosts' URLs. Check your app logic.
     */
    RTMP_STREAM_PUBLISH_ERROR_NOT_AUTHORIZED = 8,
    /**
     * Agora's server fails to find the RTMP streaming.
     */
    RTMP_STREAM_PUBLISH_ERROR_STREAM_NOT_FOUND = 9,
    /**
     * The format of the RTMP streaming URL is not supported. Check whether the URL format is correct.
     */
    RTMP_STREAM_PUBLISH_ERROR_FORMAT_NOT_SUPPORTED = 10
  }
  /**
   * Events during the RTMP streaming.
   */
  enum RTMP_STREAMING_EVENT {
    /**
     * An error occurs when you add a background image or a watermark image to the RTMP stream.
     */
    RTMP_STREAMING_EVENT_FAILED_LOAD_IMAGE = 1
  }
  /**
   * States of importing an external media stream in the live interactive streaming.
   */
  enum INJECT_STREAM_STATUS {
    /**
     * 0: The external media stream imported successfully.
     */
    INJECT_STREAM_STATUS_START_SUCCESS = 0,
    /**
     * 1: The external media stream already exists.
     */
    INJECT_STREAM_STATUS_START_ALREADY_EXISTS = 1,
    /**
     * 2: The external media stream to be imported is unauthorized.
     */
    INJECT_STREAM_STATUS_START_UNAUTHORIZED = 2,
    /**
     * 3: Import external media stream timeout.
     */
    INJECT_STREAM_STATUS_START_TIMEDOUT = 3,
    /**
     * 4: Import external media stream failed.
     */
    INJECT_STREAM_STATUS_START_FAILED = 4,
    /**
     * 5: The external media stream stopped importing successfully.
     */
    INJECT_STREAM_STATUS_STOP_SUCCESS = 5,
    /**
     * 6: No external media stream is found.
     */
    INJECT_STREAM_STATUS_STOP_NOT_FOUND = 6,
    /**
     * 7: The external media stream to be stopped importing is unauthorized.
     */
    INJECT_STREAM_STATUS_STOP_UNAUTHORIZED = 7,
    /**
     * 8: Stop importing external media stream timeout.
     */
    INJECT_STREAM_STATUS_STOP_TIMEDOUT = 8,
    /**
     * 9: Stop importing external media stream failed.
     */
    INJECT_STREAM_STATUS_STOP_FAILED = 9,
    /**
     * 10: The external media stream is corrupted.
     */
    INJECT_STREAM_STATUS_BROKEN = 10
  }
  /**
   * Remote video stream types.
   */
  enum REMOTE_VIDEO_STREAM_TYPE {
    /**
     * 0: High-stream video.
     */
    REMOTE_VIDEO_STREAM_HIGH = 0,
    /**
     * 1: Low-stream video.
     */
    REMOTE_VIDEO_STREAM_LOW = 1
  }
  /**
   * The use mode of the audio data in the [onRecordAudioFrame]{@link AgoraRtcEngine.onRecordAudioFrame} or
   * [onPlaybackAudioFrame]{@link AgoraRtcEngine.onPlaybackAudioFrame} callback.
   */
  enum RAW_AUDIO_FRAME_OP_MODE_TYPE {
    /**
     * 0: Read-only mode: Users only read the [AudioFrame]{@link AgoraRtcEngine.AudioFrame} data without modifying anything. For example,
     * when users acquire the data with the Agora SDK, then push the RTMP streams.
     */
    RAW_AUDIO_FRAME_OP_MODE_READ_ONLY = 0,
    /**
     * 1: Write-only mode: Users replace the [AudioFrame]{@link AgoraRtcEngine.AudioFrame} data with their own data and pass the data to
     * the SDK for encoding. For example, when users acquire the data.
     */
    RAW_AUDIO_FRAME_OP_MODE_WRITE_ONLY = 1,
    /**
     * 2: Read and write mode: Users read the data from [AudioFrame]{@link AgoraRtcEngine.AudioFrame} , modify it, and then play it.
     * For example, when users have their own sound-effect processing module and perform some voice pre-processing, such as
     * a voice change.
     */
    RAW_AUDIO_FRAME_OP_MODE_READ_WRITE = 2
  }
  /**
   * Audio-sample rates.
   */
  enum AUDIO_SAMPLE_RATE_TYPE {
    /**
     * 32000: 32 kHz
     */
    AUDIO_SAMPLE_RATE_32000 = 32000,
    /**
     * 44100: 44.1 kHz
     */
    AUDIO_SAMPLE_RATE_44100 = 44100,
    /**
     * 48000: 48 kHz
     */
    AUDIO_SAMPLE_RATE_48000 = 48000
  }
  /**
   * Video codec profile types.
   */
  enum VIDEO_CODEC_PROFILE_TYPE {
    /**
     * 66: Baseline video codec profile. Generally used in video calls on mobile phones.
     */
    VIDEO_CODEC_PROFILE_BASELINE = 66,
    /**
     * 77: Main video codec profile. Generally used in mainstream electronics such as MP4 players, portable video players,
     * PSP, and iPads.
     */
    VIDEO_CODEC_PROFILE_MAIN = 77,
    /**
     * 100: (Default) High video codec profile. Generally used in high-resolution live streaming or television.
     */
    VIDEO_CODEC_PROFILE_HIGH = 100
  }
  /**
   * Video codec types
   */
  enum VIDEO_CODEC_TYPE {
    /**
     * Standard VP8
     */
    VIDEO_CODEC_VP8 = 1,
    /**
     * Standard H264
     */
    VIDEO_CODEC_H264 = 2,
    /**
     * Enhanced VP8
     */
    VIDEO_CODEC_EVP = 3,
    /**
     * Enhanced H264
     */
    VIDEO_CODEC_E264 = 4
  }
  /**
   * Video Codec types for publishing streams.
   */
  enum VIDEO_CODEC_TYPE_FOR_STREAM {
    VIDEO_CODEC_H264_FOR_STREAM = 1,
    VIDEO_CODEC_H265_FOR_STREAM = 2
  }
  /**
   * Audio equalization band frequencies.
   */
  enum AUDIO_EQUALIZATION_BAND_FREQUENCY {
    /**
     * 0: 31 Hz
     */
    AUDIO_EQUALIZATION_BAND_31 = 0,
    /**
     * 1: 62 Hz
     */
    AUDIO_EQUALIZATION_BAND_62 = 1,
    /**
     * 2: 125 Hz
     */
    AUDIO_EQUALIZATION_BAND_125 = 2,
    /**
     * 3: 250 Hz
     */
    AUDIO_EQUALIZATION_BAND_250 = 3,
    /**
     * 4: 500 Hz
     */
    AUDIO_EQUALIZATION_BAND_500 = 4,
    /**
     * 5: 1 kHz
     */
    AUDIO_EQUALIZATION_BAND_1K = 5,
    /**
     * 6: 2 kHz
     */
    AUDIO_EQUALIZATION_BAND_2K = 6,
    /**
     * 7: 4 kHz
     */
    AUDIO_EQUALIZATION_BAND_4K = 7,
    /**
     * 8: 8 kHz
     */
    AUDIO_EQUALIZATION_BAND_8K = 8,
    /**
     * 9: 16 kHz
     */
    AUDIO_EQUALIZATION_BAND_16K = 9
  }
  /**
   * Audio reverberation types.
   */
  enum AUDIO_REVERB_TYPE {
    /**
     * 0: The level of the dry signal (db). The value is between -20 and 10.
     */
    AUDIO_REVERB_DRY_LEVEL = 0,
    /**
     * 1: The level of the early reflection signal (wet signal) (dB). The value is between -20 and 10.
     */
    AUDIO_REVERB_WET_LEVEL = 1,
    /**
     * 2: The room size of the reflection. The value is between 0 and 100.
     */
    AUDIO_REVERB_ROOM_SIZE = 2,
    /**
     * 3: The length of the initial delay of the wet signal (ms). The value is between 0 and 200.
     */
    AUDIO_REVERB_WET_DELAY = 3,
    /**
     * 4: The reverberation strength. The value is between 0 and 100.
     */
    AUDIO_REVERB_STRENGTH = 4
  }
  /**
   * Local voice changer options.
   */
  enum VOICE_CHANGER_PRESET {
    /**
     * The original voice (no local voice change).
     */
    VOICE_CHANGER_OFF = 0,
    /**
     * The voice of an old man.
     */
    VOICE_CHANGER_OLDMAN = 1,
    /**
     * The voice of a little boy.
     */
    VOICE_CHANGER_BABYBOY = 2,
    /**
     * The voice of a little girl.
     */
    VOICE_CHANGER_BABYGIRL = 3,
    /**
     * The voice of Zhu Bajie, a character in Journey to the West who has a voice like that of a growling bear.
     */
    VOICE_CHANGER_ZHUBAJIE = 4,
    /**
     * The ethereal voice.
     */
    VOICE_CHANGER_ETHEREAL = 5,
    /**
     * The voice of Hulk.
     */
    VOICE_CHANGER_HULK = 6,
    /**
     * A more vigorous voice.
     */
    VOICE_BEAUTY_VIGOROUS = 1048577,
    /**
     * A deeper voice.
     */
    VOICE_BEAUTY_DEEP = 1048578,
    /**
     * A mellower voice.
     */
    VOICE_BEAUTY_MELLOW = 1048579,
    /**
     * Falsetto.
     */
    VOICE_BEAUTY_FALSETTO = 1048580,
    /**
     * A fuller voice.
     */
    VOICE_BEAUTY_FULL = 1048581,
    /**
     * A clearer voice.
     */
    VOICE_BEAUTY_CLEAR = 1048582,
    /**
     * A more resounding voice.
     */
    VOICE_BEAUTY_RESOUNDING = 1048583,
    /**
     * A more ringing voice.
     */
    VOICE_BEAUTY_RINGING = 1048584,
    /**
     * A more spatially resonant voice.
     */
    VOICE_BEAUTY_SPACIAL = 1048585,
    /**
     * (For male only) A more magnetic voice. Do not use it when the speaker is a female; otherwise, voice distortion occurs.
     */
    GENERAL_BEAUTY_VOICE_MALE_MAGNETIC = 2097153,
    /**
     * (For female only) A fresher voice. Do not use it when the speaker is a male; otherwise, voice distortion occurs.
     */
    GENERAL_BEAUTY_VOICE_FEMALE_FRESH = 2097154,
    /**
     * (For female only) A more vital voice. Do not use it when the speaker is a male; otherwise, voice distortion occurs.
     */
    GENERAL_BEAUTY_VOICE_FEMALE_VITALITY = 2097155
  }
  /**
   * Local voice reverberation presets.
   */
  enum AUDIO_REVERB_PRESET {
    /**
     * Turn off local voice reverberation, that is, to use the original voice.
     */
    AUDIO_REVERB_OFF = 0,
    /**
     * The reverberation style typical of a KTV venue (enhanced).
     */
    AUDIO_REVERB_FX_KTV = 1048577,
    /**
     * The reverberation style typical of a concert hall (enhanced).
     */
    AUDIO_REVERB_FX_VOCAL_CONCERT = 1048578,
    /**
     * The reverberation style typical of an uncle's voice.
     */
    AUDIO_REVERB_FX_UNCLE = 1048579,
    /**
     * The reverberation style typical of a little sister's voice.
     */
    AUDIO_REVERB_FX_SISTER = 1048580,
    /**
     * The reverberation style typical of a recording studio (enhanced).
     */
    AUDIO_REVERB_FX_STUDIO = 1048581,
    /**
     * The reverberation style typical of popular music (enhanced).
     */
    AUDIO_REVERB_FX_POPULAR = 1048582,
    /**
     * The reverberation style typical of R&B music (enhanced).
     */
    AUDIO_REVERB_FX_RNB = 1048583,
    /**
     * The reverberation style typical of the vintage phonograph.
     */
    AUDIO_REVERB_FX_PHONOGRAPH = 1048584,
    /**
     * The reverberation style typical of popular music.
     */
    AUDIO_REVERB_POPULAR = 1,
    /**
     * The reverberation style typical of R&B music.
     */
    AUDIO_REVERB_RNB = 2,
    /**
     * The reverberation style typical of rock music.
     */
    AUDIO_REVERB_ROCK = 3,
    /**
     * The reverberation style typical of hip-hop music.
     */
    AUDIO_REVERB_HIPHOP = 4,
    /**
     * The reverberation style typical of a concert hall.
     */
    AUDIO_REVERB_VOCAL_CONCERT = 5,
    /**
     * The reverberation style typical of a KTV venue.
     */
    AUDIO_REVERB_KTV = 6,
    /**
     * The reverberation style typical of a recording studio.
     */
    AUDIO_REVERB_STUDIO = 7,
    /**
     * The reverberation of the virtual stereo. The virtual stereo is an effect that renders the monophonic
     * audio as the stereo audio, so that all users in the channel can hear the stereo voice effect.
     * To achieve better virtual stereo reverberation, Agora recommends setting `profile` in
     * [setAudioProfile]{@link AgoraRtcEngine.setAudioProfile} as `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`.
     */
    AUDIO_VIRTUAL_STEREO = 2097153
  }
  /**
   * The options for SDK preset voice beautifier effects.
   */
  enum VOICE_BEAUTIFIER_PRESET {
    /**
     * Turn off voice beautifier effects and use the original voice.
     */
    VOICE_BEAUTIFIER_OFF = 0,
    /**
     * A more magnetic voice.
     *
     * @note Agora recommends using this enumerator to process a male-sounding voice; otherwise, you may experience vocal distortion.
     */
    CHAT_BEAUTIFIER_MAGNETIC = 16843008,
    /**
     * A fresher voice.
     *
     * @note Agora recommends using this enumerator to process a female-sounding voice; otherwise, you may experience vocal distortion.
     */
    CHAT_BEAUTIFIER_FRESH = 16843264,
    /**
     * A more vital voice.
     *
     * @note Agora recommends using this enumerator to process a female-sounding voice; otherwise, you may experience vocal distortion.
     */
    CHAT_BEAUTIFIER_VITALITY = 16843520,
    /**
     * A more vigorous voice.
     */
    TIMBRE_TRANSFORMATION_VIGOROUS = 16974080,
    /**
     * A deeper voice.
     */
    TIMBRE_TRANSFORMATION_DEEP = 16974336,
    /**
     * A mellower voice.
     */
    TIMBRE_TRANSFORMATION_MELLOW = 16974592,
    /**
     * A falsetto voice.
     */
    TIMBRE_TRANSFORMATION_FALSETTO = 16974848,
    /**
     * A falsetto voice.
     */
    TIMBRE_TRANSFORMATION_FULL = 16975104,
    /**
     * A clearer voice.
     */
    TIMBRE_TRANSFORMATION_CLEAR = 16975360,
    /**
     * A more resounding voice.
     */
    TIMBRE_TRANSFORMATION_RESOUNDING = 16975616,
    /**
     * A more ringing voice.
     */
    TIMBRE_TRANSFORMATION_RINGING = 16975872
  }
  /**
   * The options for SDK preset audio effects.
   */
  enum AUDIO_EFFECT_PRESET {
    /**
     * Turn off audio effects and use the original voice.
     */
    AUDIO_EFFECT_OFF = 0,
    /**
     * An audio effect typical of a KTV venue.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_KTV = 33620224,
    /**
     * An audio effect typical of a concert hall.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_VOCAL_CONCERT = 33620480,
    /**
     * An audio effect typical of a recording studio.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_STUDIO = 33620736,
    /**
     * An audio effect typical of a vintage phonograph.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_PHONOGRAPH = 33620992,
    /**
     * A virtual stereo effect that renders monophonic audio as stereo audio.
     *
     * @note Call \ref IRtcEngine::setAudioProfile "setAudioProfile" and set the `profile` parameter to
     * `AUDIO_PROFILE_MUSIC_STANDARD_STEREO(3)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before setting this
     * enumerator; otherwise, the enumerator setting does not take effect.
     */
    ROOM_ACOUSTICS_VIRTUAL_STEREO = 33621248,
    /**
     * A more spatial audio effect.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_SPACIAL = 33621504,
    /**
     * A more ethereal audio effect.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile"
     * and setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`
     * before setting this enumerator.
     */
    ROOM_ACOUSTICS_ETHEREAL = 33621760,
    /**
     * A 3D voice effect that makes the voice appear to be moving around the user. The default cycle period of the 3D
     * voice effect is 10 seconds. To change the cycle period, call \ref IRtcEngine::setAudioEffectParameters "setAudioEffectParameters"
     * after this method.
     *
     * @note
     * - Call \ref IRtcEngine::setAudioProfile "setAudioProfile" and set the `profile` parameter to `AUDIO_PROFILE_MUSIC_STANDARD_STEREO(3)`
     * or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before setting this enumerator; otherwise, the enumerator setting does not take effect.
     * - If the 3D voice effect is enabled, users need to use stereo audio playback devices to hear the anticipated voice effect.
     */
    ROOM_ACOUSTICS_3D_VOICE = 33622016,
    /**
     * The voice of an uncle.
     *
     * @note
     * - Agora recommends using this enumerator to process a male-sounding voice; otherwise, you may not hear the anticipated voice effect.
     * - To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_UNCLE = 33685760,
    /**
     * The voice of an old man.
     *
     * @note
     * - Agora recommends using this enumerator to process a male-sounding voice; otherwise, you may not hear the anticipated voice effect.
     * - To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and setting
     * the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before setting
     * this enumerator.
     */
    VOICE_CHANGER_EFFECT_OLDMAN = 33686016,
    /**
     * The voice of a boy.
     *
     * @note
     * - Agora recommends using this enumerator to process a male-sounding voice; otherwise, you may not hear the anticipated voice effect.
     * - To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and setting
     * the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_BOY = 33686272,
    /**
     * The voice of a young woman.
     *
     * @note
     * - Agora recommends using this enumerator to process a female-sounding voice; otherwise, you may not hear the anticipated voice effect.
     * - To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and setting
     * the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_SISTER = 33686528,
    /**
     * The voice of a girl.
     *
     * @note
     * - Agora recommends using this enumerator to process a female-sounding voice; otherwise, you may not hear the anticipated voice effect.
     * - To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and setting
     * the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_GIRL = 33686784,
    /**
     * The voice of Pig King, a character in Journey to the West who has a voice like a growling bear.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_PIGKING = 33687040,
    /**
     * The voice of Hulk.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    VOICE_CHANGER_EFFECT_HULK = 33687296,
    /**
     * An audio effect typical of R&B music.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    STYLE_TRANSFORMATION_RNB = 33751296,
    /**
     * An audio effect typical of popular music.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    STYLE_TRANSFORMATION_POPULAR = 33751552,
    /**
     * A pitch correction effect that corrects the user's pitch based on the pitch of the natural C major scale.
     * To change the basic mode and tonic pitch, call \ref IRtcEngine::setAudioEffectParameters "setAudioEffectParameters" after this method.
     *
     * @note To achieve better audio effect quality, Agora recommends calling \ref IRtcEngine::setAudioProfile "setAudioProfile" and
     * setting the `profile` parameter to `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)` before
     * setting this enumerator.
     */
    PITCH_CORRECTION = 33816832
  }
  /**
   * Audio codec profile types. The default value is LC_ACC.
   */
  enum AUDIO_CODEC_PROFILE_TYPE {
    /**
     * 0: LC-AAC, which is the low-complexity audio codec type.
     */
    AUDIO_CODEC_PROFILE_LC_AAC = 0,
    /**
     * 1: HE-AAC, which is the high-efficiency audio codec type.
     */
    AUDIO_CODEC_PROFILE_HE_AAC = 1
  }
  /**
   * Remote audio states.
   */
  enum REMOTE_AUDIO_STATE {
    /**
     * 0: The remote audio is in the default state, probably due to
     * [REMOTE_AUDIO_REASON_LOCAL_MUTED]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_LOCAL_MUTED}(3),
     * [REMOTE_AUDIO_REASON_REMOTE_MUTED]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_REMOTE_MUTED} (5), or
     * [REMOTE_AUDIO_REASON_REMOTE_OFFLINE]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_REMOTE_OFFLINE} (7).
     */
    REMOTE_AUDIO_STATE_STOPPED = 0,
    /**
     * 1: The first remote audio packet is received.
     */
    REMOTE_AUDIO_STATE_STARTING = 1,
    /**
     * 2: The remote audio stream is decoded and plays normally, probably
     * due to [REMOTE_AUDIO_REASON_NETWORK_RECOVERY]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_NETWORK_RECOVERY}(2),
     * [REMOTE_AUDIO_REASON_LOCAL_UNMUTED]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_LOCAL_UNMUTED}(4), or
     * [REMOTE_AUDIO_REASON_REMOTE_UNMUTED]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_REMOTE_UNMUTED}(6).
     */
    REMOTE_AUDIO_STATE_DECODING = 2,
    /**
     * 3: The remote audio is frozen, probably due to
     * [REMOTE_AUDIO_REASON_NETWORK_CONGESTION]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_NETWORK_CONGESTION}(1).
     */
    REMOTE_AUDIO_STATE_FROZEN = 3,
    /**
     * 4: The remote audio fails to start, probably due to
     * [REMOTE_AUDIO_REASON_INTERNAL]{@link AgoraRtcEngine.REMOTE_AUDIO_STATE_REASON.REMOTE_AUDIO_REASON_INTERNAL}(0).
     */
    REMOTE_AUDIO_STATE_FAILED = 4
  }
  /**
   * Remote audio state reasons.
   */
  enum REMOTE_AUDIO_STATE_REASON {
    /**
     * 0: Internal reasons.
     */
    REMOTE_AUDIO_REASON_INTERNAL = 0,
    /**
     * 1: Network congestion.
     */
    REMOTE_AUDIO_REASON_NETWORK_CONGESTION = 1,
    /**
     * 2: Network recovery.
     */
    REMOTE_AUDIO_REASON_NETWORK_RECOVERY = 2,
    /**
     * 3: The local user stops receiving the remote audio stream or
     * disables the audio module.
     */
    REMOTE_AUDIO_REASON_LOCAL_MUTED = 3,
    /**
     * 4: The local user resumes receiving the remote audio stream or
     * enables the audio module.
     */
    REMOTE_AUDIO_REASON_LOCAL_UNMUTED = 4,
    /**
     * 5: The remote user stops sending the audio stream or disables the
     * audio module.
     */
    REMOTE_AUDIO_REASON_REMOTE_MUTED = 5,
    /**
     * 6: The remote user resumes sending the audio stream or enables the
     * audio module.
     */
    REMOTE_AUDIO_REASON_REMOTE_UNMUTED = 6,
    /**
     * 7: The remote user leaves the channel.
     */
    REMOTE_AUDIO_REASON_REMOTE_OFFLINE = 7
  }
  /**
   * The state of the remote video.
   */
  enum REMOTE_VIDEO_STATE {
    /**
     * 0: The remote video is in the default state, probably due to
     * [REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED}(3),
     * [REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED}(5),
     * or [REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE}(7).
     */
    REMOTE_VIDEO_STATE_STOPPED = 0,
    /**
     * 1: The first remote video packet is received.
     */
    REMOTE_VIDEO_STATE_STARTING = 1,
    /**
     * 2: The remote video stream is decoded and plays normally, probably due to
     * [REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY}(2),
     * [REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED}(4),
     * [REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED}(6),
     * or [REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY} (9).
     */
    REMOTE_VIDEO_STATE_DECODING = 2,
    /**
     * 3: The remote video is frozen, probably due to
     * [REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION}(1)
     * or [REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK}(8).
     */
    REMOTE_VIDEO_STATE_FROZEN = 3,
    /**
     * 4: The remote video fails to start, probably due to
     * [REMOTE_VIDEO_STATE_REASON_INTERNAL]{@link AgoraRtcEngine.REMOTE_VIDEO_STATE_REASON.REMOTE_VIDEO_STATE_REASON_INTERNAL}(0).
     */
    REMOTE_VIDEO_STATE_FAILED = 4
  }
  /**
   * The publishing state.
   */
  enum STREAM_PUBLISH_STATE {
    /**
     * 0: The initial publishing state after joining the channel.
     */
    PUB_STATE_IDLE = 0,
    /**
     * 1: Fails to publish the local stream. Possible reasons:
     * - The local user calls [muteLocalAudioStream(true)]{@link AgoraRtcEngine.muteLocalAudioStream} or
     * [muteLocalVideoStream(true)]{@link AgoraRtcEngine.muteLocalVideoStream} to stop sending local streams.
     * - The local user calls [disableAudio]{@link AgoraRtcEngine.disableAudio} or [disableVideo]{@link AgoraRtcEngine.disableVideo} to
     * disable the entire audio or video module.
     * - The local user calls [enableLocalAudio(false)]{@link AgoraRtcEngine.enableLocalAudio} or
     * [enableLocalVideo(false)]{@link AgoraRtcEngine.enableLocalVideo} to disable the local audio sampling or video capturing.
     * - The role of the local user is `AUDIENCE`.
     */
    PUB_STATE_NO_PUBLISHED = 1,
    /**
     * 2: Publishing.
     */
    PUB_STATE_PUBLISHING = 2,
    /**
     * 3: Publishes successfully.
     */
    PUB_STATE_PUBLISHED = 3
  }
  /**
   * The subscribing state.
   */
  enum STREAM_SUBSCRIBE_STATE {
    /**
     * 0: The initial subscribing state after joining the channel.
     */
    SUB_STATE_IDLE = 0,
    /**
     * 1: Fails to subscribe to the remote stream. Possible reasons:
     * - The remote user:
     *   - Calls [muteLocalAudioStream(true)]{@link AgoraRtcEngine.muteLocalAudioStream} to stop sending local streams.
     *   - Calls [disableAudio]{@link AgoraRtcEngine.disableAudio} to disable the
     * entire audio modules.
     *   - Calls [enableLocalAudio(false)]{@link AgoraRtcEngine.enableLocalAudio}
     * to disable the local audio sampling.
     *   - The role of the remote user is `AUDIENCE`.
     * - The local user calls the following methods to stop receiving remote streams:
     * Calls [muteRemoteAudioStream(true)]{@link AgoraRtcEngine.muteRemoteAudioStream},
     * [muteAllRemoteAudioStreams(true)]{@link AgoraRtcEngine.muteAllRemoteAudioStreams} , or
     * [setDefaultMuteAllRemoteAudioStreams(true)]{@link AgoraRtcEngine.setDefaultMuteAllRemoteAudioStreams} to stop receiving remote
     * audio streams.
     */
    SUB_STATE_NO_SUBSCRIBED = 1,
    /**
     * 2: Subscribing.
     */
    SUB_STATE_SUBSCRIBING = 2,
    /**
     * 3: Subscribes to and receives the remote stream successfully.
     */
    SUB_STATE_SUBSCRIBED = 3
  }
  /**
   * The remote video frozen type.
   */
  enum XLA_REMOTE_VIDEO_FROZEN_TYPE {
    /**
     * 0: 500ms video frozen type.
     */
    XLA_REMOTE_VIDEO_FROZEN_500MS = 0,
    /**
     * 1: 200ms video frozen type.
     */
    XLA_REMOTE_VIDEO_FROZEN_200MS = 1,
    /**
     * 2: 600ms video frozen type.
     */
    XLA_REMOTE_VIDEO_FROZEN_600MS = 2,
    /**
     * 3: max video frozen type.
     */
    XLA_REMOTE_VIDEO_FROZEN_TYPE_MAX = 3
  }
  /**
   * The remote audio frozen type.
   */
  enum XLA_REMOTE_AUDIO_FROZEN_TYPE {
    /**
     * 0: 80ms audio frozen.
     */
    XLA_REMOTE_AUDIO_FROZEN_80MS = 0,
    /**
     * 1: 200ms audio frozen.
     */
    XLA_REMOTE_AUDIO_FROZEN_200MS = 1,
    /**
     * 2: max audio frozen type.
     */
    XLA_REMOTE_AUDIO_FROZEN_TYPE_MAX = 2
  }
  /**
   * The reason for the remote video state change.
   */
  enum REMOTE_VIDEO_STATE_REASON {
    /**
     * 0: Internal reasons.
     */
    REMOTE_VIDEO_STATE_REASON_INTERNAL = 0,
    /**
     * 1: Network congestion.
     */
    REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION = 1,
    /**
     * 2: Network recovery.
     */
    REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY = 2,
    /**
     * 3: The local user stops receiving the remote video stream or disables the video module.
     */
    REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED = 3,
    /**
     * 4: The local user resumes receiving the remote video stream or enables the video module.
     */
    REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED = 4,
    /**
     * 5: The remote user stops sending the video stream or disables the video module.
     */
    REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED = 5,
    /**
     * 6: The remote user resumes sending the video stream or enables the video module.
     */
    REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED = 6,
    /**
     * 7: The remote user leaves the channel.
     */
    REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE = 7,
    /**
     * 8: The remote audio-and-video stream falls back to the audio-only stream due to poor network conditions.
     */
    REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK = 8,
    /**
     * 9: The remote audio-only stream switches back to the audio-and-video stream after the network conditions improve.
     */
    REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY = 9
  }
  /**
   * Video frame rates.
   */
  enum FRAME_RATE {
    /**
     * 1: 1 fps
     */
    FRAME_RATE_FPS_1 = 1,
    /**
     * 7: 7 fps
     */
    FRAME_RATE_FPS_7 = 7,
    /**
     * 10: 10 fps
     */
    FRAME_RATE_FPS_10 = 10,
    /**
     * 15: 15 fps
     */
    FRAME_RATE_FPS_15 = 15,
    /**
     * 24: 24 fps
     */
    FRAME_RATE_FPS_24 = 24,
    /**
     * 30: 30 fps
     */
    FRAME_RATE_FPS_30 = 30,
    /** @ignore */
    FRAME_RATE_FPS_60 = 60
  }
  /**
   * Video output orientation modes.
   */
  enum ORIENTATION_MODE {
    /**
     * 0: (Default) Adaptive mode.
     *
     * The video encoder adapts to the orientation mode of the video input device.
     *
     * - If the width of the captured video from the SDK is greater than the height, the encoder sends the video in landscape mode.
     * The encoder also sends the rotational information of the video, and the receiver uses the rotational information to rotate
     * the received video.
     * - When you use a custom video source, the output video from the encoder inherits the orientation of the original video. If
     * the original video is in portrait mode, the output video from the encoder is also in portrait mode. The encoder also sends
     * the rotational information of the video to the receiver.
     */
    ORIENTATION_MODE_ADAPTIVE = 0,
    /**
     * 1: Landscape mode.
     *
     * The video encoder always sends the video in landscape mode. The video encoder rotates the original video before sending
     * it and the rotational information is 0. This mode applies to scenarios involving CDN live streaming.
     */
    ORIENTATION_MODE_FIXED_LANDSCAPE = 1,
    /**
     * 2: Portrait mode.
     *
     * The video encoder always sends the video in portrait mode. The video encoder rotates the original video before sending it
     * and the rotational information is 0. This mode applies to scenarios involving CDN live streaming.
     */
    ORIENTATION_MODE_FIXED_PORTRAIT = 2
  }
  /**
   * Video degradation preferences when the bandwidth is a constraint.
   */
  enum DEGRADATION_PREFERENCE {
    /**
     * 0: (Default) Degrade the frame rate in order to maintain the video quality.
     */
    MAINTAIN_QUALITY = 0,
    /**
     * 1: Degrade the video quality in order to maintain the frame rate.
     */
    MAINTAIN_FRAMERATE = 1,
    /**
     * 2: (For future use) Maintain a balance between the frame rate and video quality.
     */
    MAINTAIN_BALANCED = 2
  }
  /**
   * Stream fallback options.
   */
  enum STREAM_FALLBACK_OPTIONS {
    /**
     * 0: No fallback behavior for the local/remote video stream when the uplink/downlink network conditions are poor. The
     * quality of the stream is not guaranteed.
     */
    STREAM_FALLBACK_OPTION_DISABLED = 0,
    /**
     * 1: Under poor downlink network conditions, the remote video stream, to which you subscribe, falls back to the
     * low-stream (low resolution and low bitrate) video. You can set this option only in the
     * [setRemoteSubscribeFallbackOption]{@link AgoraRtcEngine.setRemoteSubscribeFallbackOption} method. Nothing happens when you set this
     * in the [setLocalPublishFallbackOption]{@link AgoraRtcEngine.setLocalPublishFallbackOption} method.
     */
    STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW = 1,
    /**
     * 2: Under poor uplink network conditions, the published video stream falls back to audio only.
     *
     * Under poor downlink network conditions, the remote video stream, to which you subscribe, first falls back to the
     * low-stream (low resolution and low bitrate) video; and then to an audio-only stream if the network conditions worsen.
     */
    STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2
  }
  /**
   * Camera capturer configuration.
   */
  enum CAPTURER_OUTPUT_PREFERENCE {
    /**
     * 0: (Default) self-adapts the camera output parameters to the system performance and network conditions to balance
     * CPU consumption and video preview quality.
     */
    CAPTURER_OUTPUT_PREFERENCE_AUTO = 0,
    /**
     * 1: Prioritizes the system performance. The SDK chooses the dimension and frame rate of the local camera capture
     * closest to those set by [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration}
     */
    CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1,
    /**
     * 2: Prioritizes the local preview quality. The SDK chooses higher camera output parameters to improve the local
     * video preview quality. This option requires extra CPU and RAM usage for video pre-processing.
     */
    CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2
  }
  /**
   * The priority of the remote user.
   */
  enum PRIORITY_TYPE {
    /**
     * 50: The user's priority is high.
     */
    PRIORITY_HIGH = 50,
    /**
     * 100: (Default) The user's priority is normal.
     */
    PRIORITY_NORMAL = 100
  }
  /**
   * Connection states.
   */
  enum CONNECTION_STATE_TYPE {
    /**
     * 1: The SDK is disconnected from Agora's edge server.
     * - This is the initial state before calling the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
     * - The SDK also enters this state when the application calls the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method.
     */
    CONNECTION_STATE_DISCONNECTED = 1,
    /**
     * 2: The SDK is connecting to Agora's edge server.
     * - When the application calls the [joinChannel]{@link AgoraRtcEngine.joinChannel} method, the SDK starts to establish a
     * connection to the specified channel, triggers the [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged}
     * callback, and switches to the `CONNECTION_STATE_CONNECTING` state.
     * - When the SDK successfully joins the channel, it triggers the `onConnectionStateChanged` callback and switches to the
     * [CONNECTION_STATE_CONNECTED]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE.CONNECTION_STATE_CONNECTED} state.
     * - After the SDK joins the channel and when it finishes initializing the media engine, the SDK triggers the
     * [onJoinChannelSuccess]{@link AgoraRtcEvents.onJoinChannelSuccess} callback.
     */
    CONNECTION_STATE_CONNECTING = 2,
    /**
     * 3: The SDK is connected to Agora's edge server and has joined a channel. You can now publish or subscribe to a media
     * stream in the channel.
     *
     * If the connection to the channel is lost because, for example, if the network is down or switched, the SDK automatically
     * tries to reconnect and triggers:
     * - The [onConnectionInterrupted]{@link AgoraRtcEvents.onConnectionInterrupted} callback (deprecated).
     * - The [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback and switches to the
     * [CONNECTION_STATE_RECONNECTING]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE.CONNECTION_STATE_RECONNECTING} state.
     */
    CONNECTION_STATE_CONNECTED = 3,
    /**
     * 4: The SDK keeps rejoining the channel after being disconnected from a joined channel because of network issues.
     *
     * - If the SDK cannot rejoin the channel within 10 seconds after being disconnected from Agora's edge server,
     * the SDK triggers the [onConnectionLost]{@link AgoraRtcEvents.onConnectionLost} callback, stays in the
     * [CONNECTION_STATE_RECONNECTING]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE.CONNECTION_STATE_RECONNECTING} state, and keeps
     * rejoining the channel.
     * - If the SDK fails to rejoin the channel 20 minutes after being disconnected from Agora's edge server, the SDK
     * triggers the [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callback, switches to the
     * [CONNECTION_STATE_FAILED]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE.CONNECTION_STATE_FAILED} state, and stops rejoining the channel.
     */
    CONNECTION_STATE_RECONNECTING = 4,
    /**
     * 5: The SDK fails to connect to Agora's edge server or join the channel.
     *
     * You must call the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method to leave this state, and call the
     * [joinChannel]{@link AgoraRtcEngine.joinChannel} method again to rejoin the channel.
     *
     * If the SDK is banned from joining the channel by Agora's edge server (through the RESTful API), the SDK triggers the
     * [onConnectionBanned]{@link AgoraRtcEvents.onConnectionBanned} (deprecated) and
     * [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} callbacks.
     */
    CONNECTION_STATE_FAILED = 5
  }
  /**
   * Reasons for a connection state change.
   */
  enum CONNECTION_CHANGED_REASON_TYPE {
    /**
     * 0: The SDK is connecting to Agora's edge server.
     */
    CONNECTION_CHANGED_CONNECTING = 0,
    /**
     * 1: The SDK has joined the channel successfully.
     */
    CONNECTION_CHANGED_JOIN_SUCCESS = 1,
    /**
     * 2: The connection between the SDK and Agora's edge server is interrupted.
     */
    CONNECTION_CHANGED_INTERRUPTED = 2,
    /**
     * 3: The connection between the SDK and Agora's edge server is banned by Agora's edge server.
     */
    CONNECTION_CHANGED_BANNED_BY_SERVER = 3,
    /**
     * 4: The SDK fails to join the channel for more than 20 minutes and stops reconnecting to the channel.
     */
    CONNECTION_CHANGED_JOIN_FAILED = 4,
    /**
     * 5: The SDK has left the channel.
     */
    CONNECTION_CHANGED_LEAVE_CHANNEL = 5,
    /**
     * 6: The connection failed since Appid is not valid.
     */
    CONNECTION_CHANGED_INVALID_APP_ID = 6,
    /**
     * 7: The connection failed since channel name is not valid.
     */
    CONNECTION_CHANGED_INVALID_CHANNEL_NAME = 7,
    /**
     * 8: The connection failed since token is not valid, possibly because:
     *
     * - The App Certificate for the project is enabled in Console, but you do not use Token when joining the channel.
     * If you enable the App Certificate, you must use a token to join the channel.
     * - The uid that you specify in the [joinChannel]{@link AgoraRtcEngine.joinChannel} method is different from the uid that
     * you pass for generating the token.
     */
    CONNECTION_CHANGED_INVALID_TOKEN = 8,
    /**
     * 9: The connection failed since token is expired.
     */
    CONNECTION_CHANGED_TOKEN_EXPIRED = 9,
    /**
     * 10: The connection is rejected by server.
     */
    CONNECTION_CHANGED_REJECTED_BY_SERVER = 10,
    /**
     * 11: The connection changed to reconnecting since SDK has set a proxy server.
     */
    CONNECTION_CHANGED_SETTING_PROXY_SERVER = 11,
    /**
     * 12: When SDK is in connection failed, the renew token operation will make it connecting.
     */
    CONNECTION_CHANGED_RENEW_TOKEN = 12,
    /**
     * 13: The IP Address of SDK client has changed. i.e., Network type or IP/Port changed by network operator might
     * change client IP address.
     */
    CONNECTION_CHANGED_CLIENT_IP_ADDRESS_CHANGED = 13,
    /**
     * 14: Timeout for the keep-alive of the connection between the SDK and Agora's edge server. The connection state
     * changes to [CONNECTION_STATE_RECONNECTING]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE.CONNECTION_STATE_RECONNECTING}.
     */
    CONNECTION_CHANGED_KEEP_ALIVE_TIMEOUT = 14
  }
  /**
   * Network type.
   */
  enum NETWORK_TYPE {
    /**
     * -1: The network type is unknown.
     */
    NETWORK_TYPE_UNKNOWN = -1,
    /**
     * 0: The SDK disconnects from the network.
     */
    NETWORK_TYPE_DISCONNECTED = 0,
    /**
     * 1: The network type is LAN.
     */
    NETWORK_TYPE_LAN = 1,
    /**
     * 2: The network type is Wi-Fi(including hotspots).
     */
    NETWORK_TYPE_WIFI = 2,
    /**
     * 3: The network type is mobile 2G.
     */
    NETWORK_TYPE_MOBILE_2G = 3,
    /**
     * 4: The network type is mobile 3G.
     */
    NETWORK_TYPE_MOBILE_3G = 4,
    /**
     * 5: The network type is mobile 4G.
     */
    NETWORK_TYPE_MOBILE_4G = 5
  }
  /**
   * States of the last-mile network probe test.
   */
  enum LASTMILE_PROBE_RESULT_STATE {
    /**
     * 1: The last-mile network probe test is complete.
     */
    LASTMILE_PROBE_RESULT_COMPLETE = 1,
    /**
     * 2: The last-mile network probe test is incomplete and the bandwidth estimation is not available, probably due to
     * limited test resources.
     */
    LASTMILE_PROBE_RESULT_INCOMPLETE_NO_BWE = 2,
    /**
     * 3: The last-mile network probe test is not carried out, probably due to poor network conditions.
     */
    LASTMILE_PROBE_RESULT_UNAVAILABLE = 3
  }
  /**
   * Audio output routing.
   */
  enum AUDIO_ROUTE_TYPE {
    /**
     * Default.
     */
    AUDIO_ROUTE_DEFAULT = -1,
    /**
     * Headset.
     */
    AUDIO_ROUTE_HEADSET = 0,
    /**
     * Earpiece.
     */
    AUDIO_ROUTE_EARPIECE = 1,
    /**
     * Headset with no microphone.
     */
    AUDIO_ROUTE_HEADSET_NO_MIC = 2,
    /**
     * Speakerphone.
     */
    AUDIO_ROUTE_SPEAKERPHONE = 3,
    /**
     * Loudspeaker.
     */
    AUDIO_ROUTE_LOUDSPEAKER = 4,
    /**
     * Bluetooth headset.
     */
    AUDIO_ROUTE_BLUETOOTH = 5,
    /**
     * USB peripheral.
     */
    AUDIO_ROUTE_USB = 6,
    /**
     * HDMI peripheral.
     */
    AUDIO_ROUTE_HDMI = 7,
    /**
     * DisplayPort peripheral.
     */
    AUDIO_ROUTE_DISPLAYPORT = 8,
    /**
     * Apple AirPlay.
     */
    AUDIO_ROUTE_AIRPLAY = 9
  }
  /**
   * Audio session restriction.
   */
  enum AUDIO_SESSION_OPERATION_RESTRICTION {
    /**
     * No restriction, the SDK has full control of the audio session operations.
     */
    AUDIO_SESSION_OPERATION_RESTRICTION_NONE = 0,
    /**
     * The SDK does not change the audio session category.
     */
    AUDIO_SESSION_OPERATION_RESTRICTION_SET_CATEGORY = 1,
    /**
     * The SDK does not change any setting of the audio session (category, mode, categoryOptions).
     */
    AUDIO_SESSION_OPERATION_RESTRICTION_CONFIGURE_SESSION = 2,
    /**
     * The SDK keeps the audio session active when leaving a channel.
     */
    AUDIO_SESSION_OPERATION_RESTRICTION_DEACTIVATE_SESSION = 4,
    /**
     * The SDK does not configure the audio session anymore.
     */
    AUDIO_SESSION_OPERATION_RESTRICTION_ALL = 128
  }
  /**
   * The direction of the camera.
   */
  enum CAMERA_DIRECTION {
    /**
     * The rear camera.
     */
    CAMERA_REAR = 0,
    /**
     * The front camera.
     */
    CAMERA_FRONT = 1
  }
  /**
   * The uplink or downlink last-mile network probe test result.
   */
  interface LastmileProbeOneWayResult {
    /**
     * The packet loss rate (%).
     */
    packetLossRate: number;
    /**
     * The network jitter (ms).
     */
    jitter: number;
    /**
     * The estimated available bandwidth (bps).
     */
    availableBandwidth: number;
  }
  /**
   * The uplink and downlink last-mile network probe test result.
   */
  interface LastmileProbeResult {
    /**
     * The state of the probe test. See [LASTMILE_PROBE_RESULT_STATE]{@link AgoraRtcEngine.LASTMILE_PROBE_RESULT_STATE}.
     */
    state: LASTMILE_PROBE_RESULT_STATE;
    /**
     * The uplink last-mile network probe test result. See [LastmileProbeOneWayResult]{@link AgoraRtcEngine.LastmileProbeOneWayResult}.
     */
    uplinkReport: LastmileProbeOneWayResult;
    /**
     * The downlink last-mile network probe test result. See [LastmileProbeOneWayResult]{@link AgoraRtcEngine.LastmileProbeOneWayResult}.
     */
    downlinkReport: LastmileProbeOneWayResult;
    /**
     * The round-trip delay time (ms).
     */
    rtt: number;
  }
  /**
   * Configurations of the last-mile network probe test.
   */
  interface LastmileProbeConfig {
    /**
     * Sets whether or not to test the uplink network. Some users, for example, the audience in a `LIVE_BROADCASTING` channel,
     * do not need such a test:
     * - true: test.
     * - false: do not test.
     */
    probeUplink: boolean;
    /**
     * Sets whether or not to test the downlink network:
     * - true: test.
     * - false: do not test.
     */
    probeDownlink: boolean;
    /**
     * The expected maximum sending bitrate (bps) of the local user. The value ranges between 100000 and 5000000.
     *
     * We recommend setting this parameter according to the bitrate value set by
     * [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration} .
     */
    expectedUplinkBitrate: number;
    /**
     * The expected maximum receiving bitrate (bps) of the local user. The value ranges between 100000 and 5000000.
     */
    expectedDownlinkBitrate: number;
  }
  /**
   * Properties of the audio volume information.
   *
   * An array containing the user ID and volume information for each speaker.
   */
  interface AudioVolumeInfo {
    /**
     * The user ID.
     * - In the local user's callback, `uid` = 0.
     * - In the remote users' callback, `uid` is the ID of a remote user whose instantaneous volume is one of the three highest.
     */
    uid: number;
    /**
     * The volume of each user after audio mixing. The value ranges between 0 (lowest volume) and 255 (highest volume).
     * In the local user's callback, `volume` = `totalVolume`.
     */
    volume: number;
    /**
     * Voice activity status of the local user.
     * - 0: The local user is not speaking.
     * - 1: The local user is speaking.
     *
     * **Note**
     *
     * - The `vad` parameter cannot report the voice activity status of remote users. In the remote users' callback, `vad` is
     * always 0.
     * - To use this parameter, you must set the `report_vad` parameter to `true` when calling
     * [enableAudioVolumeIndication]{@link AgoraRtcEngine.enableAudioVolumeIndication}.
     */
    vad: number;
    /**
     * The channel name the user is in.
     */
    channelId: string;
  }
  /**
   * The detailed options of a user.
   */
  class ClientRoleOptions {
    audienceLatencyLevel: AUDIENCE_LATENCY_LEVEL_TYPE;
    constructor(audienceLatencyLevel: AUDIENCE_LATENCY_LEVEL_TYPE);
  }
  /**
   * Statistics of the channel.
   */
  interface RtcStats {
    /**
     * Call duration (s), represented by an aggregate value.
     */
    duration: number;
    /**
     * Total number of bytes transmitted, represented by an aggregate value.
     */
    txBytes: number;
    /**
     * Total number of bytes received, represented by an aggregate value.
     */
    rxBytes: number;
    /**
     * Total number of audio bytes sent (bytes), represented
     * by an aggregate value.
     */
    txAudioBytes: number;
    /**
     * Total number of video bytes sent (bytes), represented
     * by an aggregate value.
     */
    txVideoBytes: number;
    /**
     * Total number of audio bytes received (bytes) before
     * network countermeasures, represented by an aggregate value.
     */
    rxAudioBytes: number;
    /**
     * Total number of video bytes received (bytes),
     * represented by an aggregate value.
     */
    rxVideoBytes: number;
    /**
     * Transmission bitrate (Kbps), represented by an instantaneous value.
     */
    txKBitRate: number;
    /**
     * Receive bitrate (Kbps), represented by an instantaneous value.
     */
    rxKBitRate: number;
    /**
     * Audio receive bitrate (Kbps), represented by an instantaneous value.
     */
    rxAudioKBitRate: number;
    /**
     * Audio transmission bitrate (Kbps), represented by an instantaneous value.
     */
    txAudioKBitRate: number;
    /**
     * Video receive bitrate (Kbps), represented by an instantaneous value.
     */
    rxVideoKBitRate: number;
    /**
     * Video transmission bitrate (Kbps), represented by an instantaneous value.
     */
    txVideoKBitRate: number;
    /**
     * Client-server latency (ms)
     */
    lastmileDelay: number;
    /**
     * The packet loss rate (%) from the local client to Agora's edge server,
     * before using the anti-packet-loss method.
     */
    txPacketLossRate: number;
    /**
     * The packet loss rate (%) from Agora's edge server to the local client,
     * before using the anti-packet-loss method.
     */
    rxPacketLossRate: number;
    /**
     * Number of users in the channel.
     * - `COMMUNICATION` profile: The number of users in the channel.
     * - `LIVE_BROADCASTING` profile:
     *   -  If the local user is an audience: The number of users in the channel = The number of hosts in the channel + 1.
     *   -  If the user is a host: The number of users in the channel = The number of hosts in the channel.
     */
    userCount: number;
    /**
     * Application CPU usage (%).
     */
    cpuAppUsage: number;
    /**
     * System CPU usage (%).
     *
     * In the multi-kernel environment, this member represents the average CPU usage.
     * The value **=** 100 **-** System Idle Progress in Task Manager (%).
     */
    cpuTotalUsage: number;
    /**
     * The round-trip time delay from the client to the local router.
     *
     * @note (iOS only) Since v3.1.2, this parameter is disabled by default. See
     * [FAQ](https://docs.AgoraRtcEngine.io/en/faq/local_network_privacy) for details. If you need to enable this parameter,
     * contact [support@AgoraRtcEngine.io](mailto:support@AgoraRtcEngine.io).
     */
    gatewayRtt: number;
    /**
     * The memory usage ratio of the app (%).
     *
     * @note This value is for reference only. Due to system limitations, you may not get the value of this member.
     */
    memoryAppUsageRatio: number;
    /**
     * The memory usage ratio of the system (%).
     *
     * @note This value is for reference only. Due to system limitations, you may not get the value of this member.
     */
    memoryTotalUsageRatio: number;
    /**
     * The memory usage of the app (KB).
     *
     * @note This value is for reference only. Due to system limitations, you may not get the value of this member.
     */
    memoryAppUsageInKbytes: number;
  }
  /**
   * Quality change of the local video in terms of target frame rate and target bit rate since last count.
   */
  enum QUALITY_ADAPT_INDICATION {
    /**
     * The quality of the local video stays the same.
     */
    ADAPT_NONE = 0,
    /**
     * The quality improves because the network bandwidth increases.
     */
    ADAPT_UP_BANDWIDTH = 1,
    /**
     * The quality worsens because the network bandwidth decreases.
     */
    ADAPT_DOWN_BANDWIDTH = 2
  }
  /**
   * The error code in CHANNEL_MEDIA_RELAY_ERROR.
   */
  enum CHANNEL_MEDIA_RELAY_ERROR {
    /**
     * 0: The state is normal.
     */
    RELAY_OK = 0,
    /**
     * 1: An error occurs in the server response.
     */
    RELAY_ERROR_SERVER_ERROR_RESPONSE = 1,
    /**
     * 2: No server response. You can call the
     * [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method to leave the channel.
     */
    RELAY_ERROR_SERVER_NO_RESPONSE = 2,
    /**
     * 3: The SDK fails to access the service, probably due to limited
     * resources of the server.
     */
    RELAY_ERROR_NO_RESOURCE_AVAILABLE = 3,
    /**
     * 4: Fails to send the relay request.
     */
    RELAY_ERROR_FAILED_JOIN_SRC = 4,
    /**
     * 5: Fails to accept the relay request.
     */
    RELAY_ERROR_FAILED_JOIN_DEST = 5,
    /**
     * 6: The server fails to receive the media stream.
     */
    RELAY_ERROR_FAILED_PACKET_RECEIVED_FROM_SRC = 6,
    /**
     * 7: The server fails to send the media stream.
     */
    RELAY_ERROR_FAILED_PACKET_SENT_TO_DEST = 7,
    /**
     * 8: The SDK disconnects from the server due to poor network
     * connections. You can call the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method to leave the channel.
     */
    RELAY_ERROR_SERVER_CONNECTION_LOST = 8,
    /**
     * 9: An internal error occurs in the server.
     */
    RELAY_ERROR_INTERNAL_ERROR = 9,
    /**
     * 10: The token of the source channel has expired.
     */
    RELAY_ERROR_SRC_TOKEN_EXPIRED = 10,
    /**
     * 11: The token of the destination channel has expired.
     */
    RELAY_ERROR_DEST_TOKEN_EXPIRED = 11
  }
  /**
   * The event code in CHANNEL_MEDIA_RELAY_EVENT.
   */
  enum CHANNEL_MEDIA_RELAY_EVENT {
    /**
     * 0: The user disconnects from the server due to poor network
     * connections.
     */
    RELAY_EVENT_NETWORK_DISCONNECTED = 0,
    /**
     * 1: The network reconnects.
     */
    RELAY_EVENT_NETWORK_CONNECTED = 1,
    /**
     * 2: The user joins the source channel.
     */
    RELAY_EVENT_PACKET_JOINED_SRC_CHANNEL = 2,
    /**
     * 3: The user joins the destination channel.
     */
    RELAY_EVENT_PACKET_JOINED_DEST_CHANNEL = 3,
    /**
     * 4: The SDK starts relaying the media stream to the destination channel.
     */
    RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL = 4,
    /**
     *  5: The server receives the video stream from the source channel.
     */
    RELAY_EVENT_PACKET_RECEIVED_VIDEO_FROM_SRC = 5,
    /**
     * 6: The server receives the audio stream from the source channel.
     */
    RELAY_EVENT_PACKET_RECEIVED_AUDIO_FROM_SRC = 6,
    /**
     * 7: The destination channel is updated.
     */
    RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL = 7,
    /**
     * 8: The destination channel update fails due to internal reasons.
     */
    RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_REFUSED = 8,
    /**
     * 9: The destination channel does not change, which means that the
     * destination channel fails to be updated.
     */
    RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE = 9,
    /**
     * 10: The destination channel name is `null`.
     */
    RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_IS_NULL = 10,
    /**
     *  11: The video profile is sent to the server.
     */
    RELAY_EVENT_VIDEO_PROFILE_UPDATE = 11
  }
  /**
   * The state code in CHANNEL_MEDIA_RELAY_STATE.
   */
  enum CHANNEL_MEDIA_RELAY_STATE {
    /**
     * 0: The SDK is initializing.
     */
    RELAY_STATE_IDLE = 0,
    /**
     * 1: The SDK tries to relay the media stream to the destination channel.
     */
    RELAY_STATE_CONNECTING = 1,
    /**
     * 2: The SDK successfully relays the media stream to the destination
     * channel.
     */
    RELAY_STATE_RUNNING = 2,
    /**
     * 3: A failure occurs. See the details in code.
     */
    RELAY_STATE_FAILURE = 3
  }
  /**
   * Statistics of the local video stream.
   */
  interface LocalVideoStats {
    /**
     * Bitrate (Kbps) sent in the reported interval, which does not include
     * the bitrate of the retransmission video after packet loss.
     */
    sentBitrate: number;
    /**
     * Frame rate (fps) sent in the reported interval, which does not include
     * the frame rate of the retransmission video after packet loss.
     */
    sentFrameRate: number;
    /**
     * The encoder output frame rate (fps) of the local video.
     */
    encoderOutputFrameRate: number;
    /**
     * The render output frame rate (fps) of the local video.
     */
    rendererOutputFrameRate: number;
    /**
     * The target bitrate (Kbps) of the current encoder. This value is estimated by the SDK based on the current network conditions.
     */
    targetBitrate: number;
    /**
     * The target frame rate (fps) of the current encoder.
     */
    targetFrameRate: number;
    /**
     * Quality change of the local video in terms of target frame rate and
     * target bit rate in this reported interval. See [QUALITY_ADAPT_INDICATION]{@link AgoraRtcEngine.QUALITY_ADAPT_INDICATION}.
     */
    qualityAdaptIndication: QUALITY_ADAPT_INDICATION;
    /**
     * The encoding bitrate (Kbps), which does not include the bitrate of the
     * re-transmission video after packet loss.
     */
    encodedBitrate: number;
    /**
     * The width of the encoding frame (px).
     */
    encodedFrameWidth: number;
    /**
     * The height of the encoding frame (px).
     */
    encodedFrameHeight: number;
    /**
     * The value of the sent frames, represented by an aggregate value.
     */
    encodedFrameCount: number;
    /**
     * The codec type of the local video: [VIDEO_CODEC_TYPE]{@link AgoraRtcEngine.VIDEO_CODEC_TYPE}.
     */
    codecType: VIDEO_CODEC_TYPE;
    /**
     * The video packet loss rate (%) from the local client to the Agora edge server before applying the anti-packet
     * loss strategies.
     */
    txPacketLossRate: number;
    /**
     * The capture frame rate (fps) of the local video.
     */
    captureFrameRate: number;
  }
  /**
   * Statistics of the remote video stream.
   */
  interface RemoteVideoStats {
    /**
     * User ID of the remote user sending the video streams.
     */
    uid: number;
    /**
     * @deprecated
     * Time delay (ms).
     *
     * In scenarios where audio and video is synchronized, you can use the value of
     * `networkTransportDelay` and `jitterBufferDelay` in `RemoteAudioStats` to know the delay statistics of the remote video.
     */
    delay: number;
    /**
     * Width (pixels) of the video stream.
     */
    width: number;
    /**
     * Height (pixels) of the video stream.
     */
    height: number;
    /**
     * Bitrate (Kbps) received since the last count.
     */
    receivedBitrate: number;
    /**
     * The decoder output frame rate (fps) of the remote video.
     */
    decoderOutputFrameRate: number;
    /**
     * The render output frame rate (fps) of the remote video.
     */
    rendererOutputFrameRate: number;
    /**
     * Packet loss rate (%) of the remote video stream after using the anti-packet-loss method.
     */
    packetLossRate: number;
    /**
     * The type of the remote video stream: [REMOTE_VIDEO_STREAM_TYPE]{@link AgoraRtcEngine.REMOTE_VIDEO_STREAM_TYPE}.
     */
    rxStreamType: REMOTE_VIDEO_STREAM_TYPE;
    /**
     * The total freeze time (ms) of the remote video stream after the remote user joins the channel.
     * In a video session where the frame rate is set to no less than 5 fps, video freeze occurs when
     * the time interval between two adjacent renderable video frames is more than 500 ms.
     */
    totalFrozenTime: number;
    /**
     * The total video freeze time as a percentage (%) of the total time when the video is available.
     */
    frozenRate: number;
    /**
     * The total time (ms) when the remote user in the Communication profile or the remote
     * broadcaster in the Live-broadcast profile neither stops sending the video stream nor
     * disables the video module after joining the channel.
     */
    totalActiveTime: number;
    /**
     * The total publish duration (ms) of the remote video stream.
     */
    publishDuration: number;
  }
  /**
   * Audio statistics of the local user
   */
  interface LocalAudioStats {
    /**
     * The number of channels.
     */
    numChannels: number;
    /**
     * The sample rate (Hz).
     */
    sentSampleRate: number;
    /**
     * The average sending bitrate (Kbps).
     */
    sentBitrate: number;
    /**
     * The audio packet loss rate (%) from the local client to the Agora edge server before applying the anti-packet loss strategies.
     */
    txPacketLossRate: number;
  }
  /**
   * Audio statistics of a remote user
   */
  interface RemoteAudioStats {
    /**
     * User ID of the remote user sending the audio streams.
     */
    uid: number;
    /**
     * Audio quality received by the user: [QUALITY_TYPE]{@link AgoraRtcEngine.QUALITY_TYPE}.
     */
    quality: number;
    /**
     * Network delay (ms) from the sender to the receiver.
     */
    networkTransportDelay: number;
    /**
     * Network delay (ms) from the receiver to the jitter buffer.
     */
    jitterBufferDelay: number;
    /**
     * The audio frame loss rate in the reported interval.
     */
    audioLossRate: number;
    /**
     * The number of channels.
     */
    numChannels: number;
    /**
     * The sample rate (Hz) of the received audio stream in the reported
     * interval.
     */
    receivedSampleRate: number;
    /**
     * The average bitrate (Kbps) of the received audio stream in the
     * reported interval.
     */
    receivedBitrate: number;
    /**
     * The total freeze time (ms) of the remote audio stream after the remote user joins the channel. In a session, audio
     * freeze occurs when the audio frame loss rate reaches 4%.
     */
    totalFrozenTime: number;
    /**
     * The total audio freeze time as a percentage (%) of the total time when the audio is available.
     */
    frozenRate: number;
    /**
     * The total time (ms) when the remote user in the `COMMUNICATION` profile or the remote host in
     * the `LIVE_BROADCASTING` profile neither stops sending the audio stream nor disables the audio module after joining the channel.
     */
    totalActiveTime: number;
    /**
     * The total publish duration (ms) of the remote audio stream.
     */
    publishDuration: number;
  }
  /**
   * Video dimensions.
   */
  class VideoDimensions {
    /**
     * Width (pixels) of the video.
     */
    width: number;
    /**
     * Height (pixels) of the video.
     */
    height: number;
    constructor(width?: number, height?: number);
  }
  /**
   * (Recommended) The standard bitrate set in the [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration} method.
   *
   * In this mode, the bitrates differ between the live interactive streaming and communication profiles:
   * - `COMMUNICATION` profile: The video bitrate is the same as the base bitrate.
   * - `LIVE_BROADCASTING` profile: The video bitrate is twice the base bitrate.
   */
  const STANDARD_BITRATE = 0;
  /**
   * The compatible bitrate set in the [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration} method.
   * The bitrate remains the same regardless of the channel profile. If you choose this mode in the `LIVE_BROADCASTING` profile, the
   * video frame rate may be lower than the set value.
   */
  const COMPATIBLE_BITRATE = -1;
  /**
   * Use the default minimum bitrate.
   */
  const DEFAULT_MIN_BITRATE = -1;
  /**
   * Video encoder configurations.
   */
  class VideoEncoderConfiguration {
    /**
     * The video frame dimensions (px) used to specify the video quality and measured by the total number of pixels along a
     * frame's width and height: [VideoDimensions]{@link AgoraRtcEngine.VideoDimensions}. The default value is 640 x 360.
     */
    dimensions: VideoDimensions;
    /**
     * The frame rate of the video: [FRAME_RATE]{@link AgoraRtcEngine.FRAME_RATE}. The default value is 15.
     *
     * Note that we do not recommend setting this to a value greater than 30.
     */
    frameRate: FRAME_RATE;
    /**
     * The minimum frame rate of the video. The default value is -1.
     */
    minFrameRate: number;
    /**
     The video encoding bitrate (Kbps).

     Choose one of the following options:

     - [STANDARD_BITRATE]{@link AgoraRtcEngine.STANDARD_BITRATE}: (Recommended) The standard bitrate.
     - The `COMMUNICATION` profile: the encoding bitrate equals the base bitrate.
     - The `LIVE_BROADCASTING` profile: the encoding bitrate is twice the base bitrate.
     - [COMPATIBLE_BITRATE]{@link AgoraRtcEngine.COMPATIBLE_BITRATE}: The compatible bitrate: the bitrate stays the same regardless of the
     profile.

     The `COMMUNICATION` profile prioritizes smoothness, while the `LIVE_BROADCASTING` profile prioritizes video quality (requiring
     a higher bitrate). We recommend setting the bitrate mode as `STANDARD_BITRATE` to address this difference.

     The following table lists the recommended video encoder configurations, where the base bitrate applies to the `COMMUNICATION`
     profile. Set your bitrate based on this table. If you set a bitrate beyond the proper range, the SDK automatically sets it
     to within the range.

     @note In the following table, **Base Bitrate** applies to the `COMMUNICATION` profile, and **Live Bitrate** applies to the
     `LIVE_BROADCASTING` profile.

     | Resolution             | Frame Rate (fps) | Base Bitrate (Kbps)                    | Live Bitrate (Kbps)                    |
     |------------------------|------------------|----------------------------------------|----------------------------------------|
     | 160 * 120              | 15               | 65                                     | 130                                    |
     | 120 * 120              | 15               | 50                                     | 100                                    |
     | 320 * 180              | 15               | 140                                    | 280                                    |
     | 180 * 180              | 15               | 100                                    | 200                                    |
     | 240 * 180              | 15               | 120                                    | 240                                    |
     | 320 * 240              | 15               | 200                                    | 400                                    |
     | 240 * 240              | 15               | 140                                    | 280                                    |
     | 424 * 240              | 15               | 220                                    | 440                                    |
     | 640 * 360              | 15               | 400                                    | 800                                    |
     | 360 * 360              | 15               | 260                                    | 520                                    |
     | 640 * 360              | 30               | 600                                    | 1200                                   |
     | 360 * 360              | 30               | 400                                    | 800                                    |
     | 480 * 360              | 15               | 320                                    | 640                                    |
     | 480 * 360              | 30               | 490                                    | 980                                    |
     | 640 * 480              | 15               | 500                                    | 1000                                   |
     | 480 * 480              | 15               | 400                                    | 800                                    |
     | 640 * 480              | 30               | 750                                    | 1500                                   |
     | 480 * 480              | 30               | 600                                    | 1200                                   |
     | 848 * 480              | 15               | 610                                    | 1220                                   |
     | 848 * 480              | 30               | 930                                    | 1860                                   |
     | 640 * 480              | 10               | 400                                    | 800                                    |
     | 1280 * 720             | 15               | 1130                                   | 2260                                   |
     | 1280 * 720             | 30               | 1710                                   | 3420                                   |
     | 960 * 720              | 15               | 910                                    | 1820                                   |
     | 960 * 720              | 30               | 1380                                   | 2760                                   |
     | 1920 * 1080            | 15               | 2080                                   | 4160                                   |
     | 1920 * 1080            | 30               | 3150                                   | 6300                                   |
     | 1920 * 1080            | 60               | 4780                                   | 6500                                   |
     | 2560 * 1440            | 30               | 4850                                   | 6500                                   |
     | 2560 * 1440            | 60               | 6500                                   | 6500                                   |
     | 3840 * 2160            | 30               | 6500                                   | 6500                                   |
     | 3840 * 2160            | 60               | 6500                                   | 6500                                   |
     */
    bitrate: number;
    /**
     * The minimum encoding bitrate (Kbps).
     *
     * The SDK automatically adjusts the encoding bitrate to adapt to the network conditions. Using a value greater than the default
     * value forces the video encoder to output high-quality images but may cause more packet loss and hence sacrifice the smoothness
     * of the video transmission. That said, unless you have special requirements for image quality, Agora does not recommend
     * changing this value.
     *
     * @note This parameter applies only to the `LIVE_BROADCASTING` profile.
     */
    minBitrate: number;
    /**
     * The video orientation mode of the video: [ORIENTATION_MODE]{@link AgoraRtcEngine.ORIENTATION_MODE}.
     */
    orientationMode: ORIENTATION_MODE;
    /**
     * The video encoding degradation preference under limited bandwidth:
     * [DEGRADATION_PREFERENCE]{@link AgoraRtcEngine.DEGRADATION_PREFERENCE}.
     */
    degradationPreference: DEGRADATION_PREFERENCE;
    /**
     * Sets the mirror mode of the published local video stream. It only affects the video that the remote user sees. See
     * [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
     *
     * @note The SDK disables the mirror mode by default.
     */
    mirrorMode: VIDEO_MIRROR_MODE_TYPE;
    constructor(dimensions?: VideoDimensions, frameRate?: FRAME_RATE, minFrameRate?: number, bitrate?: number, minBitrate?: number, orientationMode?: ORIENTATION_MODE, degradationPreference?: DEGRADATION_PREFERENCE, mirrorMode?: VIDEO_MIRROR_MODE_TYPE);
  }
  /**
   * The video and audio properties of the user displaying the video in the CDN live. Agora supports a maximum of 17 transcoding
   * users in a CDN streaming channel.
   */
  class TranscodingUser {
    /**
     * User ID of the user displaying the video in the CDN live.
     */
    uid: number;
    /**
     * Horizontal position (pixel) of the video frame relative to the top left corner.
     */
    x: number;
    /**
     * Vertical position (pixel) of the video frame relative to the top left corner.
     */
    y: number;
    /**
     * Width (pixel) of the video frame. The default value is 360.
     */
    width: number;
    /**
     * Height (pixel) of the video frame. The default value is 640.
     */
    height: number;
    /**
     * The layer index of the video frame. An integer. The value range is [0, 100].
     * - 0: (Default) Bottom layer.
     * - 100: Top layer.
     *
     * **Note**
     *
     * - If `zOrder` is beyond this range, the SDK reports [ERR_INVALID_ARGUMENT]{@link AgoraRtcEngine.ERROR_CODE_TYPE.ERR_INVALID_ARGUMENT}.
     * - As of v3.1.2, the SDK supports `zOrder` = 0.
     */
    zOrder: number;
    /**
     * The transparency level of the user's video. The value ranges between 0 and 1.0:
     * - 0: Completely transparent
     * - 1.0: (Default) Opaque
     */
    alpha: number;
    /**
     * The audio channel of the sound. The default value is 0:
     * - 0: (Default) Supports dual channels at most, depending on the upstream of the host.
     * - 1: The audio stream of the host uses the FL audio channel. If the upstream of the host uses multiple audio channels,
     * these channels are mixed into mono first.
     * - 2: The audio stream of the host uses the FC audio channel. If the upstream of the host uses multiple audio channels,
     * these channels are mixed into mono first.
     * - 3: The audio stream of the host uses the FR audio channel. If the upstream of the host uses multiple audio channels,
     * these channels are mixed into mono first.
     * - 4: The audio stream of the host uses the BL audio channel. If the upstream of the host uses multiple audio channels,
     * these channels are mixed into mono first.
     * - 5: The audio stream of the host uses the BR audio channel. If the upstream of the host uses multiple audio channels,
     * these channels are mixed into mono first.
     *
     * @note If your setting is not 0, you may need a specialized player.
     */
    audioChannel: number;
    constructor(uid: number, x: number, y: number, width: number, height: number, zOrder: number, alpha: number, audioChannel: number);
  }
  /**
   * Image properties.
   *
   * The properties of the watermark and background images.
   */
  class RtcImage {
    /**
     * HTTP/HTTPS URL address of the image on the live video. The maximum length of this parameter is 1024 bytes.
     */
    url: string;
    /**
     * Horizontal position of the image from the upper left of the live video.
     */
    x: number;
    /**
     * Vertical position of the image from the upper left of the live video.
     */
    y: number;
    /**
     * Width of the image on the live video.
     */
    width: number;
    /**
     * Height of the image on the live video.
     */
    height: number;
    constructor(url: string, x: number, y: number, width: number, height: number);
  }
  /**
   * The configuration for advanced features of the RTMP streaming with transcoding.
   */
  class LiveStreamAdvancedFeature {
    /**
     * The advanced feature for high-quality video with a lower bitrate.
     */
    static LBHQ: string;
    /**
     * The advanced feature for the optimized video encoder.
     */
    static VEO: string;
    /**
     * The name of the advanced feature. It contains LBHQ and VEO.
     */
    featureName: string;
    /**
     * Whether to enable the advanced feature:
     * - true: Enable the advanced feature.
     * - false: (Default) Disable the advanced feature.
     */
    opened: boolean;
    constructor(featureName: string, opened: boolean);
  }
  /**
   * A struct for managing CDN live audio/video transcoding settings.
   */
  class LiveTranscoding {
    /**
     * The width of the video in pixels. The default value is 360.
     * - When pushing video streams to the CDN, ensure that `width` is at least 64; otherwise, the Agora server adjusts the value
     * to 64.
     * - When pushing audio streams to the CDN, set `width` and `height` as 0.
     */
    width: number;
    /**
     * The height of the video in pixels. The default value is 640.
     * - When pushing video streams to the CDN, ensure that `height` is at least 64; otherwise, the Agora server adjusts the value
     * to 64.
     * - When pushing audio streams to the CDN, set `width` and `height` as 0.
     */
    height: number;
    /**
     * Bitrate of the CDN live output video stream. The default value is 400 Kbps.
     *
     * Set this parameter according to the Video Bitrate Table. If you set a bitrate beyond the proper range, the SDK automatically
     * adapts it to a value within the range.
     */
    videoBitrate: number;
    /**
     * Frame rate of the output video stream set for the CDN live streaming. The default value is 15 fps, and the value range
     * is (0,30].
     *
     * @note The Agora server adjusts any value over 30 to 30.
     */
    videoFramerate: number;
    /**
     * @deprecated Latency mode:
     * - true: Low latency with unassured quality.
     * - false: (Default) High latency with assured quality.
     */
    lowLatency: boolean;
    /**
     * Video GOP in frames. The default value is 30 fps.
     */
    videoGop: number;
    /**
     * Self-defined video codec profile: [VIDEO_CODEC_PROFILE_TYPE]{@link AgoraRtcEngine.VIDEO_CODEC_PROFILE_TYPE}.
     *
     * @note If you set this parameter to other values, Agora adjusts it to the default value of 100.
     */
    videoCodecProfile: VIDEO_CODEC_PROFILE_TYPE;
    /**
     * The background color in RGB hex value. Value only. Do not include a preceeding #. For example, 0xFFB6C1 (light pink).
     * The default value is 0x000000 (black).
     */
    backgroundColor: number;
    /**
     * The number of users in the live interactive streaming. The default value is 0.
     */
    userCount: number;
    /**
     * TranscodingUser
     */
    transcodingUsers: TranscodingUser[];
    /**
     * Reserved property. Extra user-defined information to send SEI for the H.264/H.265 video stream to the CDN live client.
     * Maximum length: 4096 Bytes.
     *
     * For more information on SEI frame, see [SEI-related questions](https://docs.AgoraRtcEngine.io/en/faq/sei).
     */
    transcodingExtraInfo: string;
    /**
     * @deprecated
     * The metadata sent to the CDN live client defined by the RTMP or HTTP-FLV metadata.
     */
    metadata: string;
    /**
     * The watermark image added to the CDN live publishing stream.
     * Ensure that the format of the image is PNG. Once a watermark image is added, the audience of the CDN live publishing stream
     * can see the watermark image. See [RtcImage]{@link AgoraRtcEngine.RtcImage}.
     */
    watermark: RtcImage;
    /**
     * The background image added to the CDN live publishing stream.
     *
     * Once a background image is added, the audience of the CDN live publishing stream can see the background image.
     * See [RtcImage]{@link AgoraRtcEngine.RtcImage}.
     */
    backgroundImage: RtcImage;
    /**
     * Self-defined audio-sample rate: [AUDIO_SAMPLE_RATE_TYPE]{@link AgoraRtcEngine.AUDIO_SAMPLE_RATE_TYPE}.
     */
    audioSampleRate: AUDIO_SAMPLE_RATE_TYPE;
    /**
     * Bitrate of the CDN live audio output stream. The default value is 48 Kbps, and the highest value is 128.
     */
    audioBitrate: number;
    /**
     * The numbder of audio channels for the CDN live stream. Agora recommends choosing 1 (mono), or 2 (stereo) audio channels.
     * Special players are required if you choose option 3, 4, or 5:
     * - 1: (Default) Mono.
     * - 2: Stereo.
     * - 3: Three audio channels.
     * - 4: Four audio channels.
     * - 5: Five audio channels.
     */
    audioChannels: 1 | 2 | 3 | 4 | 5;
    /**
     * Self-defined audio codec profile: [AUDIO_CODEC_PROFILE_TYPE]{@link AgoraRtcEngine.AUDIO_CODEC_PROFILE_TYPE}.
     */
    audioCodecProfile: AUDIO_CODEC_PROFILE_TYPE;
    /**
     * @ignore
     * Advanced features of the RTMP streaming with transcoding. See [LiveStreamAdvancedFeature]{@link AgoraRtcEngine.LiveStreamAdvancedFeature}.
     */
    advancedFeatures: LiveStreamAdvancedFeature;
    /**
     * The number of enabled advanced features. The default value is 0.
     */
    advancedFeatureCount: number;
    constructor(width: number, height: number, videoBitrate: number, videoFramerate: number, lowLatency: boolean, videoGop: number, videoCodecProfile: VIDEO_CODEC_PROFILE_TYPE, backgroundColor: number, userCount: number, transcodingUsers: TranscodingUser[], transcodingExtraInfo: string, metadata: string, watermark: RtcImage, backgroundImage: RtcImage, audioSampleRate: AUDIO_SAMPLE_RATE_TYPE, audioBitrate: number, audioChannels: 1 | 2 | 3 | 4 | 5, audioCodecProfile: AUDIO_CODEC_PROFILE_TYPE, advancedFeatures: LiveStreamAdvancedFeature, advancedFeatureCount?: number);
  }
  /**
   * Camera capturer configuration.
   */
  class CameraCapturerConfiguration {
    /**
     * Camera capturer preference settings. See: [CAPTURER_OUTPUT_PREFERENCE]{@link AgoraRtcEngine.CAPTURER_OUTPUT_PREFERENCE}.
     */
    preference: CAPTURER_OUTPUT_PREFERENCE;
    /**
     * Camera direction settings. See: [CAMERA_DIRECTION]{@link AgoraRtcEngine.CAMERA_DIRECTION}.
     */
    cameraDirection: CAMERA_DIRECTION;
    constructor(preference: CAPTURER_OUTPUT_PREFERENCE, cameraDirection: CAMERA_DIRECTION);
  }
  /**
   * Configuration of the injected media stream.
   */
  class InjectStreamConfig {
    /**
     * Width of the injected stream in the live interactive streaming. The default value is 0 (same width as the original stream).
     */
    width: number;
    /**
     * Height of the injected stream in the live interactive streaming. The default value is 0 (same height as the original stream).
     */
    height: number;
    /**
     * Video GOP (in frames) of the injected stream in the live interactive streaming. The default value is 30 fps.
     */
    videoGop: number;
    /**
     * Video frame rate of the injected stream in the live interactive streaming. The default value is 15 fps.
     */
    videoFramerate: number;
    /**
     * Video bitrate of the injected stream in the live interactive streaming. The default value is 400 Kbps.
     *
     * @note The setting of the video bitrate is closely linked to the resolution. If the video bitrate you set is beyond a reasonable
     * range, the SDK sets it within a reasonable range.
     */
    videoBitrate: number;
    /**
     * Audio-sample rate of the injected stream in the live interactive streaming:
     * [AUDIO_SAMPLE_RATE_TYPE]{@link AgoraRtcEngine.AUDIO_SAMPLE_RATE_TYPE}. The default value is 48000 Hz.
     *
     * @note We recommend setting the default value.
     */
    audioSampleRate: AUDIO_SAMPLE_RATE_TYPE;
    /**
     * Audio bitrate of the injected stream in the live interactive streaming. The default value is 48.
     *
     * @note We recommend setting the default value.
     */
    audioBitrate: number;
    /**
     * Audio channels in the live interactive streaming.
     *
     * - 1: (Default) Mono
     * - 2: Two-channel stereo
     *
     * @note We recommend setting the default value.
     */
    audioChannels: number;
    constructor(width?: number, height?: number, videoGop?: number, videoFramerate?: number, videoBitrate?: number, audioSampleRate?: AUDIO_SAMPLE_RATE_TYPE, audioBitrate?: number, audioChannels?: number);
  }
  /**
   * The definition of [ChannelMediaInfo]{@link AgoraRtcEngine.ChannelMediaInfo}.
   */
  class ChannelMediaInfo {
    /**
     * The channel name.
     */
    channelName: string;
    /**
     * The token that enables the user to join the channel.
     */
    token: string;
    /**
     * The user ID.
     */
    uid: number;
    constructor(channelName: string, token: string, uid: number);
  }
  /**
   * The definition of [ChannelMediaRelayConfiguration]{@link AgoraRtcEngine.ChannelMediaRelayConfiguration}.
   */
  class ChannelMediaRelayConfiguration {
    /**
     * The information of the source channel: `ChannelMediaInfo`. It contains the following members:
     * - `channelName`: The name of the source channel. The default value is `null`, which means the SDK applies the name of the
     * current channel.
     * - `uid`: The unique ID to identify the relay stream in the source channel. The default value is 0, which means the SDK generates a
     * random UID. You must set it as 0.
     * - `token`: The token for joining the source channel. It is generated with the `channelName` and `uid` you set in `srcInfo`.
     *   - If you have not enabled the App Certificate, set this parameter as the default value `null`, which means the SDK applies
     * the App ID.
     *   - If you have enabled the App Certificate, you must use the `token` generated with the `channelName` and `uid`, and the
     * `uid` must be set as 0.
     */
    srcInfo: ChannelMediaInfo;
    /**
     * The information of the destination channel: `ChannelMediaInfo`. It contains the following members:
     * - `channelName`: The name of the destination channel.
     * - `uid`: The unique ID to identify the relay stream in the destination channel. The value ranges from 0 to (2<sup>32</sup>-1).
     * To avoid UID conflicts, do not set this parameter as the `uid` of the host in the destination channel, and ensure that
     * this `uid` is different from any other `uid` in the destination channel. The default value is 0, which means the SDK
     * generates a random UID.
     * - `token`: The token for joining the destination channel. It is generated with the `channelName` and `uid` you set in
     * `destInfos`.
     *   - If you have not enabled the App Certificate, set this parameter as the default value `null`, which means the SDK
     * applies the App ID.
     *   - If you have enabled the App Certificate, you must use the `token` generated with the `channelName` and `uid`.
     */
    destInfos: ChannelMediaInfo[];
    /**
     * The number of destination channels. The default value is 0, and the
     * value range is [0,4). Ensure that the value of this parameter
     * corresponds to the number of `ChannelMediaInfo` structs you define in
     * `destInfos`.
     */
    destCount: number;
    constructor(srcInfo: ChannelMediaInfo, destInfos: ChannelMediaInfo[], destCount: number);
  }
  /**
   * @deprecated
   * Lifecycle of the CDN live video stream.
   */
  enum RTMP_STREAM_LIFE_CYCLE_TYPE {
    /**
     * Bind to the channel lifecycle. If all hosts leave the channel, the CDN live streaming stops after 30 seconds.
     */
    RTMP_STREAM_LIFE_CYCLE_BIND2CHANNEL = 1,
    /**
     * Bind to the owner of the RTMP stream. If the owner leaves the channel, the CDN live streaming stops immediately.
     */
    RTMP_STREAM_LIFE_CYCLE_BIND2OWNER = 2
  }
  /**
   * Content hints for screen sharing.
   */
  enum VideoContentHint {
    /**
     * (Default) No content hint.
     */
    CONTENT_HINT_NONE = 0,
    /**
     * Motion-intensive content. Choose this option if you prefer smoothness or when you are sharing a video clip, movie, or
     * video game.
     */
    CONTENT_HINT_MOTION = 1,
    /**
     * Motionless content. Choose this option if you prefer sharpness or when you are sharing a picture, PowerPoint slide, or text.
     */
    CONTENT_HINT_DETAILS = 2
  }
  /**
   * The relative location of the region to the screen or window.
   */
  class Rectangle {
    /**
     * The horizontal offset from the top-left corner.
     */
    x: number;
    /**
     * The vertical offset from the top-left corner.
     */
    y: number;
    /**
     * The width of the region.
     */
    width: number;
    /**
     * The height of the region.
     */
    height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
  }
  /**
   * @deprecated
   * Definition of the rectangular region.
   */
  class Rect {
    /**
     * Y-axis of the top line.
     */
    top: number;
    /**
     * X-axis of the left line.
     */
    left: number;
    /**
     * Y-axis of the bottom line.
     */
    bottom: number;
    /**
     * X-axis of the right line.
     */
    right: number;
    constructor(top?: number, left?: number, bottom?: number, right?: number);
  }
  /**
   * The options of the watermark image to be added.
   */
  class WatermarkOptions {
    /**
     * Sets whether or not the watermark image is visible in the local video preview:
     * - true: (Default) The watermark image is visible in preview.
     * - false: The watermark image is not visible in preview.
     */
    visibleInPreview: boolean;
    /**
     * The watermark position in the landscape mode. See [Rectangle]{@link AgoraRtcEngine.Rectangle}.
     */
    positionInLandscapeMode: Rectangle;
    /**
     * The watermark position in the portrait mode. See [Rectangle]{@link AgoraRtcEngine.Rectangle}.
     */
    positionInPortraitMode: Rectangle;
    constructor(visibleInPreview?: boolean, positionInLandscapeMode?: Rectangle, positionInPortraitMode?: Rectangle);
  }
  /**
   * Screen sharing encoding parameters.
   */
  class ScreenCaptureParameters {
    /**
     * The maximum encoding dimensions of the shared region in terms of width * height.
     *
     * The default value is 1920 * 1080 pixels, that is, 2073600 pixels. Agora uses the value of this parameter to calculate
     * the charges.
     * If the aspect ratio is different between the encoding dimensions and screen dimensions, Agora applies the following
     * algorithms for encoding. Suppose the encoding dimensions are 1920 x 1080:
     * - If the value of the screen dimensions is lower than that of the encoding dimensions, for example, 1000 * 1000, the
     * SDK uses 1000 * 1000 for encoding.
     * - If the value of the screen dimensions is higher than that of the encoding dimensions, for example, 2000 * 1500, the
     * SDK uses the maximum value under 1920 * 1080 with the aspect ratio of the screen dimension (4:3) for encoding, that is,
     * 1440 * 1080.
     */
    dimensions: VideoDimensions;
    /**
     * The frame rate (fps) of the shared region.
     *
     * The default value is 5. We do not recommend setting this to a value greater than 15.
     */
    frameRate: number;
    /**
     * The bitrate (Kbps) of the shared region.
     *
     * The default value is 0 (the SDK works out a bitrate according to the dimensions of the current screen).
     */
    bitrate: number;
    /**
     * Sets whether or not to capture the mouse for screen sharing:
     * - true: (Default) Capture the mouse.
     * - false: Do not capture the mouse.
     */
    captureMouseCursor: boolean;
    /**
     * Whether to bring the window to the front when calling
     * [startScreenCaptureByWindowId]{@link AgoraRtcEngine.startScreenCaptureByWindowId} to share the window:
     * - true: Bring the window to the front.
     * - false: (Default) Do not bring the window to the front.
     */
    windowFocus: boolean;
    /**
     * A list of IDs of windows to be blocked.
     *
     * - When calling [startScreenCaptureByScreenRect]{@link AgoraRtcEngine.startScreenCaptureByScreenRect} to start screen sharing,
     * you can use this parameter to block the specified windows.
     * - When calling [updateScreenCaptureParameters]{@link AgoraRtcEngine.updateScreenCaptureParameters} to update the configuration
     * for screen sharing, you can use this parameter to dynamically block the specified windows during screen sharing.
     */
    excludeWindowList: any[];
    /**
     * The number of windows to be blocked.
     */
    excludeWindowCount: number;
    constructor(dimensions: VideoDimensions, frameRate: number, bitrate: number, captureMouseCursor: boolean, windowFocus: boolean, excludeWindowList: any[], excludeWindowCount?: number);
  }
  /**
   * @ignore
   * Video display settings of the `VideoCanvas` class.
   */
  class VideoCanvas {
    /**
     * Video display window (view).
     */
    view: any;
    /**
     * The rendering mode of the video view. See [RENDER_MODE_TYPE]{@link AgoraRtcEngine.RENDER_MODE_TYPE}.
     */
    renderMode: number;
    /**
     * The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes.
     * Supported character scopes are:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=",
     * ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     *
     * @note The default value is the empty string "". Use the default value if the user joins the channel using the
     * [joinChannel]{@link AgoraRtcEngine.joinChannel} method in the Agora engine. The `VideoCanvas` struct defines the video canvas of
     * the user in the channel.
     */
    channelId: string;
    /**
     * The user ID.
     */
    uid: number;
    /** @ignore */
    priv: any;
    /**
     * The mirror mode of the video view. See [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
     *
     * **Note**
     *
     * - For the mirror mode of the local video view: If you use a front camera, the SDK enables the mirror mode by default; if you
     * use a rear camera, the SDK disables the mirror mode by default.
     * - For the mirror mode of the remote video view: The SDK disables the mirror mode by default.
     */
    mirrorMode: VIDEO_MIRROR_MODE_TYPE;
    constructor(view: any, renderMode: number, channelId: string, uid: number, priv: any, mirrorMode?: VIDEO_MIRROR_MODE_TYPE);
  }
  /**
   * The contrast level, used with the `lightening` parameter.
   */
  enum LIGHTENING_CONTRAST_LEVEL {
    /**
     * Low contrast level.
     */
    LIGHTENING_CONTRAST_LOW = 0,
    /**
     * (Default) Normal contrast level.
     */
    LIGHTENING_CONTRAST_NORMAL = 1,
    /**
     * High contrast level.
     */
    LIGHTENING_CONTRAST_HIGH = 2
  }
  /**
   * Image enhancement options.
   */
  class BeautyOptions {
    /**
     * The contrast level, used with the `lightening` parameter.
     */
    lighteningContrastLevel: LIGHTENING_CONTRAST_LEVEL;
    /**
     * The brightness level. The value ranges from 0.0 (original) to 1.0.
     */
    lighteningLevel: number;
    /**
     * The sharpness level. The value ranges between 0 (original) and 1. This parameter is usually used to remove blemishes.
     */
    smoothnessLevel: number;
    /**
     * The redness level. The value ranges between 0 (original) and 1. This parameter adjusts the red saturation level.
     */
    rednessLevel: number;
    constructor(lighteningContrastLevel?: LIGHTENING_CONTRAST_LEVEL, lighteningLevel?: number, smoothnessLevel?: number, rednessLevel?: number);
  }
  /**
   * The UserInfo interface.
   */
  interface UserInfo {
    /**
     * The user ID.
     */
    uid: number;
    /**
     * The user account.
     */
    userAccount: string;
  }
  /**
   * Regions for connection.
   */
  enum AREA_CODE {
    /**
     * Mainland China.
     */
    AREA_CODE_CN = 1,
    /**
     * North America.
     */
    AREA_CODE_NA = 2,
    /**
     * Europe.
     */
    AREA_CODE_EU = 4,
    /**
     * Asia, excluding Mainland China.
     */
    AREA_CODE_AS = 8,
    /**
     * Japan.
     */
    AREA_CODE_JP = 16,
    /**
     * India.
     */
    AREA_CODE_IN = 32,
    /**
     * (Default) Global.
     */
    AREA_CODE_GLOB = 4294967295
  }
  /**
   * @ignore
   */
  enum ENCRYPTION_CONFIG {
    ENCRYPTION_FORCE_SETTING = 1,
    ENCRYPTION_FORCE_DISABLE_PACKET = 2
  }
  /**
   * Definition of RtcEngineContext.
   */
  class RtcEngineContext {
    /**
     * The App ID issued to you by Agora. See [How to get the App ID](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token#get-an-app-id).
     * Only users in apps with the same App ID can join the same channel and communicate with each other. Use an App ID to create only
     * one `IRtcEngine` instance. To change your App ID, call `release` to destroy the current `IRtcEngine` instance and then call `createAgoraRtcEngine`
     * and `initialize` to create an `IRtcEngine` instance with the new App ID.
     */
    appId: string;
    /** The video window handle. Once set, this parameter enables you to plug
     * or unplug the video devices while they are powered.
     */
    context?: any;
    /**
     * The region for connection. This advanced feature applies to scenarios that have regional restrictions.
     *
     * For the regions that Agora supports, see #AREA_CODE. After specifying the region, the SDK connects to the Agora servers within that region.
     *
     * @note The SDK supports specify only one region.
     */
    areaCode: AREA_CODE;
    constructor(appId: string);
  }
  /**
   * Metadata type of the observer.
   * @note We only support video metadata for now.
   */
  enum METADATA_TYPE {
    /**
     * -1: the metadata type is unknown.
     */
    UNKNOWN_METADATA = -1,
    /**
     * 0: the metadata type is video.
     */
    VIDEO_METADATA = 0
  }
  /**
   * The defination of [Metadata]{@link AgoraRtcEngine.Metadata}.
   */
  class Metadata {
    /**
     * The User ID.
     * - For the receiver: the ID of the user who sent the metadata.
     * - For the sender: ignore it.
     */
    uid: number;
    /**
     * Buffer size of the sent or received metadata.
     */
    size: number;
    /**
     * Buffer address of the sent or received metadata.
     */
    buffer: Uint8Array;
    /**
     * Timestamp (ms) of the frame following the metadata.
     */
    timeStampMs: number;
    constructor(uid: number, size: number, buffer: Uint8Array, timeStampMs: number);
  }
  /**
   * Encryption mode.
   */
  enum ENCRYPTION_MODE {
    /**
     * 1: (Default) 128-bit AES encryption, XTS mode.
     */
    AES_128_XTS = 1,
    /**
     * 2: 128-bit AES encryption, ECB mode.
     */
    AES_128_ECB = 2,
    /**
     * 3: 256-bit AES encryption, XTS mode.
     */
    AES_256_XTS = 3,
    /**
     * 4: 128-bit SM4 encryption, ECB mode.
     */
    SM4_128_ECB = 4,
    /**
     * Enumerator boundary.
     */
    MODE_END = 5
  }
  /**
   * Configurations of built-in encryption schemas.
   */
  class EncryptionConfig {
    /**
     * Encryption mode. The default encryption mode is `AES_128_XTS`. See [ENCRYPTION_MODE]{@link AgoraRtcEngine.ENCRYPTION_MODE}.
     */
    encryptionMode: ENCRYPTION_MODE;
    /**
     * Encryption key in string type.
     *
     * @note If you do not set an encryption key or set it as `null`, you cannot use the built-in encryption, and the SDK returns
     * -2(`ERR_INVALID_ARGUMENT`).
     */
    encryptionKey: string;
    constructor(encryptionMode: ENCRYPTION_MODE, encryptionKey: string);
  }
}
export declare namespace AgoraRtcEngine {
  /**
   * TODO
   *
   * @param context
   */
  function initialize(context: RtcEngineContext): number;
  /**
   * Releases all resources of the Agora engine.
   *
   * Use this method for apps in which users occasionally make voice or video calls. When users do not make calls, you can free up
   * resources for other operations. Once you call `release` to release the Agora engine, you cannot use any method or
   * callback in the SDK any more.
   *
   * If you want to use the real-time communication functions again, you must call [init]{@link AgoraRtcEngine.init} to initialize a
   * new Agora engine.
   *
   * @note If you want to reinitialize the Agora engine after releasing the current one, ensure that you wait till the
   * `release` method completes executing.
   */
  function release(): void;
  /**
   * Listens for the events during the Agora engine runtime.
   */
  function on<T extends Function>(type: string, callback: T): T;
  /**
   * Stops monitoring the events during the Agora engine runtime.
   */
  function off(type: string, callback: Function): void;
  /**
   * Sets the channel profile of the Agora engine.
   *
   * The Agora engine differentiates channel profiles and applies optimization algorithms accordingly.
   * For example, it prioritizes smoothness and low latency for a video call, and prioritizes video quality for the live interactive
   * video streaming.
   *
   * @warning
   * - To ensure the quality of real-time communication, we recommend that all users in a channel use the same channel profile.
   * - Call this method before calling [joinChannel]{@link AgoraRtcEngine.joinChannel} . You cannot set the channel profile once you have
   * joined the channel.
   * - The default audio route and video encoding bitrate are different in different channel profiles. For details, see
   * [setDefaultAudioRouteToSpeakerphone]{@link AgoraRtcEngine.setDefaultAudioRouteToSpeakerphone} and
   * [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration}.
   *
   * @param profile The channel profile of the Agora engine. See [CHANNEL_PROFILE_TYPE]{@link AgoraRtcEngine.CHANNEL_PROFILE_TYPE}.
   *
   * @return
   * - 0(`ERR_OK`): Success.
   * - < 0: Failure.
   *  - -2(`ERR_INVALID_ARGUMENT`): The parameter is invalid.
   *  - -7(`ERR_NOT_INITIALIZED`): The SDK is not initialized.
   */
  function setChannelProfile(profile: CHANNEL_PROFILE_TYPE): number;
  /**
   * TODO
   *
   * @param role
   * @param options
   */
  function setClientRole(role: CLIENT_ROLE_TYPE, options?: ClientRoleOptions): number;
  /**
   * Joins a channel with the user ID.
   *
   * Users in the same channel can talk to each other, and multiple users in the same channel can start a group chat. Users with
   * different App IDs cannot call each other.
   *
   * You must call the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method to exit the current call before entering another channel.
   *
   * A successful [joinChannel]{@link AgoraRtcEngine.joinChannel} method call triggers the following callbacks:
   * - The local client: [onJoinChannelSuccess]{@link AgoraRtcEvents.onJoinChannelSuccess}
   * - The remote client: [onUserJoined]{@link AgoraRtcEvents.onUserJoined} , if the user joining the channel is in the `COMMUNICATION`
   * profile, or is a host in the `LIVE_BROADCASTING` profile.
   *
   * When the connection between the client and Agora server is interrupted due to poor network conditions, the SDK tries reconnecting
   * to the server. When the local client successfully rejoins the channel, the SDK triggers the
   * [onRejoinChannelSuccess]{@link AgoraRtcEvents.onRejoinChannelSuccess} callback on the local client.
   *
   * @note A channel does not accept duplicate uids, such as two users with the same `uid`. If you set `uid` as 0, the system
   * automatically assigns a `uid`. If you want to join a channel from different devices, ensure that each device has a different uid.
   *
   * @warning Ensure that the App ID used for creating the token is the same App ID used by the [init]{@link AgoraRtcEngine.init} method for
   * initializing the Agora engine. Otherwise, the CDN live streaming may fail.
   *
   * @param token The token for authentication:
   * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see
   * [Get a temporary token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#get-a-temporary-token).
   * - In situations requiring high security: Set it as the token generated at your server. For details, see
   * [Get a token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#generatetoken).
   * @param channelId The unique channel name for the Agora RTC session in the string format smaller than 64 bytes.
   * Supported characters:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param info (Optional) The additional information about the channel. This parameter can be set to `null` or contain channel
   * related information. Other users in the channel will not receive this message.
   * @param uid (Optional) User ID. A 32-bit unsigned integer with a value ranging from 1 to 2<sup>32</sup>-1. The `uid` must be unique.
   * If a `uid` is not assigned (or set to `0`), the SDK assigns and returns a `uid` in the
   * [onJoinChannelSuccess]{@link AgoraRtcEvents.onJoinChannelSuccess} callback. Your application must record and maintain the returned
   * `uid` since the SDK does not do so.
   * @return
   * - 0(ERR_OK): Success.
   * - < 0: Failure.
   *   - -2(ERR_INVALID_ARGUMENT): The parameter is invalid.
   *   - -3(ERR_NOT_READY): The SDK fails to be initialized. You can try re-initializing the SDK.
   */
  function joinChannel(token: string, channelId: string, info?: string, uid?: number): number;
  /**
   * Switches to a different channel.
   *
   * This method allows the audience of a `LIVE_BROADCASTING` channel to switch to a different channel.
   *
   * After the user successfully switches to another channel, the [onLeaveChannel]{@link AgoraRtcEvents.onLeaveChannel}
   * and [onJoinChannelSuccess]{@link AgoraRtcEvents.onJoinChannelSuccess} callbacks are triggered to indicate that the
   * user has left the original channel and joined a new one.
   *
   * @note This method applies to the audience role in a `LIVE_BROADCASTING` channel only.
   *
   * @param token The token for authentication:
   * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see
   * [Get a temporary token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#get-a-temporary-token).
   * - In situations requiring high security: Set it as the token generated at your server. For details, see
   * [Get a token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#generatetoken).
   * @param channelId The unique channel name for the Agora RTC session in the string format smaller than 64 bytes.
   * Supported characters:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   *
   * @return
   * - 0(ERR_OK): Success.
   * - < 0: Failure.
   *  - -1(ERR_FAILED): A general error occurs (no specified reason).
   *  - -2(ERR_INVALID_ARGUMENT): The parameter is invalid.
   *  - -5(ERR_REFUSED): The request is rejected, probably because the user is not an audience.
   *  - -7(ERR_NOT_INITIALIZED): The SDK is not initialized.
   *  - -102(ERR_INVALID_CHANNEL_NAME): The channel name is invalid.
   *  - -113(ERR_NOT_IN_CHANNEL): The user is not in the channel.
   */
  function switchChannel(token: string, channelId: string): number;
  /**
   * Allows a user to leave a channel, such as hanging up or exiting a call.
   *
   * After joining a channel, the user must call the `leaveChannel` method to end the call before joining another channel.
   *
   * This method returns `0` if the user leaves the channel and releases all resources related to the call.
   *
   * This method call is asynchronous, and the user has not left the channel when the method call returns. Once the user leaves the
   * channel, the SDK triggers the [onLeaveChannel]{@link AgoraRtcEvents.onLeaveChannel} callback. A successful
   * [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method call triggers the following callbacks:
   * - The local client: [onLeaveChannel]{@link AgoraRtcEvents.onLeaveChannel}.
   * - The remote client: [onUserOffline]{@link AgoraRtcEvents.onUserOffline}, if the user leaving the channel is in the
   * `COMMUNICATION` channel, or is a host in the `LIVE_BROADCASTING` profile.
   *
   * **Note**
   *
   * - If you call the [release]{@link AgoraRtcEngine.release} method immediately after the `leaveChannel` method, the `leaveChannel` process
   * interrupts, and the [onLeaveChannel]{@link AgoraRtcEvents.onLeaveChannel} callback is not triggered.
   * - If you call the `leaveChannel` method during a CDN live streaming, the SDK triggers the
   * [removePublishStreamUrl]{@link AgoraRtcEngine.removePublishStreamUrl} method.
   *
   * @return - 0(ERR_OK): Success.
   * - < 0: Failure.
   *   - -1(ERR_FAILED): A general error occurs (no specified reason).
   *   - -2(ERR_INVALID_ARGUMENT): The parameter is invalid.
   *   - -7(ERR_NOT_INITIALIZED): The SDK is not initialized.
   */
  function leaveChannel(): number;
  /**
   * Gets a new token when the current token expires after a period of time.
   *
   * The `token` expires after a period of time once the token schema is enabled when:
   * - The SDK triggers the [onTokenPrivilegeWillExpire]{@link AgoraRtcEvents.onTokenPrivilegeWillExpire} callback, or
   * - The [onConnectionStateChanged]{@link AgoraRtcEvents.onConnectionStateChanged} reports `CONNECTION_CHANGED_TOKEN_EXPIRED(9)`.
   *
   * The application should call this method to get the new `token`. Failure to do so will result in the SDK disconnecting from the
   * server.
   *
   * @param token The new token.
   *
   * @return
   * - 0(ERR_OK): Success.
   * - < 0: Failure.
   *   - -1(ERR_FAILED): A general error occurs (no specified reason).
   *   - -2(ERR_INVALID_ARGUMENT): The parameter is invalid.
   *   - -7(ERR_NOT_INITIALIZED): The SDK is not initialized.
   */
  function renewToken(token: string): number;
  /**
   * Registers a user account.
   *
   * Once registered, the user account can be used to identify the local user when the user joins the channel. After the user
   * successfully registers a user account, the SDK triggers the
   * [onLocalUserRegistered]{@link AgoraRtcEvents.onLocalUserRegistered} callback on the local client, reporting the user ID and
   * user account of the local user.
   *
   * To join a channel with a user account, you can choose either of the following:
   *
   * - Call the `registerLocalUserAccount` method to create a user account, and then the
   * [joinChannelWithUserAccount]{@link AgoraRtcEngine.joinChannelWithUserAccount} method to join the channel.
   * - Call the `joinChannelWithUserAccount` method to join the channel.
   *
   * The difference between the two is that for the former, the time elapsed between calling the `joinChannelWithUserAccount` method
   * and joining the channel is shorter than the latter.
   *
   * **Note**
   *
   * - Ensure that you set the `userAccount` parameter. Otherwise, this method does not take effect.
   * - Ensure that the value of the `userAccount` parameter is unique in the channel.
   * - To ensure smooth communication, use the same parameter type to identify the user. For example, if a user joins the channel
   * with a user ID, then ensure all the other users use the user ID too. The same applies to the user account. If a user joins
   * the channel with the Agora Web SDK, ensure that the uid of the user is set to the same parameter type.
   *
   * @param appId The App ID of your project.
   * @param userAccount The user account. The maximum length of this parameter is 255 bytes. Ensure that you set this parameter
   * and do not set it as `null`. Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function registerLocalUserAccount(appId: string, userAccount: string): number;
  /**
   * Joins the channel with a user account.
   *
   * After the user successfully joins the channel, the SDK triggers the following callbacks:
   *
   * - The local client: [onLocalUserRegistered]{@link AgoraRtcEvents.onLocalUserRegistered} and
   * [onJoinChannelSuccess]{@link AgoraRtcEvents.onJoinChannelSuccess}.
   * - The remote client: [onUserJoined]{@link AgoraRtcEvents.onUserJoined} and
   * [onUserInfoUpdated]{@link AgoraRtcEvents.onUserInfoUpdated}, if the user joining the channel is in the `COMMUNICATION` profile, or
   * is a host in the `LIVE_BROADCASTING` profile.
   *
   * **Note**
   *
   * - To ensure smooth communication, use the same parameter type to identify the user. For example, if a user joins the channel
   * with a user ID, then ensure all the other users use the user ID too. The same applies to the user account.
   * - If a user joins the
   * channel with the Agora Web SDK, ensure that the uid of the user is set to the same parameter type.
   *
   * @param token The token for authentication:
   * - In situations not requiring high security: You can use the temporary token generated at Console. For details, see
   * [Get a temporary token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#get-a-temporary-token).
   * - In situations requiring high security: Set it as the token generated at your server. For details, see
   * [Get a token](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/token?platform=All%20Platforms#generatetoken).
   * @param channelId The channel name. The maximum length of this parameter is 64 bytes. Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=",
   * ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param userAccount The user account. The maximum length of this parameter is 255 bytes. Ensure that you set this parameter
   * and do not set it as `null`. Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=",
   * ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *   - -2(`ERR_INVALID_ARGUMENT`)
   *   - -3(`ERR_NOT_READY`)
   *   - -5(`ERR_REFUSED`)
   */
  function joinChannelWithUserAccount(token: string, channelId: string, userAccount: string): number;
  /**
   * Gets the user information by passing in the user account.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user account of the remote user, caches them
   * in [UserInfo]{@link AgoraRtcEngine.UserInfo}, and triggers the
   * [onUserInfoUpdated]{@link AgoraRtcEvents.onUserInfoUpdated}  callback on the local client.
   *
   * After receiving the [onUserInfoUpdated]{@link AgoraRtcEvents.onUserInfoUpdated} callback, you can call this method
   * to get the user ID of the remote user from the `UserInfo` interface by passing in the user account.
   *
   * @param userAccount The user account of the user. Ensure that you set this parameter.
   *
   * @return A [UserInfo]{@link AgoraRtcEngine.UserInfo} interface that identifies the user.
   */
  function getUserInfoByUserAccount(userAccount: string): UserInfo;
  /**
   * Gets the user information by passing in the user ID.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user account of the remote user,
   * caches [UserInfo]{@link AgoraRtcEngine.UserInfo}, and triggers the
   * [onUserInfoUpdated]{@link AgoraRtcEvents.onUserInfoUpdated} callback on the local client.
   *
   * After receiving the [onUserInfoUpdated]{@link AgoraRtcEvents.onUserInfoUpdated} callback, you can call this method
   * to get the user account of the remote user from the `UserInfo` interface by passing in the user ID.
   *
   * @param uid The user ID of the remote user. Ensure that you set this parameter.
   *
   * @return A [UserInfo]{@link AgoraRtcEngine.UserInfo} interface that identifies the user.
   */
  function getUserInfoByUid(uid: number): UserInfo;
  /**
   * Starts an audio call test.
   *
   * This method starts an audio call test to determine whether the audio devices (for example, headset and speaker)
   * and the network connection are working properly.
   *
   * In the audio call test, you record your voice. If the recording plays back within the set time interval, the
   * audio devices and the network connection are working properly.
   *
   * **Note**
   *
   * - Call this method before joining a channel.
   * - After calling this method, call the [stopEchoTest]{@link AgoraRtcEngine.stopEchoTest} method to end the test.
   * Otherwise, the app cannot run the next echo test, or call the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   * - In the `LIVE_BROADCASTING` profile, only a host can call this method.
   *
   * @param intervalInSeconds The time interval (s) between when you speak and when the recording plays back.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startEchoTest(intervalInSeconds?: number): number;
  /**
   * Stops the audio call test.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopEchoTest(): number;
  /**
   * Enables the video module.
   *
   * Call this method either before joining a channel or during a call. If this method is called before joining a
   * channel, the call starts in the video mode. If this method is called during an audio call, the audio mode
   * switches to the video mode. To disable the video module, call the [disableVideo]{@link AgoraRtcEngine.disableVideo} method.
   *
   * A successful [enableVideo]{@link AgoraRtcEngine.enableVideo} method call triggers the
   * [onUserEnableVideo]{@link AgoraRtcEvents.onUserEnableVideo}(true) callback on the remote client.
   *
   * **Note**
   *
   * - This method affects the internal engine and can be called after the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following
   * API methods to control the video engine modules separately:
   *   - [enableLocalVideo]{@link AgoraRtcEngine.enableLocalVideo}: Whether to enable the camera to create the local video stream.
   *   - [muteLocalVideoStream]{@link AgoraRtcEngine.muteLocalVideoStream}: Whether to publish the local video stream.
   *   - [muteRemoteVideoStream]{@link AgoraRtcEngine.muteRemoteVideoStream}: Whether to subscribe to and play the remote video stream.
   *   - [muteAllRemoteVideoStreams]{@link AgoraRtcEngine.muteAllRemoteVideoStreams}: Whether to subscribe to and play all remote video streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableVideo(): number;
  /**
   * Disables the video module.
   *
   * This method can be called before joining a channel or during a call. If this method is called before joining a
   * channel, the call starts in audio mode. If this method is called during a video call, the video mode switches
   * to the audio mode. To enable the video module, call the [enableVideo]{@link AgoraRtcEngine.enableVideo} method.
   *
   * A successful [disableVideo]{@link AgoraRtcEngine.disableVideo} method call triggers the
   * [onUserEnableVideo]{@link AgoraRtcEvents.onUserEnableVideo} (false) callback on the remote client.
   *
   * **Note**
   *
   * - This method affects the internal engine and can be called after the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following API
   * methods to control the video engine modules separately:
   *   - [enableLocalVideo]{@link AgoraRtcEngine.enableLocalVideo} : Whether to enable the camera to create the local video stream.
   *   - [muteLocalVideoStream]{@link AgoraRtcEngine.muteLocalVideoStream} : Whether to publish the local video stream.
   *   - [muteRemoteVideoStream]{@link AgoraRtcEngine.muteRemoteVideoStream} : Whether to subscribe to and play the remote video stream.
   *   - [muteAllRemoteVideoStreams]{@link AgoraRtcEngine.muteAllRemoteVideoStreams} : Whether to subscribe to and play all remote video streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function disableVideo(): number;
  /**
   * Sets the video profile.
   *
   * @deprecated This method is deprecated. Use the [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration}
   * method instead.
   *
   * Each video profile includes a set of parameters, such as the resolution, frame rate, and bitrate. If the camera
   * device does not support the specified resolution, the SDK automatically chooses a suitable camera resolution,
   * keeping the encoder resolution specified by the `setVideoProfile` method.
   *
   * **Note**
   *
   * - If you do not need to set the video profile after joining the channel, call this method before the
   * [enableVideo]{@link AgoraRtcEngine.enableVideo} method to reduce the render time of the first video frame.
   * - Always set the video profile before calling the [joinChannel]{@link AgoraRtcEngine.joinChannel} or
   * [startPreview]{@link AgoraRtcEngine.startPreview} method.
   *
   * @param profile Sets the video profile. See [VIDEO_PROFILE_TYPE]{@link AgoraRtcEngine.VIDEO_PROFILE_TYPE}.
   * @param swapWidthAndHeight Sets whether to swap the width and height of the video stream:
   * - true: Swap the width and height.
   * - false: (Default) Do not swap the width and height.
   * The width and height of the output video are consistent with the set video profile.
   *
   * @note Since the landscape or portrait mode of the output video can be decided directly by the video profile,
   * We recommend setting `swapWidthAndHeight` to `false` (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setVideoProfile(profile: VIDEO_PROFILE_TYPE, swapWidthAndHeight: boolean): number;
  /**
   * Sets the video encoder configuration.
   *
   * Each video encoder configuration corresponds to a set of video parameters, including the resolution, frame rate,
   * bitrate, and video orientation.
   *
   * The parameters specified in this method are the maximum values under ideal network conditions. If the video
   * engine cannot render the video using the specified parameters due to poor network conditions, the parameters
   * further down the list are considered until a successful configuration is found.
   *
   * @note If you do not need to set the video encoder configuration after joining the channel, you can call this
   * method before the [enableVideo]{@link AgoraRtcEngine.enableVideo} method to reduce the render time of the first video frame.
   *
   * @param config Sets the local video encoder configuration. See
   * [VideoEncoderConfiguration]{@link AgoraRtcEngine.VideoEncoderConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setVideoEncoderConfiguration(config: VideoEncoderConfiguration): number;
  /**
   * Sets the camera capture configuration.
   *
   * For a video call or the live interactive video streaming, generally the SDK controls the camera output
   * parameters. When the default camera capturer settings do not meet special requirements or cause performance
   * problems, we recommend using this method to set the camera capturer configuration:
   * - If the resolution or frame rate of the captured raw video data are higher than those set by
   * [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration}, processing video frames requires
   * extra CPU and RAM usage and degrades performance. We recommend setting `config` as
   * `CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)` to avoid such problems.
   * - If you do not need local video preview or are willing to sacrifice preview quality, we recommend setting
   * `config` as `CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)` to optimize CPU and RAM usage.
   * - If you want better quality for the local video preview, we recommend setting config as
   * `CAPTURER_OUTPUT_PREFERENCE_PREVIEW(2)`.
   *
   * @note Call this method before enabling the local camera. That said, you can call this method before calling
   * [joinChannel]{@link AgoraRtcEngine.joinChannel}, [enableVideo]{@link AgoraRtcEngine.enableVideo}, or
   * [enableLocalVideo]{@link AgoraRtcEngine.enableLocalVideo}, depending on which method you use to turn on your local camera.
   *
   * @param config Sets the camera capturer configuration. See
   * [CameraCapturerConfiguration]{@link AgoraRtcEngine.CameraCapturerConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setCameraCapturerConfiguration(config: CameraCapturerConfiguration): number;
  /**
   * TODO
   *
   * @param canvas
   */
  function setupLocalVideo(canvas: HTMLCanvasElement): void;
  /**
   * TODO
   *
   * @param canvas
   * @param uid
   */
  function setupRemoteVideo(canvas: HTMLCanvasElement, uid: number): void;
  /**
   * Starts the local video preview before joining the channel.
   *
   * Before calling this method, you must call the [enableVideo]{@link AgoraRtcEngine.enableVideo} method to enable video.
   *
   * @note Once the `startPreview` method is called to start the local video preview, if you leave the channel by
   * calling the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method, the local video preview remains until you call
   * the [stopPreview]{@link AgoraRtcEngine.stopPreview} method to disable it.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startPreview(): number;
  /**
   * Prioritizes a remote user's stream.
   *
   * Use this method with the [setRemoteSubscribeFallbackOption]{@link AgoraRtcEngine.setRemoteSubscribeFallbackOption} method.
   * If the fallback function is enabled for a subscribed stream, the SDK ensures the high-priority user gets the
   * best possible stream quality.
   *
   * @note The Agora SDK supports setting `userPriority` as `PRIORITY_HIGH` for one user only.
   *
   * @param uid The ID of the remote user.
   * @param userPriority Sets the priority of the remote user. See [PRIORITY_TYPE]{@link AgoraRtcEngine.PRIORITY_TYPE}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteUserPriority(uid: number, userPriority: PRIORITY_TYPE): number;
  /**
   * Stops the local video preview and disables video.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopPreview(): number;
  /**
   * Enables the audio module.
   *
   * The audio mode is enabled by default.
   *
   * **Note**
   *
   * - This method affects the internal engine and can be called after the [leaveChannel]{@link AgoraRtcEngine.leaveChannel}
   * method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following
   * API methods to control the audio engine modules separately:
   *   - [enableLocalAudio]{@link AgoraRtcEngine.enableLocalAudio}: Whether to enable the microphone to create the local audio stream.
   *   - [muteLocalAudioStream]{@link AgoraRtcEngine.muteLocalAudioStream}: Whether to publish the local audio stream.
   *   - [muteRemoteAudioStream]{@link AgoraRtcEngine.muteRemoteAudioStream}: Whether to subscribe to and play the remote audio stream.
   *   - [muteAllRemoteAudioStreams]{@link AgoraRtcEngine.muteAllRemoteAudioStreams}: Whether to subscribe to and play all remote audio streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableAudio(): number;
  /**
   * Disables/Re-enables the local audio function.
   *
   * The audio function is enabled by default. This method disables or re-enables the local audio function, that is,
   * to stop or restart local audio capturing.
   *
   * This method does not affect receiving or playing the remote audio streams,and `enableLocalAudio(false)` is
   * applicable to scenarios where the user wants to receive remote audio streams without sending any audio stream to
   * other users in the channel.
   *
   * Once the local audio function is disabled or re-enabled, the SDK triggers the
   * [onLocalAudioStateChanged]{@link AgoraRtcEvents.onLocalAudioStateChanged} callback, which reports
   * `LOCAL_AUDIO_STREAM_STATE_STOPPED(0)` or `LOCAL_AUDIO_STREAM_STATE_RECORDING(1)`.
   *
   * **Note**
   *
   * This method is different from the [muteLocalAudioStream]{@link AgoraRtcEngine.muteLocalAudioStream} method:
   *   - `enableLocalAudio: Disables/Re-enables the local audio capturing and processing. If you disable or re-enable
   * local audio recording using the `enableLocalAudio` method, the local user may hear a pause in the remote audio
   * playback.
   *   - [muteLocalAudioStream]{@link AgoraRtcEngine.muteLocalAudioStream}: Sends/Stops sending the local audio streams.
   *
   * @param enabled Sets whether to disable/re-enable the local audio function:
   * - true: (Default) Re-enable the local audio function, that is, to start the local audio capturing device
   * (for example, the microphone).
   * - false: Disable the local audio function, that is, to stop local audio capturing.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableLocalAudio(enabled: boolean): number;
  /**
   * Disables the audio module.
   *
   * **Note**
   *
   * - This method affects the internal engine and can be called after the [leaveChannel]{@link AgoraRtcEngine.leaveChannel}
   * method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the
   * [enableLocalAudio]{@link AgoraRtcEngine.enableLocalAudio} and [muteLocalAudioStream]{@link AgoraRtcEngine.muteLocalAudioStream}
   * methods to capture, process, and send the local audio streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function disableAudio(): number;
  /**
   * Sets the audio parameters and application scenarios.
   *
   * **Note**
   *
   * - The `setAudioProfile` method must be called before the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   * - In the `COMMUNICATION` and `LIVE_BROADCASTING` profiles, the bitrate may be different from your settings due
   * to network self-adaptation.
   * - In scenarios requiring high-quality audio, for example, a music teaching scenario, we recommend setting
   * `profile` as `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` and `scenario` as `AUDIO_SCENARIO_GAME_STREAMING(3)`.
   *
   * @param  profile Sets the sample rate, bitrate, encoding mode, and the number of channels. See
   * [AUDIO_PROFILE_TYPE]{@link AgoraRtcEngine.AUDIO_PROFILE_TYPE}.
   * @param  scenario Sets the audio application scenario. See [AUDIO_SCENARIO_TYPE]{@link AgoraRtcEngine.AUDIO_SCENARIO_TYPE}.
   * Under different audio scenarios, the device uses different volume tracks, i.e. either the in-call volume or
   * the media volume. For details, see
   * [What is the difference between the in-call volume and the media volume?](https://docs.AgoraRtcEngine.io/en/faq/system_volume).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setAudioProfile(profile: AUDIO_PROFILE_TYPE, scenario: AUDIO_SCENARIO_TYPE): number;
  /**
   * Stops/Resumes sending the local audio stream.
   *
   * A successful `muteLocalAudioStream` method call triggers the [onUserMuteAudio]{@link AgoraRtcEvents.onUserMuteAudio}
   * callback on the remote client.
   *
   * **Note**
   *
   * - When `mute` is set as `true`, this method does not disable the microphone, which does not affect any ongoing recording.
   * - If you call [setChannelProfile]{@link AgoraRtcEngine.setChannelProfile} after this method, the SDK resets whether or not to mute
   * the local audio according to the channel profile and user role. Therefore, we recommend calling this method after the
   * `setChannelProfile` method.
   *
   * @param mute Sets whether to send or stop sending the local audio stream:
   * - true: Stops sending the local audio stream.
   * - false: (Default) Sends the local audio stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteLocalAudioStream(mute: boolean): number;
  /**
   * Stops/Resumes receiving all remote users' audio streams.
   *
   * @param mute Sets whether to receive or stop receiving all remote users' audio streams.
   * - true: Stops receiving all remote users' audio streams.
   * - false: (Default) Receives all remote users' audio streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteAllRemoteAudioStreams(mute: boolean): number;
  /**
   * Stops/Resumes receiving all remote users' audio streams by default.
   *
   * You can call this method either before or after joining a channel. If you call `setDefaultMuteAllRemoteAudioStreams (true)`
   * after joining a channel, the remote audio streams of all subsequent users are not received.
   *
   * @note If you want to resume receiving the audio stream, call [muteRemoteAudioStream(false)]{@link AgoraRtcEngine.muteRemoteAudioStream},
   * and specify the ID of the remote user whose audio stream you want to receive. To receive the audio streams of multiple remote
   * users, call `muteRemoteAudioStream(false)` as many times. Calling `setDefaultMuteAllRemoteAudioStreams (false)` resumes
   * receiving the audio streams of subsequent users only.
   *
   * @param mute Sets whether to receive/stop receiving all remote users' audio streams by default:
   * - true:  Stops receiving all remote users' audio streams by default.
   * - false: (Default) Receives all remote users' audio streams by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setDefaultMuteAllRemoteAudioStreams(mute: boolean): number;
  /**
   * Adjusts the playback volume of a specified remote user.
   *
   * You can call this method as many times as necessary to adjust the playback volume of different remote users, or to
   * repeatedly adjust the playback volume of the same remote user.
   *
   * **Note**
   *
   * - Call this method after joining a channel.
   * - The playback volume here refers to the mixed volume of a specified remote user.
   * - This method can only adjust the playback volume of one specified remote user at a time. To adjust the playback volume of
   * different remote users, call the method as many times, once for each remote user.
   *
   * @param uid The ID of the remote user.
   * @param volume The playback volume of the specified remote user. The value ranges from 0 to 100:
   * - 0: Mute.
   * - 100: Original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustUserPlaybackSignalVolume(uid: number, volume: number): number;
  /**
   * Stops/Resumes receiving a specified remote user's audio stream.
   *
   * @note If you called the [muteAllRemoteAudioStreams]{@link AgoraRtcEngine.muteAllRemoteAudioStreams} method and set `mute`
   * as `true` to stop receiving all remote users' audio streams, call the `muteAllRemoteAudioStreams` method and set
   * `mute` as `false` before calling this method. The `muteAllRemoteAudioStreams` method sets all remote audio
   * streams, while the `muteAllRemoteAudioStreams` method sets a specified remote audio stream.
   *
   * @param userId User ID of the specified remote user sending the audio.
   * @param mute Sets whether to receive/stop receiving a specified remote user's audio stream:
   * - true: Stops receiving the specified remote user's audio stream.
   * - false: (Default) Receives the specified remote user's audio stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteRemoteAudioStream(userId: number, mute: boolean): number;
  /**
   * Stops/Resumes sending the local video stream.
   *
   * A successful `muteLocalVideoStream` method call triggers the
   * [onUserMuteVideo]{@link AgoraRtcEvents.onUserMuteVideo} callback on the remote client.
   *
   * **Note**
   *
   * - When set to `true`, this method does not disable the camera which does not affect the retrieval of the local
   * video streams. This method executes faster than the [enableLocalVideo]{@link AgoraRtcEngine.enableLocalVideo} method
   * which controls the sending of the local video stream.
   * - If you call [setChannelProfile]{@link AgoraRtcEngine.setChannelProfile} after this method, the SDK resets whether or
   * not to mute the local video according to the channel profile and user role. Therefore, we recommend calling
   * this method after the `setChannelProfile` method.
   *
   * @param mute Sets whether to send/stop sending the local video stream:
   * - true: Stop sending the local video stream.
   * - false: (Default) Send the local video stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteLocalVideoStream(mute: boolean): number;
  /**
   * Enables/Disables the local video capture.
   *
   * This method disables or re-enables the local video capturer, and does not affect receiving the remote video stream.
   *
   * After you call the [enableVideo]{@link AgoraRtcEngine.enableVideo} method, the local video capturer is enabled by default.
   * You can call `enableLocalVideo(false)` to disable the local video capturer. If you want to re-enable it, call
   * `[enableLocalVideo(true)`.
   *
   * After the local video capturer is successfully disabled or re-enabled, the SDK triggers the
   * [onUserEnableLocalVideo]{@link AgoraRtcEvents.onUserEnableLocalVideo} callback on the remote client.
   *
   * @note This method affects the internal engine and can be called after the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method.
   *
   * @param enabled Sets whether to disable/re-enable the local video, including the capturer, renderer, and sender:
   * - true: (Default) Re-enable the local video.
   * - false: Disable the local video. Once the local video is disabled, the remote users can no longer receive the
   * video stream of this user, while this user can still receive the video streams of the other remote users.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableLocalVideo(enabled: boolean): number;
  /**
   * Stops/Resumes receiving all video stream from a specified remote user.
   *
   * @param  mute Sets whether to receive/stop receiving all remote users' video streams:
   * - true: Stop receiving all remote users' video streams.
   * - false: (Default) Receive all remote users' video streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteAllRemoteVideoStreams(mute: boolean): number;
  /**
   * Stops/Resumes receiving all remote users' video streams by default.
   *
   * You can call this method either before or after joining a channel. If you call `setDefaultMuteAllRemoteVideoStreams (true)`
   * after joining a channel, the remote video streams of all subsequent users are not received.
   *
   * @note If you want to resume receiving the video stream, call [muteRemoteVideoStream(false)]{@link AgoraRtcEngine.muteRemoteVideoStream},
   * and specify the ID of the remote user whose video stream you want to receive. To receive the video streams of multiple
   * remote users, call `muteRemoteVideoStream(false)` as many times. Calling `setDefaultMuteAllRemoteVideoStreams(false)`
   * resumes receiving the video streams of subsequent users only.
   *
   * @param mute Sets whether to receive/stop receiving all remote users' video streams by default:
   * - true: Stop receiving all remote users' video streams by default.
   * - false: (Default) Receive all remote users' video streams by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setDefaultMuteAllRemoteVideoStreams(mute: boolean): number;
  /**
   * Stops/Resumes receiving the video stream from a specified remote user.
   *
   * @note If you called the [muteAllRemoteVideoStreams]{@link AgoraRtcEngine.muteAllRemoteVideoStreams} method and set `mute`
   * as `true` to stop receiving all remote video streams, call the `muteAllRemoteVideoStreams` method and set `mute`
   * as `false` before calling this method.
   *
   * @param userId User ID of the specified remote user.
   * @param mute Sets whether to stop/resume receiving the video stream from a specified remote user:
   * - true: Stop receiving the specified remote user's video stream.
   * - false: (Default) Receive the specified remote user's video stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function muteRemoteVideoStream(userId: number, mute: boolean): number;
  /**
   * Sets the stream type of the remote video.
   *
   * Under limited network conditions, if the publisher has not disabled the dual-stream mode using `enableDualStreamMode(false)`,
   * the receiver can choose to receive either the high-quality video stream (the high resolution, and high bitrate video stream) or
   * the low-video stream (the low resolution, and low bitrate video stream).
   *
   * By default, users receive the high-quality video stream. Call this method if you want to switch to the low-video stream.
   * This method allows the app to adjust the corresponding video stream type based on the size of the video window to
   * reduce the bandwidth and resources.
   *
   * The aspect ratio of the low-video stream is the same as the high-quality video stream. Once the resolution of the high-quality
   * video stream is set, the system automatically sets the resolution, frame rate, and bitrate of the low-video stream.
   *
   * The method result returns in the [onApiCallExecuted]{@link AgoraRtcEvents.onApiCallExecuted} callback.
   *
   * @param userId ID of the remote user sending the video stream.
   * @param streamType  Sets the video-stream type. See [REMOTE_VIDEO_STREAM_TYPE]{@link AgoraRtcEngine.REMOTE_VIDEO_STREAM_TYPE}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteVideoStreamType(userId: number, streamType: REMOTE_VIDEO_STREAM_TYPE): number;
  /**
   * Sets the default stream type of remote videos.
   *
   * Under limited network conditions, if the publisher has not disabled the dual-stream mode using `enableDualStreamMode(false)`,
   * the receiver can choose to receive either the high-quality video stream (the high resolution, and high bitrate video stream) or
   * the low-video stream (the low resolution, and low bitrate video stream).
   *
   * By default, users receive the high-quality video stream. Call this method if you want to switch to the low-video stream.
   *
   * This method allows the app to adjust the corresponding video stream type based on the size of the video window to
   * reduce the bandwidth and resources. The aspect ratio of the low-video stream is the same as the high-quality video stream.
   * Once the resolution of the high-quality video stream is set, the system automatically sets the resolution, frame rate,
   * and bitrate of the low-video stream.
   *
   * The method result returns in the [onApiCallExecuted]{@link AgoraRtcEvents.onApiCallExecuted} callback.
   *
   * @param streamType Sets the default video-stream type. See [REMOTE_VIDEO_STREAM_TYPE]{@link AgoraRtcEngine.REMOTE_VIDEO_STREAM_TYPE}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteDefaultVideoStreamType(streamType: REMOTE_VIDEO_STREAM_TYPE): number;
  /**
   * Enables the [onAudioVolumeIndication]{@link AgoraRtcEvents.onAudioVolumeIndication} callback at a set time interval
   * to report on which users are speaking and the speakers' volume.
   *
   * Once this method is enabled, the SDK returns the volume indication in the
   * [onAudioVolumeIndication]{@link AgoraRtcEvents.onAudioVolumeIndication} callback at the set time interval, whether
   * or not any user is speaking in the channel.
   *
   * @param interval Sets the time interval between two consecutive volume indications:
   * - &le; 0: Disables the volume indication.
   * - &gt; 0: Time interval (ms) between two consecutive volume indications. We recommend setting `interval` &gt; 200 ms.
   * Do not set `interval` &lt; 10 ms, or the `onAudioVolumeIndication` callback will not be triggered.
   * @param smooth  Smoothing factor sets the sensitivity of the audio volume indicator. The value ranges between
   * 0 and 10. The greater the value, the more sensitive the indicator. The recommended value is 3.
   * @param report_vad - true: Enable the voice activity detection of the local user. Once it is enabled, the `vad`
   * parameter of the `onAudioVolumeIndication` callback reports the voice activity status of the local user.
   * - false: (Default) Disable the voice activity detection of the local user. Once it is disabled, the `vad`
   * parameter of the `onAudioVolumeIndication` callback does not report the voice activity status of the local user,
   * except for the scenario where the engine automatically detects the voice activity of the local user.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableAudioVolumeIndication(interval: number, smooth: number, report_vad: boolean): number;
  /**
   * Starts an audio recording on the client.
   *
   * The SDK allows recording during a call. After successfully calling this method, you can record the audio of all
   * the users in the channel and get an audio recording file.
   *
   * Supported formats of the recording file are as follows:
   * - .wav: Large file size with high fidelity.
   * - .aac: Small file size with low fidelity.
   *
   * **Note**
   *
   * - Ensure that the directory you use to save the recording file exists and is writable.
   * - This method is usually called after the `joinChannel` method. The recording automatically stops when you call
   * the `leaveChannel` method.
   * - For better recording effects, set quality as
   * [AUDIO_RECORDING_QUALITY_MEDIUM]{@link AgoraRtcEngine.AUDIO_RECORDING_QUALITY_TYPE.AUDIO_RECORDING_QUALITY_MEDIUM} or
   * [AUDIO_RECORDING_QUALITY_HIGH]{@link AgoraRtcEngine.AUDIO_RECORDING_QUALITY_TYPE.AUDIO_RECORDING_QUALITY_HIGH} when
   * `sampleRate` is 44.1 kHz or 48 kHz.
   *
   * @param filePath The absolute file path of the recording file. The string of the file name is in UTF-8, such as
   * /dir1/dir2/dir3/audio.aac.
   * @param quality Sets the audio recording quality. See
   * [AUDIO_RECORDING_QUALITY_TYPE]{@link AgoraRtcEngine.AUDIO_RECORDING_QUALITY_TYPE}.
   * @param sampleRate Sample rate (Hz) of the recording file. Supported values are as follows:
   * - 16000
   * - (Default) 32000
   * - 44100
   * - 48000
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startAudioRecording(filePath: string, quality: AUDIO_RECORDING_QUALITY_TYPE, sampleRate?: number): number;
  /**
   * Stops an audio recording on the client.
   *
   * You can call this method before calling the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method else, the
   * recording automatically stops when the `leaveChannel` method is called.
   *
   * @return
   * - 0: Success
   * - < 0: Failure.
   */
  function stopAudioRecording(): number;
  /**
   * Starts playing and mixing the music file.
   *
   * This method mixes the specified local audio file with the audio stream from the microphone, or replaces the
   * microphone's audio stream with the specified local audio file. You can choose whether the other user can hear
   * the local audio playback and specify the number of playback loops. This method also supports online music
   * playback.
   *
   * When the audio mixing file playback finishes after calling this method, the SDK triggers the
   * [onAudioMixingFinished]{@link AgoraRtcEvents.onAudioMixingFinished} callback.
   *
   * A successful `startAudioMixing` method call triggers the
   * [onAudioMixingStateChanged]{@link AgoraRtcEvents.onAudioMixingStateChanged}(PLAY) callback on the local client.
   *
   * When the audio mixing file playback finishes, the SDK triggers the `onAudioMixingStateChanged(STOPPED)`
   * callback on the local client.
   *
   * **Note**
   *
   * - Call this method after joining a channel, otherwise issues may occur.
   * - If the local audio mixing file does not exist, or if the SDK does not support the file format or cannot
   * access the music file URL, the SDK returns `WARN_AUDIO_MIXING_OPEN_ERROR(-701)`.
   * - If you want to play an online music file, ensure that the time interval between calling this method is more
   * than 100 ms, or the `AUDIO_MIXING_ERROR_TOO_FREQUENT_CALL(702)` error code occurs.
   *
   * @param filePath The absolute path (including the suffixes of the filename) of the local or online audio file to
   * mix, for example, c:\music\audio.mp4. Supported audio formats: 3GP, ASF, ADTS, AVI, MP3, MP4, MPEG-4, SAMI, and
   * WAVE. For more information, see [Supported Media Formats in Media Foundation](https://docs.microsoft.com/en-us/windows/desktop/medfound/supported-media-formats-in-media-foundation).
   * @param loopback Sets which user can hear the audio mixing:
   * - true: Only the local user can hear the audio mixing.
   * - false: Both users can hear the audio mixing.
   * @param replace Sets the audio mixing content:
   * - true: Only publish the specified audio file. The audio stream from the microphone is not published.
   * - false: The local audio file is mixed with the audio stream from the microphone.
   * @param cycle Sets the number of playback loops:
   * - Positive integer: Number of playback loops.
   * - `-1`: Infinite playback loops.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startAudioMixing(filePath: string, loopback: boolean, replace: boolean, cycle: number): number;
  /**
   * Stops playing and mixing the music file.
   *
   * Call this method when you are in a channel.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopAudioMixing(): number;
  /**
   * Pauses playing and mixing the music file.
   *
   * Call this method when you are in a channel.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function pauseAudioMixing(): number;
  /**
   * Resumes playing and mixing the music file.
   *
   * Call this method when you are in a channel.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function resumeAudioMixing(): number;
  /**
   * Sets the high-quality audio preferences.
   *
   * @deprecated This callback is deprecated.
   *
   * Call this method and set all parameters before joining a channel.
   * Do not call this method again after joining a channel.
   *
   * @param fullband Sets whether to enable/disable full-band codec (48-kHz sample rate). Not compatible with SDK
   * versions before v1.7.4:
   * - true: Enable full-band codec.
   * - false: Disable full-band codec.
   * @param  stereo Sets whether to enable/disable stereo codec. Not compatible with SDK versions before v1.7.4:
   * - true: Enable stereo codec.
   * - false: Disable stereo codec.
   * @param fullBitrate Sets whether to enable/disable high-bitrate mode. Recommended in voice-only mode:
   * - true: Enable high-bitrate mode.
   * - false: Disable high-bitrate mode.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setHighQualityAudioParameters(fullband: boolean, stereo: boolean, fullBitrate: boolean): number;
  /**
   * Adjusts the volume during audio mixing.
   *
   * Call this method when you are in a channel.
   *
   * @note Calling this method does not affect the volume of audio effect file playback invoked by the
   * [playEffect]{@link AgoraRtcEngine.playEffect} method.
   *
   * @param volume Audio mixing volume. The value ranges between 0 and 100 (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustAudioMixingVolume(volume: number): number;
  /**
   * Adjusts the audio mixing volume for local playback.
   *
   * @note Call this method when you are in a channel.
   *
   * @param volume Audio mixing volume for local playback. The value ranges between 0 and 100 (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustAudioMixingPlayoutVolume(volume: number): number;
  /**
   * Retrieves the audio mixing volume for local playback.
   *
   * This method helps troubleshoot audio volume related issues.
   *
   * @note Call this method when you are in a channel.
   *
   * @return
   * - &ge; 0: The audio mixing volume, if this method call succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  function getAudioMixingPlayoutVolume(): number;
  /**
   * Adjusts the audio mixing volume for publishing (for remote users).
   *
   * @note Call this method when you are in a channel.
   *
   * @param volume Audio mixing volume for publishing. The value ranges between 0 and 100 (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustAudioMixingPublishVolume(volume: number): number;
  /**
   * Retrieves the audio mixing volume for publishing.
   *
   * This method helps troubleshoot audio volume related issues.
   *
   * @note Call this method when you are in a channel.
   *
   * @return
   * - &ge; 0: The audio mixing volume for publishing, if this method call succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  function getAudioMixingPublishVolume(): number;
  /**
   * Retrieves the duration (ms) of the music file.
   *
   * Call this method when you are in a channel.
   *
   * @return
   * - &ge; 0: The audio mixing duration, if this method call succeeds.
   * - < 0: Failure.
   */
  function getAudioMixingDuration(): number;
  /**
   * Retrieves the playback position (ms) of the music file.
   *
   * Call this method when you are in a channel.
   *
   * @return
   * - &ge; 0: The current playback position of the audio mixing, if this method call succeeds.
   * - < 0: Failure.
   */
  function getAudioMixingCurrentPosition(): number;
  /**
   * Sets the playback position of the music file to a different starting position (the default plays from the beginning).
   *
   * @param pos The playback starting position (ms) of the music file.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setAudioMixingPosition(pos: number): number;
  /**
   * Sets the pitch of the local music file.
   *
   * When a local music file is mixed with a local human voice, call this method to set the pitch of the local music file only.
   *
   * @note Call this method after calling [startAudioMixing]{@link AgoraRtcEngine.startAudioMixing}.
   *
   * @param pitch Sets the pitch of the local music file by chromatic scale. The default value is 0,
   * which means keeping the original pitch. The value ranges from -12 to 12, and the pitch value between
   * consecutive values is a chromatic value. The greater the absolute value of this parameter, the
   * higher or lower the pitch of the local music file.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setAudioMixingPitch(pitch: number): number;
  /**
   * Retrieves the volume of the audio effects.
   *
   * The value ranges between 0.0 and 100.0.
   *
   * @return
   * - &ge; 0: Volume of the audio effects, if this method call succeeds.
   * - < 0: Failure.
   */
  function getEffectsVolume(): number;
  /**
   * Sets the volume of the audio effects.
   *
   * @param volume Sets the volume of the audio effects. The value ranges between 0 and 100 (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setEffectsVolume(volume: number): number;
  /**
   * Sets the volume of a specified audio effect.
   *
   * @param soundId ID of the audio effect. Each audio effect has a unique ID.
   * @param volume Sets the volume of the specified audio effect. The value ranges between 0 and 100 (default).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setVolumeOfEffect(soundId: number, volume: number): number;
  /**
   * Enables/Disables face detection for the local user.
   *
   * Once face detection is enabled, the SDK triggers the
   * [onFacePositionChanged]{@link AgoraRtcEvents.onFacePositionChanged} callback to report the face information of the
   * local user, which includes the following aspects:
   * - The width and height of the local video.
   * - The position of the human face in the local video.
   * - The distance between the human face and the device screen.
   *
   * @param enabled Determines whether to enable the face detection function for the local user:
   * - true: Enable face detection.
   * - false: (Default) Disable face detection.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableFaceDetection(enabled: boolean): number;
  /**
   * Plays a specified local or online audio effect file.
   *
   * This method allows you to set the loop count, pitch, pan, and gain of the audio effect file, as well as whether
   * the remote user can hear the audio effect.
   *
   * To play multiple audio effect files simultaneously, call this method multiple times with different soundIds and
   * filePaths. We recommend playing no more than three audio effect files at the same time.
   *
   * @param soundId ID of the specified audio effect. Each audio effect has a unique ID.
   *
   * @note If the audio effect is preloaded into the memory through the [preloadEffect]{@link AgoraRtcEngine.preloadEffect}
   * method, the value of `soundID` must be the same as that in the `preloadEffect` method.
   * @param filePath Specifies the absolute path (including the suffixes of the filename) to the local audio effect
   * file or the URL of the online audio effect file, for example, c:/music/audio.mp4. Supported audio formats: mp3,
   * mp4, m4a, aac, 3gp, mkv and wav.
   * @param loopCount Sets the number of times the audio effect loops:
   * - 0: Play the audio effect once.
   * - 1: Play the audio effect twice.
   * - -1: Play the audio effect in an indefinite loop until the [stopEffect]{@link AgoraRtcEngine.stopEffect} or
   * [stopAllEffects]{@link AgoraRtcEngine.stopAllEffects} method is called.
   * @param pitch Sets the pitch of the audio effect. The value ranges between 0.5 and 2. The default value is 1
   * (no change to the pitch). The lower the value, the lower the pitch.
   * @param pan Sets the spatial position of the audio effect. The value ranges between -1.0 and 1.0:
   * - 0.0: The audio effect displays ahead.
   * - 1.0: The audio effect displays to the right.
   * - -1.0: The audio effect displays to the left.
   * @param gain  Sets the volume of the audio effect. The value ranges between 0 and 100 (default). The lower the
   * value, the lower the volume of the audio effect.
   * @param publish Sets whether or not to publish the specified audio effect to the remote stream:
   * - true: The locally played audio effect is published to the Agora Cloud and the remote users can hear it.
   * - false: The locally played audio effect is not published to the Agora Cloud and the remote users cannot hear it.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function playEffect(soundId: number, filePath: string, loopCount: number, pitch: number, pan: number, gain: number, publish: Boolean): number;
  /**
   * Stops playing a specified audio effect.
   *
   * @param soundId ID of the audio effect to stop playing. Each audio effect has a unique ID.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopEffect(soundId: number): number;
  /**
   * Stops playing all audio effects.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopAllEffects(): number;
  /**
   * Preloads a specified audio effect file into the memory.
   *
   * To ensure smooth communication, limit the size of the audio effect file. We recommend using this method to
   * preload the audio effect before calling the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   * Supported audio formats: mp3, aac, m4a, 3gp, and wav.
   *
   * @note This method does not support online audio effect files.
   *
   * @param soundId ID of the audio effect. Each audio effect has a unique ID.
   * @param filePath The absolute path of the audio effect file.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function preloadEffect(soundId: number, filePath: string): number;
  /**
   * Releases a specified preloaded audio effect from the memory.
   *
   * @param soundId ID of the audio effect. Each audio effect has a unique ID.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function unloadEffect(soundId: number): number;
  /**
   * Pauses a specified audio effect.
   *
   * @param soundId ID of the audio effect. Each audio effect has a unique ID.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function pauseEffect(soundId: number): number;
  /**
   * Pauses all audio effects.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function pauseAllEffects(): number;
  /**
   * Resumes playing a specified audio effect.
   *
   * @param soundId ID of the audio effect. Each audio effect has a unique ID.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function resumeEffect(soundId: number): number;
  /**
   * Resumes playing all audio effects.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function resumeAllEffects(): number;
  /**
   * Enables/Disables stereo panning for remote users.
   *
   * Ensure that you call this method before [joinChannel]{@link AgoraRtcEngine.joinChannel} to enable stereo panning for
   * remote users so that the local user can track the position of a remote user by calling
   * [setRemoteVoicePosition]{@link AgoraRtcEngine.setRemoteVoicePosition}.
   *
   * @param enabled Sets whether or not to enable stereo panning for remote users:
   * - true: enables stereo panning.
   * - false: disables stereo panning.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableSoundPositionIndication(enabled: boolean): number;
  /**
   * Sets the sound position and gain of a remote user.
   *
   * When the local user calls this method to set the sound position of a remote user, the sound difference between
   * the left and right channels allows the local user to track the real-time position of the remote user, creating
   * a real sense of space. This method applies to massively multiplayer online games, such as Battle Royale games.
   *
   * **Note**
   *
   * - For this method to work, enable stereo panning for remote users by calling the
   * [enableSoundPositionIndication]{@link AgoraRtcEngine.enableSoundPositionIndication} method before joining a channel.
   * - This method requires hardware support. For the best sound positioning, we recommend using a stereo speaker.
   *
   * @param uid The ID of the remote user.
   * @param pan The sound position of the remote user. The value ranges from -1.0 to 1.0:
   * - 0.0: the remote sound comes from the front.
   * - -1.0: the remote sound comes from the left.
   * - 1.0: the remote sound comes from the right.
   * @param gain Gain of the remote user. The value ranges from 0.0 to 100.0. The default value is 100.0
   * (the original gain of the remote user). The smaller the value, the less the gain.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteVoicePosition(uid: number, pan: number, gain: number): number;
  /**
   * Changes the voice pitch of the local speaker.
   *
   * @param pitch Sets the voice pitch. The value ranges between 0.5 and 2.0. The lower the value, the lower the
   * voice pitch. The default value is 1.0 (no change to the local voice pitch).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalVoicePitch(pitch: number): number;
  /**
   * Sets the local voice equalization effect.
   *
   * @param bandFrequency Sets the band frequency. The value ranges between 0 and 9, representing the respective
   * 10-band center frequencies of the voice effects, including 31, 62, 125, 250, 500, 1k, 2k, 4k, 8k, and 16k Hz. See
   * [AUDIO_EQUALIZATION_BAND_FREQUENCY]{@link AgoraRtcEngine.AUDIO_EQUALIZATION_BAND_FREQUENCY}.
   * @param bandGain Sets the gain of each band in dB. The value ranges between -15 and 15.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalVoiceEqualization(bandFrequency: AUDIO_EQUALIZATION_BAND_FREQUENCY, bandGain: number): number;
  /**
   * Sets the local voice reverberation.
   *
   * You can also use [setLocalVoiceReverbPreset]{@link AgoraRtcEngine.setLocalVoiceReverbPreset} to use the preset reverberation effect,
   * such as pop music, R&B or rock music effects.
   *
   * @param reverbKey Sets the reverberation key. See [AUDIO_REVERB_TYPE]{@link AgoraRtcEngine.AUDIO_REVERB_TYPE}.
   * @param value Sets the value of the reverberation key.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalVoiceReverb(reverbKey: AUDIO_REVERB_TYPE, value: number): number;
  /**
   * Sets the local voice changer option.
   *
   * This method can be used to set the local voice effect for users in a `COMMUNICATION` channel or hosts in a
   * `LIVE_BROADCASTING` channel.
   *
   * Voice changer options include the following voice effects:
   * - `VOICE_CHANGER_XXX`: Changes the local voice to an old man, a little boy, or the Hulk. Applies to the voice
   * talk scenario.
   * - `VOICE_BEAUTY_XXX`: Beautifies the local voice by making it sound more vigorous, resounding, or adding spacial
   * resonance. Applies to the voice talk and singing scenario.
   * - `GENERAL_VOICE_BEAUTY_XXX`: Adds gender-based beautification effect to the local voice. Applies to the voice
   * talk scenario.
   *   - For a male-sounding voice: Adds magnetism to the voice.
   *   - For a female-sounding voice: Adds freshness or vitality to the voice.
   *
   * **Note**
   *
   * - To achieve better voice effect quality, Agora recommends setting the profile parameter in
   * [setAudioProfile]{@link AgoraRtcEngine.setAudioProfile} as `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or
   * `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`.
   * - This method works best with the human voice, and Agora does not recommend using it for audio containing music
   * and a human voice.
   * - Do not use this method with [setLocalVoiceReverbPreset]{@link AgoraRtcEngine.setLocalVoiceReverbPreset}, because the
   * method called later overrides the one called earlier.
   *
   * @param voiceChanger Sets the local voice changer option. The default value is `VOICE_CHANGER_OFF`, which means
   * the original voice. See details in [VOICE_CHANGER_PRESET]{@link AgoraRtcEngine.VOICE_CHANGER_PRESET}.
   * Gender-based beatification effect works best only when assigned a proper gender:
   * - For a male-sounding voice: `GENERAL_BEAUTY_VOICE_MALE_MAGNETIC`.
   * - For a female-sounding voice: `GENERAL_BEAUTY_VOICE_FEMALE_FRESH` or `GENERAL_BEAUTY_VOICE_FEMALE_VITALITY`.
   *
   * Failure to do so can lead to voice distortion.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure. Check if the enumeration is properly set.
   */
  function setLocalVoiceChanger(voiceChanger: VOICE_CHANGER_PRESET): number;
  /**
   * Sets the local voice reverberation option, including the virtual stereo.
   *
   * This method sets the local voice reverberation for users in a `COMMUNICATION` channel or hosts in a `LIVE_BROADCASTING` channel.
   * After successfully calling this method, all users in the channel can hear the voice with reverberation.
   *
   * **Note**
   *
   * - When calling this method with enumerations that begin with `AUDIO_REVERB_FX`, ensure that you set profile in
   * [setAudioProfile]{@link AgoraRtcEngine.setAudioProfile} as `AUDIO_PROFILE_MUSIC_HIGH_QUALITY(4)` or
   * `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`; otherwise, this methods cannot set the corresponding voice
   * reverberation option.
   * - When calling this method with `AUDIO_VIRTUAL_STEREO`, Agora recommends setting the `profile` parameter in
   * `setAudioProfile` as `AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO(5)`.
   * - This method works best with the human voice, and Agora does not recommend using it for audio containing music
   * and a human voice.
   * - Do not use this method with [setLocalVoiceChanger]{@link AgoraRtcEngine.setLocalVoiceChanger}, because the method
   * called later overrides the one called earlier.
   *
   * @param reverbPreset The local voice reverberation option. The default value is `AUDIO_REVERB_OFF`,
   * which means the original voice.  See [AUDIO_REVERB_PRESET]{@link AgoraRtcEngine.AUDIO_REVERB_PRESET}.
   * To achieve better voice effects, Agora recommends the enumeration whose name begins with `AUDIO_REVERB_FX`.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalVoiceReverbPreset(reverbPreset: AUDIO_REVERB_PRESET): number;
  /**
   * TODO
   *
   * @param preset
   */
  function setVoiceBeautifierPreset(preset: VOICE_BEAUTIFIER_PRESET): number;
  /**
   * TODO
   *
   * @param preset
   */
  function setAudioEffectPreset(preset: AUDIO_EFFECT_PRESET): number;
  /**
   * TODO
   *
   * @param preset
   * @param param1
   * @param param2
   */
  function setAudioEffectParameters(preset: AUDIO_EFFECT_PRESET, param1: number, param2: number): number;
  /**
   * Sets the log files that the SDK outputs.
   *
   * By default, the SDK outputs five log files, `agorasdk.log`, `agorasdk_1.log`, `agorasdk_2.log`, `agorasdk_3.log`,
   * `agorasdk_4.log`, each with a default size of 1024 KB.
   *
   * These log files are encoded in UTF-8. The SDK writes the latest logs in `agorasdk.log`. When `agorasdk.log` is
   * full, the SDK deletes the log file with the earliest modification time among the other four, renames
   * `agorasdk.log` to the name of the deleted log file, and create a new `agorasdk.log` to record latest logs.
   *
   * @note Ensure that you call this method immediately after calling [init]{@link AgoraRtcEngine.init}, otherwise the output
   * logs may not be complete.
   *
   * @param filePath The absolute path of log files. The default file path is as follows:
   * - Android: `/storage/emulated/0/Android/data/<package name>/files/agorasdk.log`
   * - iOS: `App Sandbox/Library/caches/agorasdk.log`
   *
   * Ensure that the directory for the log files exists and is writable. You can use this parameter to rename the log files.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLogFile(filePath: string): number;
  /**
   * Sets the output log level of the SDK.
   *
   * You can use one or a combination of the log filter levels. The log level follows the sequence of `OFF`,
   * `CRITICAL`, `ERROR`, `WARNING`, `INFO`, and `DEBUG`. Choose a level to see the logs preceding that level.
   *
   * If you set the log level to `WARNING`, you see the logs within levels `CRITICAL`, `ERROR`, and `WARNING`.
   *
   * @param filter Sets the log filter level. See [LOG_FILTER_TYPE]{@link AgoraRtcEngine.LOG_FILTER_TYPE}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLogFilter(filter: LOG_FILTER_TYPE): number;
  /**
   * Sets the size of a log file that the SDK outputs.
   *
   * By default, the SDK outputs five log files, `agorasdk.log`, `agorasdk_1.log`, `agorasdk_2.log`, `agorasdk_3.log`,
   * `agorasdk_4.log`, each with a default size of 1024 KB.
   *
   * These log files are encoded in UTF-8. The SDK writes the latest logs in `agorasdk.log`. When `agorasdk.log` is
   * full, the SDK deletes the log file with the earliest modification time among the other four, renames
   * `agorasdk.log` to the name of the deleted log file, and create a new `agorasdk.log` to record latest logs.
   *
   * @param fileSizeInKBytes The size (KB) of a log file. The default value is 1024 KB. If you set `fileSizeInKByte`
   * to 1024 KB, the SDK outputs at most 5 MB log files; if you set it to less than 1024 KB, the maximum size of a
   * log file is still 1024 KB.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLogFileSize(fileSizeInKBytes: number): number;
  /**
   * @ignore
   * Updates the display mode of the local video view.
   *
   * After initializing the local video view, you can call this method to update its rendering and mirror modes. It
   * affects only the video view that the local user sees, not the published local video stream.
   *
   * **Note**
   *
   * - Ensure that you have called the [setupLocalVideo]{@link AgoraRtcEngine.setupLocalVideo} method to initialize the local
   * video view before calling this method.
   * - During a call, you can call this method as many times as necessary to update the display mode of the local
   * video view.
   *
   * @param renderMode The rendering mode of the local video view. See [RENDER_MODE_TYPE]{@link AgoraRtcEngine.RENDER_MODE_TYPE}.
   * @param mirrorMode The mirror mode of the local video view. See [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
   *
   * **Note**
   *
   * If you use a front camera, the SDK enables the mirror mode by default; if you use a rear camera, the SDK
   * disables the mirror mode by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalRenderMode(renderMode: RENDER_MODE_TYPE, mirrorMode?: VIDEO_MIRROR_MODE_TYPE): number;
  /**
   * @ignore
   * Updates the display mode of the video view of a remote user.
   *
   * After initializing the video view of a remote user, you can call this method to update its rendering and mirror
   * modes. This method affects only the video view that the local user sees.
   *
   * **Note**
   *
   * - Ensure that you have called the [setupRemoteVideo]{@link AgoraRtcEngine.setupRemoteVideo} method to initialize the
   * remote video view before calling this method.
   * - During a call, you can call this method as many times as necessary to update the display mode of the video
   * view of a remote user.
   *
   * @param userId The ID of the remote user.
   * @param renderMode The rendering mode of the remote video view. See [RENDER_MODE_TYPE]{@link AgoraRtcEngine.RENDER_MODE_TYPE}.
   * @param mirrorMode The mirror mode of the remote video view. See [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
   *
   * **Note**
   *
   * The SDK disables the mirror mode by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteRenderMode(userId: number, renderMode: RENDER_MODE_TYPE, mirrorMode?: VIDEO_MIRROR_MODE_TYPE): number;
  /**
   * @ignore
   * Sets the local video mirror mode.
   *
   * @deprecated This method is deprecated, use the [setupLocalVideo]{@link AgoraRtcEngine.setupLocalVideo} or
   * [setLocalRenderMode]{@link AgoraRtcEngine.setLocalRenderMode} method instead.
   *
   * You must call this method before calling the [startPreview]{@link AgoraRtcEngine.startPreview} method, otherwise the
   * mirror mode will not work.
   *
   * **Warning**
   * - Call this method after calling the `setupLocalVideo` method to initialize the local video view.
   * - During a call, you can call this method as many times as necessary to update the mirror mode of the local video view.
   *
   * @param mirrorMode Sets the local video mirror mode. See [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalVideoMirrorMode(mirrorMode: VIDEO_MIRROR_MODE_TYPE): number;
  /**
   * Sets the stream mode to the single-stream (default) or dual-stream mode. (`LIVE_BROADCASTING` only.)
   *
   * If the dual-stream mode is enabled, the receiver can choose to receive the high stream (high-resolution and
   * high-bitrate video stream), or the low stream (low-resolution and low-bitrate video stream).
   *
   * @param enabled Sets the stream mode:
   * - true: Dual-stream mode.
   * - false: Single-stream mode.
   */
  function enableDualStreamMode(enabled: boolean): number;
  /**
   * @ignore
   * Sets the external audio source. Please call this method before [joinChannel]{@link AgoraRtcEngine.joinChannel}.
   *
   * @param enabled Sets whether to enable/disable the external audio source:
   * - true: Enables the external audio source.
   * - false: (Default) Disables the external audio source.
   * @param sampleRate Sets the sample rate (Hz) of the external audio source, which can be set as 8000, 16000,
   * 32000, 44100, or 48000 Hz.
   * @param channels Sets the number of audio channels of the external audio source:
   * - 1: Mono.
   * - 2: Stereo.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setExternalAudioSource(enabled: boolean, sampleRate: number, channels: number): number;
  /**
   * @ignore
   * Sets the external audio sink.
   *
   * This method applies to scenarios where you want to use external audio
   * data for playback. After enabling the external audio sink, you can call
   * the [pullAudioFrame]{@link AgoraRtcEngine.pullAudioFrame} method to pull the
   * remote audio data, process it, and play it with the audio effects that you want.
   *
   * @note Once you enable the external audio sink, the app will not retrieve any
   * audio data from the
   * [onPlaybackAudioFrame]{@link AgoraRtcEvents.onPlaybackAudioFrame} callback.
   *
   * @param enabled
   * - true: Enables the external audio sink.
   * - false: (Default) Disables the external audio sink.
   * @param sampleRate Sets the sample rate (Hz) of the external audio sink,
   * which can be set as 16000, 32000, 44100 or 48000.
   * @param channels Sets the number of audio channels of the external
   * audio sink:
   * - 1: Mono.
   * - 2: Stereo.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setExternalAudioSink(enabled: boolean, sampleRate: number, channels: number): number;
  /**
   * @ignore
   * Sets the audio recording format for the [onRecordAudioFrame]{@link AgoraRtcEvents.onRecordAudioFrame} callback.
   *
   * @param sampleRate Sets the sample rate (`samplesPerSec`) returned in the onRecordAudioFrame* callback, which can be set as 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param channel Sets the number of audio channels (`channels`) returned in the *onRecordAudioFrame* callback:
   * - 1: Mono
   * - 2: Stereo
   * @param mode Sets the use mode (see [RAW_AUDIO_FRAME_OP_MODE_TYPE)]{@link AgoraRtcEngine.RAW_AUDIO_FRAME_OP_MODE_TYPE)} of the *onRecordAudioFrame* callback.
   * @param samplesPerCall Sets the number of samples returned in the *onRecordAudioFrame* callback. `samplesPerCall` is usually set as 1024 for RTMP streaming.
   * @note The SDK triggers the `onRecordAudioFrame` callback according to the sample interval. Ensure that the sample interval ≥ 0.01 (s). And, Sample interval (sec) = `samplePerCall`/(`sampleRate` × `channel`).
   * @return
   *     - 0: Success.
   * - < 0: Failure.
   */
  function setRecordingAudioFrameParameters(sampleRate: number, channel: number, mode: RAW_AUDIO_FRAME_OP_MODE_TYPE, samplesPerCall: number): number;
  /**
   * @ignore
   * Sets the audio playback format for the [onPlaybackAudioFrame]{@link AgoraRtcEngine.onPlaybackAudioFrame} callback.
   *
   * @param sampleRate Sets the sample rate (`samplesPerSec`) returned in the *onPlaybackAudioFrame* callback,
   * which can be set as 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param channel Sets the number of channels (`channels`) returned in the *onPlaybackAudioFrame* callback:
   * - 1: Mono
   * - 2: Stereo
   * @param mode Sets the use mode (see [RAW_AUDIO_FRAME_OP_MODE_TYPE)]{@link AgoraRtcEngine.RAW_AUDIO_FRAME_OP_MODE_TYPE)} of the
   * `onPlaybackAudioFrame` callback.
   * @param samplesPerCall Sets the number of samples returned in the `onPlaybackAudioFrame` callback. `samplesPerCall`
   * is usually set as 1024 for RTMP streaming.
   * @note The SDK triggers the `onPlaybackAudioFrame` callback according to the sample interval. Ensure that the sample
   * interval ≥ 0.01 (s). And, Sample interval (sec) = `samplePerCall`/(`sampleRate` × `channel`).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setPlaybackAudioFrameParameters(sampleRate: number, channel: number, mode: RAW_AUDIO_FRAME_OP_MODE_TYPE, samplesPerCall: number): number;
  /**
   * @ignore
   * Sets the mixed audio format for the [onMixedAudioFrame]{@link AgoraRtcEngine.onMixedAudioFrame} callback.
   *
   * @param sampleRate Sets the sample rate (`samplesPerSec`) returned in the `onMixedAudioFrame` callback, which can be set as
   * 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param samplesPerCall Sets the number of samples (`samples`) returned in the *onMixedAudioFrame* callback. `samplesPerCall`
   * is usually set as 1024 for RTMP streaming.
   * @note The SDK triggers the `onMixedAudioFrame` callback according to the sample interval. Ensure that the sample
   * interval ≥ 0.01 (s). And, Sample interval (sec) = `samplePerCall`/(`sampleRate` × `channels`).
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setMixedAudioFrameParameters(sampleRate: number, samplesPerCall: number): number;
  /**
   * Adjusts the recording volume.
   *
   * @param volume Recording volume. To avoid echoes and improve call quality,
   * Agora recommends setting the value of volume between 0 and 100. If you
   * need to set the value higher than 100, contact support@AgoraRtcEngine.io first.
   * - 0: Mute.
   * - 100: Original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustRecordingSignalVolume(volume: number): number;
  /**
   * Adjusts the playback volume of all remote users.
   *
   * **Note**
   *
   * - This method adjusts the playback volume that is the mixed volume of all remote users.
   * - (Since v3.1.2) To mute the local audio playback, call both the `adjustPlaybackSignalVolume` and
   * [adjustAudioMixingVolume]{@link AgoraRtcEngine.adjustAudioMixingVolume} methods and set the volume as `0`.
   *
   * @param volume The playback volume of all remote users. To avoid echoes and
   * improve call quality, Agora recommends setting the value of volume between
   * 0 and 100. If you need to set the value higher than 100, contact
   * support@AgoraRtcEngine.io first.
   * - 0: Mute.
   * - 100: Original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function adjustPlaybackSignalVolume(volume: number): number;
  /**
   * Enables interoperability with the Agora Web SDK.
   *
   * @deprecated This method is deprecated. As of v3.1.2, the Native SDK automatically enables interoperability with
   * the Web SDK, so you no longer need to call this method.
   *
   * **Note**
   *
   * - This method applies only to the `LIVE_BROADCASTING` profile. In the `COMMUNICATION` profile, interoperability
   * with the Agora Web SDK is enabled by default.
   * - If the channel has Web SDK users, ensure that you call this method, or the video of the Native user will be a
   * black screen for the Web user.
   *
   * @param enabled Sets whether to enable/disable interoperability with the Agora Web SDK:
   * - true: Enable.
   * - false: (Default) Disable.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableWebSdkInteroperability(enabled: boolean): number;
  /**
   * @ignore
   * Sets the preferences for the high-quality video. (`LIVE_BROADCASTING` only).
   *
   * @deprecated This method is deprecated. Agora recommends using the `degradationPrefer` parameter of
   * [VideoEncoderConfiguration]{@link AgoraRtcEngine.VideoEncoderConfiguration}.
   *
   * @param preferFrameRateOverImageQuality Sets the video quality preference:
   * - true: Frame rate over image quality.
   * - false: (Default) Image quality over frame rate.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number;
  /**
   * Sets the fallback option for the published video stream based on the network conditions.
   *
   * If `option` is set as
   * [STREAM_FALLBACK_OPTION_AUDIO_ONLY]{@link AgoraRtcEngine.STREAM_FALLBACK_OPTIONS.STREAM_FALLBACK_OPTION_AUDIO_ONLY}(2),
   * the SDK will:
   * - Disable the upstream video but enable audio only when the network conditions deteriorate and cannot support
   * both video and audio.
   * - Re-enable the video when the network conditions improve.
   *
   * When the published video stream falls back to audio only or when the audio-only stream switches back to the video,
   * the SDK triggers the [onLocalPublishFallbackToAudioOnly]{@link AgoraRtcEvents.onLocalPublishFallbackToAudioOnly} callback.
   *
   * @note Agora does not recommend using this method for CDN live streaming, because the remote CDN live user will
   * have a noticeable lag when the published video stream falls back to audio only.
   *
   * @param option Sets the fallback option for the published video stream. See
   * [STREAM_FALLBACK_OPTIONS]{@link AgoraRtcEngine.STREAM_FALLBACK_OPTIONS}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLocalPublishFallbackOption(option: STREAM_FALLBACK_OPTIONS): number;
  /**
   * Sets the fallback option for the remotely subscribed video stream based on the network conditions.
   *
   * The default setting for `option` is
   * [STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW]{@link AgoraRtcEngine.STREAM_FALLBACK_OPTIONS.STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW}(1),
   * where the remotely subscribed video stream falls back to the low-stream video (low resolution and low bitrate) under poor
   * downlink network conditions.
   *
   * If `option` is set as
   * [STREAM_FALLBACK_OPTION_AUDIO_ONLY]{@link AgoraRtcEngine.STREAM_FALLBACK_OPTIONS.STREAM_FALLBACK_OPTION_AUDIO_ONLY} (2), the
   * SDK automatically switches the video from a high-stream to a low-stream, or disables the video when the downlink network
   * conditions cannot support both audio and video to guarantee the quality of the audio. The SDK monitors the network quality
   * and restores the video stream when the network conditions improve.
   *
   * When the remotely subscribed video stream falls back to audio only or when the audio-only stream switches back to the video
   * stream, the SDK triggers the [onRemoteSubscribeFallbackToAudioOnly]{@link AgoraRtcEvents.onRemoteSubscribeFallbackToAudioOnly}
   * callback.
   *
   * @param  option  Sets the fallback option for the remotely subscribed video stream. See
   * [STREAM_FALLBACK_OPTIONS]{@link AgoraRtcEngine.STREAM_FALLBACK_OPTIONS}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setRemoteSubscribeFallbackOption(option: STREAM_FALLBACK_OPTIONS): number;
  /**
   * Switches between front and rear cameras.
   *
   * @param direction Sets the camera to be used. See [CAMERA_DIRECTION]{@link AgoraRtcEngine.CAMERA_DIRECTION}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function switchCamera(direction?: CAMERA_DIRECTION): number;
  /**
   * Sets the default audio playback route.
   *
   * This method sets whether the received audio is routed to the earpiece or speakerphone by default before joining a channel.
   *
   * If a user does not call this method, the audio is routed to the earpiece by default. If you need to change the default
   * audio route after joining a channel, call the [setEnableSpeakerphone]{@link AgoraRtcEngine.setEnableSpeakerphone} method.
   *
   * The default setting for each profile:
   * - `COMMUNICATION`: In a voice call, the default audio route is the earpiece. In a video call, the default audio
   * route is the speakerphone. If a user who is in the `COMMUNICATION` profile calls the
   * [disableVideo]{@link AgoraRtcEngine.disableVideo} method or if the user calls the
   * [muteLocalVideoStream]{@link AgoraRtcEngine.muteLocalVideoStream} and
   * [muteAllRemoteVideoStreams]{@link AgoraRtcEngine.muteAllRemoteVideoStreams} methods, the default audio route switches
   * back to the earpiece automatically.
   * - `LIVE_BROADCASTING`: Speakerphone.
   *
   * **Note**
   *
   * - This method is applicable only to the `COMMUNICATION` profile.
   * - For iOS, this method only works in a voice call.
   * - Call this method before calling the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   *
   * @param defaultToSpeaker Sets the default audio route:
   * - true: Route the audio to the speakerphone. If the playback device connects to the earpiece or Bluetooth, the
   * audio cannot be routed to the speakerphone.
   * - false: (Default) Route the audio to the earpiece. If a headset is plugged in, the audio is routed to the headset.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setDefaultAudioRouteToSpeakerphone(defaultToSpeaker: boolean): number;
  /**
   * Enables/Disables the audio playback route to the speakerphone.
   *
   * This method sets whether the audio is routed to the speakerphone or earpiece.
   *
   * See the default audio route explanation in the
   * [setDefaultAudioRouteToSpeakerphone]{@link AgoraRtcEngine.setDefaultAudioRouteToSpeakerphone} method and check whether it
   * is necessary to call this method.
   *
   * **Note**
   *
   * - Ensure that you have successfully called the [joinChannel]{@link AgoraRtcEngine.joinChannel} method before calling this method.
   * - After calling this method, the SDK returns the [onAudioRouteChanged]{@link AgoraRtcEvents.onAudioRouteChanged}
   * callback to indicate the changes.
   * - This method does not take effect if a headset is used.
   *
   * @param speakerOn Sets whether to route the audio to the speakerphone or earpiece:
   * - true: Route the audio to the speakerphone. If the playback device connects to the earpiece or Bluetooth, the
   * audio cannot be routed to the speakerphone.
   * - false: Route the audio to the earpiece. If a headset is plugged in, the audio is routed to the headset.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setEnableSpeakerphone(speakerOn: boolean): number;
  /**
   * Enables in-ear monitoring.
   *
   * @param enabled Determines whether to enable in-ear monitoring.
   * - true: Enable.
   * - false: (Default) Disable.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableInEarMonitoring(enabled: boolean): number;
  /**
   * Sets the volume of the in-ear monitor.
   *
   * @param volume Sets the volume of the in-ear monitor. The value ranges between 0 and 100 (default).
   *
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setInEarMonitoringVolume(volume: number): number;
  /**
   * Checks whether the speakerphone is enabled.
   *
   * @return
   * - true: The speakerphone is enabled, and the audio plays from the speakerphone.
   * - false: The speakerphone is not enabled, and the audio plays from devices other than the speakerphone. For example, the headset or earpiece.
   */
  function isSpeakerphoneEnabled(): boolean;
  /**
   * TODO
   *
   * @param restriction
   */
  function setAudioSessionOperationRestriction(restriction: AUDIO_SESSION_OPERATION_RESTRICTION): number;
  /**
   * TODO
   *
   * @param enabled
   * @param deviceName
   */
  function enableLoopbackRecording(enabled: boolean, deviceName: string): number;
  /**
   * TODO
   *
   * @param displayId
   * @param regionRect
   * @param captureParams
   */
  function startScreenCaptureByDisplayId(displayId: number, regionRect: Rectangle, captureParams: ScreenCaptureParameters): number;
  /**
   * TODO
   *
   * @param screenRect
   * @param regionRect
   * @param captureParams
   */
  function startScreenCaptureByScreenRect(screenRect: Rectangle, regionRect: Rectangle, captureParams: ScreenCaptureParameters): number;
  /**
   * TODO
   *
   * @param windowId
   * @param regionRect
   * @param captureParams
   */
  function startScreenCaptureByWindowId(windowId: number, regionRect: Rectangle, captureParams: ScreenCaptureParameters): number;
  /**
   * TODO
   *
   * @param contentHint
   */
  function setScreenCaptureContentHint(contentHint: VideoContentHint): number;
  /**
   * TODO
   *
   * @param captureParams
   */
  function updateScreenCaptureParameters(captureParams: ScreenCaptureParameters): number;
  /**
   * TODO
   *
   * @param regionRect
   */
  function updateScreenCaptureRegion(regionRect: Rectangle): number;
  /**
   * TODO
   */
  function stopScreenCapture(): number;
  /**
   * Retrieves the current call ID.
   *
   * When a user joins a channel on a client, a `callId` is generated to identify the call from the client. Feedback
   * methods, such as [rate]{@link AgoraRtcEngine.rate} and [complain]{@link AgoraRtcEngine.complain} , must be called after the call
   * ends to submit feedback to the SDK.
   *
   * The `rate` and `complain` methods require the `callId` parameter retrieved from the `getCallId` method during a
   * call. `callId` is passed as an argument into the `rate` and `complain` methods after the call ends.
   *
   * @return The current call ID.
   */
  function getCallId(): string;
  /**
   * Allows a user to rate a call after the call ends.
   *
   * @param callId The ID of the call, retrieved from the [getCallId]{@link AgoraRtcEngine.getCallId} method.
   * @param rating  Rating of the call. The value is between 1 (lowest score) and 5 (highest score). If you set a
   * value out of this range, the `ERR_INVALID_ARGUMENT(-2)` error returns.
   * @param description (Optional) The description of the rating, with a string length of less than 800 bytes.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function rate(callId: string, rating: number, description?: string): number;
  /**
   * Allows a user to complain about the call quality after a call ends.
   *
   * @param callId The ID of the call, retrieved from the [getCallId]{@link AgoraRtcEngine.getCallId} method.
   * @param description (Optional) The description of the complaint, with a string length of less than 800 bytes.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function complain(callId: string, description: string): number;
  /**
   * Retrieves the SDK version number.
   *
   * @return The version of the current SDK in the string format. For example, `"3.1.2"`.
   */
  function getVersion(): string;
  /**
   * Enables the network connection quality test.
   *
   * This method tests the quality of the users' network connections and is disabled by default.
   *
   * Before a user joins a channel or before an audience switches to a host, call this method to check the uplink network quality.
   *
   * This method consumes additional network traffic, and hence may affect communication quality.
   *
   * Call the [disableLastmileTest]{@link AgoraRtcEngine.disableLastmileTest} method to disable this test after receiving
   * the [onLastmileQuality]{@link AgoraRtcEvents.onLastmileQuality} callback, and before joining a channel.
   *
   * **Note**
   *
   * - Do not call any other methods before receiving the `onLastmileQuality` callback. Otherwise, the callback may
   * be interrupted by other methods, and hence may not be triggered.
   * - A host should not call this method after joining a channel (when in a call).
   * - If you call this method to test the last-mile quality, the SDK consumes the bandwidth of a video stream, whose
   * bitrate corresponds to the bitrate you set in the
   * [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration} method. After you join the channel,
   * whether you have called the `disableLastmileTest` method or not, the SDK automatically stops consuming the bandwidth.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function enableLastmileTest(): number;
  /**
   * Disables the network connection quality test.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function disableLastmileTest(): number;
  /**
   * Starts the last-mile network probe test.
   *
   * This method starts the last-mile network probe test before joining a channel to get the uplink and downlink last-mile network
   * statistics, including the bandwidth, packet loss, jitter, and round-trip time (RTT).
   *
   * Call this method to check the uplink network quality before users join a channel or before an audience switches to a host.
   *
   * Once this method is enabled, the SDK returns the following callbacks:
   * - [onLastmileQuality]{@link AgoraRtcEvents.onLastmileQuality}: the SDK triggers this callback within two seconds
   * depending on the network conditions. This callback rates the network conditions and is more closely linked to the user experience.
   * - [onLastmileProbeResult]{@link AgoraRtcEvents.onLastmileProbeResult}: the SDK triggers this callback within 30 seconds depending
   * on the network conditions. This callback returns the real-time statistics of the network conditions and is more objective.
   *
   * **Note**
   *
   * - This method consumes extra network traffic and may affect communication quality. We do not recommend calling this method
   * together with [enableLastmileTest]{@link AgoraRtcEngine.enableLastmileTest}.
   * - Do not call other methods before receiving the `onLastmileQuality` and `onLastmileProbeResult` callbacks. Otherwise,
   * the callbacks may be interrupted.
   * - In the `LIVE_BROADCASTING` profile, a host should not call this method after joining a channel.
   *
   * @param config Sets the configurations of the last-mile network probe test. See
   * [LastmileProbeConfig]{@link AgoraRtcEngine.LastmileProbeConfig}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startLastmileProbeTest(config: LastmileProbeConfig): number;
  /**
   * Stops the last-mile network probe test.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopLastmileProbeTest(): number;
  /**
   * Retrieves the warning or error description.
   *
   * @param code Warning code or error code returned in the [onWarning]{@link AgoraRtcEvents.onWarning} or
   * [onError]{@link AgoraRtcEvents.onError} callback.
   *
   * @return See [WARN_CODE_TYPE]{@link AgoraRtcEngine.WARN_CODE_TYPE} or [ERROR_CODE_TYPE]{@link AgoraRtcEngine.ERROR_CODE_TYPE}.
   */
  function getErrorDescription(code: number): string;
  /**
   * Enables built-in encryption with an encryption password before users join a channel.
   *
   * @deprecated This method is deprecated from v3.1.2. Use the [enableEncryption]{@link AgoraRtcEngine.enableEncryption} instead.
   *
   * All users in a channel must use the same encryption password. The encryption password is automatically cleared
   * once a user leaves the channel.
   *
   * If an encryption password is not specified, the encryption functionality will be disabled.
   *
   * **Note**
   *
   * - Do not use this method for CDN live streaming.
   * - For optimal transmission, ensure that the encrypted data size does not exceed the original data size + 16
   * bytes. 16 bytes is the maximum padding size for AES encryption.
   *
   * @param secret The encryption password.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setEncryptionSecret(secret: string): number;
  /**
   * Sets the built-in encryption mode.
   *
   * @deprecated This method is deprecated from v3.1.2. Use the [enableEncryption]{@link AgoraRtcEngine.enableEncryption} instead.
   *
   * The Agora SDK supports built-in encryption, which is set to the `aes-128-xts` mode by default. Call this method
   * to use other encryption modes.
   * All users in the same channel must use the same encryption mode and password.
   *
   * Refer to the information related to the AES encryption algorithm on the differences between the encryption modes.
   *
   * @note Call the [setEncryptionSecret]{@link AgoraRtcEngine.setEncryptionSecret} method to enable the built-in encryption
   * function before calling this method.
   *
   * @param encryptionMode The set encryption mode:
   * - "aes-128-xts": (Default) 128-bit AES encryption, XTS mode.
   * - "aes-128-ecb": 128-bit AES encryption, ECB mode.
   * - "aes-256-xts": 256-bit AES encryption, XTS mode.
   * - "": When encryptionMode is set as `null`, the encryption mode is set as "aes-128-xts" by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setEncryptionMode(encryptionMode: 'aes-128-xts' | 'aes-128-ecb' | 'aes-256-xts'): number;
  /**
   * Enables/Disables the built-in encryption.
   *
   * In scenarios requiring high security, Agora recommends calling this method to enable the built-in encryption
   * before joining a channel.
   *
   * All users in the same channel must use the same encryption mode and encryption key. Once all users leave the
   * channel, the encryption key of this channel is automatically cleared.
   *
   * **Note**
   *
   * - If you enable the built-in encryption, you cannot use the RTMP streaming function.
   * - Agora supports four encryption modes. If you choose an encryption mode (excepting `SM4_128_ECB` mode), you
   * need to add an external encryption library when integrating the Android or iOS SDK.
   *
   * @param enabled Whether to enable the built-in encryption:
   * - true: Enable the built-in encryption.
   * - false: Disable the built-in encryption.
   * @param config Configurations of built-in encryption schemas. See [EncryptionConfig]{@link AgoraRtcEngine.EncryptionConfig}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - -2(ERR_INVALID_ARGUMENT): An invalid parameter is used. Set the parameter with a valid value.
   *  - -4(ERR_NOT_SUPPORTED): The encryption mode is incorrect or the SDK fails to load the external encryption
   * library. Check the enumeration or reload the external encryption library.
   *  - -7(ERR_NOT_INITIALIZED): The SDK is not initialized. Initialize the Agora engine before calling this method.
   */
  function enableEncryption(enabled: boolean, config: EncryptionConfig): number;
  /**
   * Registers a packet observer.
   *
   * The Agora SDK allows your application to register a packet observer to receive callbacks for voice or video packet transmission.
   *
   * **Note**
   *
   * - The size of the packet sent to the network after processing should not exceed 1200 bytes, otherwise, the packet may fail to
   * be sent.
   * - Ensure that both receivers and senders call this method, otherwise, you may meet undefined behaviors such as no voice and
   * black screen.
   * - When you use CDN live streaming, recording or storage functions, Agora doesn't recommend calling this method.
   *
   * @param observer The registered packet observer.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function registerPacketObserver(observer: any): number;
  /**
   * Creates a data stream.
   *
   * Each user can create up to five data streams during the lifecycle of the Agora engine.
   *
   * @note Set both the `reliable` and `ordered` parameters to `true` or `false`. Do not set one as `true` and the other as `false`.
   *
   * @param streamId The ID of the created data stream.
   * @param reliable Sets whether or not the recipients are guaranteed to receive the data stream from the sender within five seconds:
   * - true: The recipients receive the data stream from the sender within five seconds. If the recipient does not receive the
   * data stream within five seconds, an error is reported to the application.
   * - false: There is no guarantee that the recipients receive the data stream within five seconds and no error message is
   * reported for any delay or missing data stream.
   * @param ordered Sets whether or not the recipients receive the data stream in the sent order:
   * - true: The recipients receive the data stream in the sent order.
   * - false: The recipients do not receive the data stream in the sent order.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function createDataStream(streamId: number, reliable: boolean, ordered: boolean): number;
  /**
   * Sends data stream messages to all users in a channel.
   *
   * The SDK has the following restrictions on this method:
   * - Up to 30 packets can be sent per second in a channel with each packet having a maximum size of 1 kB.
   * - Each client can send up to 6 kB of data per second.
   * - Each user can have up to five data streams simultaneously.
   *
   * A successful `sendStreamMessage` method call triggers the [onStreamMessage]{@link AgoraRtcEvents.onStreamMessage}
   * callback on the remote client, from which the remote user gets the stream message. A failed `sendStreamMessage`
   * method call triggers the [onStreamMessageError]{@link AgoraRtcEvents.onStreamMessageError} callback on the remote client.
   *
   * @note This method applies only to the `COMMUNICATION` profile or to the hosts in the `LIVE_BROADCASTING` profile.
   * If an audience in the `LIVE_BROADCASTING` profile calls this method, the audience may be switched to a host.
   *
   * @param streamId ID of the sent data stream, returned in the [createDataStream]{@link AgoraRtcEngine.createDataStream} method.
   * @param data The sent data.
   * @param length Length of the sent data.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function sendStreamMessage(streamId: number, data: Uint8Array, length: number): number;
  /**
   * Publishes the local stream to a specified CDN live RTMP address. (CDN live only.)
   *
   * The SDK returns the result of this method call in the [onStreamPublished]{@link AgoraRtcEvents.onStreamPublished} callback.
   *
   * The `addPublishStreamUrl` method call triggers the [onRtmpStreamingStateChanged]{@link AgoraRtcEvents.onRtmpStreamingStateChanged}
   * callback on the local client to report the state of adding a local stream to the CDN.
   *
   * **Note**
   *
   * - Ensure that the user joins the channel before calling this method.
   * - Ensure that you enable the RTMP Converter service before using this function.
   * - This method adds only one stream RTMP URL address each time it is called.
   * - This method applies to `LIVE_BROADCASTING` only.
   *
   * @param url The CDN streaming URL in the RTMP format. The maximum length of this parameter is 1024 bytes. The RTMP URL address
   * must not contain special characters, such as Chinese language characters.
   * @param transcodingEnabled Sets whether transcoding is enabled/disabled:
   * - true: Enable transcoding. To [transcode](https://docs.AgoraRtcEngine.io/en/Agora%20Platform/terms?platform=All%20Platforms#transcoding)
   * the audio or video streams when publishing them to CDN live, often used for combining the audio and video streams of multiple
   * hosts in CDN live. If you set this parameter as `true`, ensure that you call the
   * [setLiveTranscoding]{@link AgoraRtcEngine.setLiveTranscoding} method before this method.
   * - false: Disable transcoding.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *   - -2(ERR_INVALID_ARGUMENT): The RTMP URL address is `null` or has a string length of 0.
   *   - -7(ERR_NOT_INITIALIZED): You have not initialized the Agora engine when publishing the stream.
   */
  function addPublishStreamUrl(url: string, transcodingEnabled: boolean): number;
  /**
   * Removes an RTMP stream from the CDN. (CDN live only.)
   *
   * This method removes the RTMP URL address (added by the [addPublishStreamUrl]{@link AgoraRtcEngine.addPublishStreamUrl}
   * method) from a CDN live stream. The SDK returns the result of this method call in the
   * [onStreamUnpublished]{@link AgoraRtcEvents.onStreamUnpublished} callback.
   *
   * The `removePublishStreamUrl` method call triggers the
   * [onRtmpStreamingStateChanged]{@link AgoraRtcEvents.onRtmpStreamingStateChanged} callback on the local client to report the
   * state of removing an RTMP stream from the CDN.
   *
   * **Note**
   *
   * - This method removes only one RTMP URL address each time it is called.
   * - The RTMP URL address must not contain special characters, such as Chinese language characters.
   * - This method applies to `LIVE_BROADCASTING` only.
   *
   * @param url The RTMP URL address to be removed. The maximum length of this parameter is 1024 bytes.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function removePublishStreamUrl(url: string): number;
  /**
   * Sets the video layout and audio settings for CDN live. (CDN live only.)
   *
   * The SDK triggers the [onTranscodingUpdated]{@link AgoraRtcEvents.onTranscodingUpdated} callback when you call the
   * `setLiveTranscoding` method to update the transcoding setting.
   *
   * **Note**
   *
   * - This method applies to `LIVE_BROADCASTING` only.
   * - Ensure that you enable the RTMP Converter service before using this function.
   * - If you call the `setLiveTranscoding` method to update the transcoding setting for the first time, the SDK does
   * not trigger the `onTranscodingUpdated` callback.
   *
   * @param transcoding Sets the CDN live audio/video transcoding settings. See [LiveTranscoding]{@link AgoraRtcEngine.LiveTranscoding}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setLiveTranscoding(transcoding: LiveTranscoding): number;
  /**
   * Adds a watermark image to the local video.
   *
   * This method adds a PNG watermark image to the local video in the live streaming. Once the watermark image is added, all
   * the audience in the channel (CDN audience included), and the recording device can see and capture it. Agora supports
   * adding only one watermark image onto the local video, and the newly watermark image replaces the previous one.
   *
   * The watermark position depends on the settings in the [setVideoEncoderConfiguration]{@link AgoraRtcEngine.setVideoEncoderConfiguration}
   * method:
   * - If the orientation mode of the encoding video is
   * [ORIENTATION_MODE_FIXED_LANDSCAPE]{@link AgoraRtcEngine.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_LANDSCAPE} or the landscape mode in
   * [ORIENTATION_MODE_ADAPTIVE]{@link AgoraRtcEngine.ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE}, the watermark uses the landscape orientation.
   * - If the orientation mode of the encoding video is
   * [ORIENTATION_MODE_FIXED_PORTRAIT]{@link AgoraRtcEngine.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT} or the portrait mode in
   * [ORIENTATION_MODE_ADAPTIVE]{@link AgoraRtcEngine.ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE}, the watermark uses the portrait orientation.
   * - When setting the watermark position, the region must be less than the dimensions set in the `setVideoEncoderConfiguration`
   * method. Otherwise, the watermark image will be cropped.
   *
   * **Note**
   *
   * - Ensure that you have called the [enableVideo]{@link AgoraRtcEngine.enableVideo} method to enable the video module before calling this
   * method.
   * - If you only want to add a watermark image to the local video for the audience in the CDN live streaming channel to see and
   * capture, you can call this method or the [setLiveTranscoding]{@link AgoraRtcEngine.setLiveTranscoding} method.
   * - This method supports adding a watermark image in the PNG file format only. Supported pixel formats of the PNG image are RGBA,
   * RGB, Palette, Gray, and Alpha_gray.
   * - If the dimensions of the PNG image differ from your settings in this method, the image will be cropped or zoomed to conform
   * to your settings.
   * - If you have enabled the local video preview by calling the [startPreview]{@link AgoraRtcEngine.startPreview} method, you can use the
   * `visibleInPreview` member in the `WatermarkOptions` class to set whether or not the watermark is visible in preview.
   * - If you have enabled the mirror mode for the local video, the watermark on the local video is also mirrored. To avoid mirroring
   * the watermark, Agora recommends that you do not use the mirror and watermark functions for the local video at the same time.
   * You can implement the watermark function in your application layer.
   *
   * @param watermarkUrl The local file path of the watermark image to be added. This method supports adding a watermark image
   * from the local absolute or relative file path.
   * @param options The watermark's options to be added. See [WatermarkOptions]{@link AgoraRtcEngine.WatermarkOptions}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function addVideoWatermark(watermarkUrl: string, options: WatermarkOptions): number;
  /**
   * Removes the watermark image from the video stream added by the
   * [addVideoWatermark]{@link AgoraRtcEngine.addVideoWatermark} method.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function clearVideoWatermarks(): number;
  /**
   * Enables/Disables image enhancement and sets the options.
   *
   * **Note**
   *
   * - Call this method after calling the [enableVideo]{@link AgoraRtcEngine.enableVideo} method.
   * - Currently this method does not apply for macOS.
   *
   * @param enabled Sets whether or not to enable image enhancement:
   * - true: enables image enhancement.
   * - false: disables image enhancement.
   * @param options Sets the image enhancement option. See BeautyOptions.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setBeautyEffectOptions(enabled: boolean, options: BeautyOptions): number;
  /**
   * Adds a voice or video stream URL address to the live streaming.
   *
   * The [onStreamPublished]{@link AgoraRtcEvents.onStreamPublished} callback returns the inject status. If this method
   * call is successful, the server pulls the voice or video stream and injects it into a live channel. This is
   * applicable to scenarios where all audience members in the channel can watch a live show and interact with each other.
   *
   * The `addInjectStreamUrl` method call triggers the following callbacks:
   * - The local client:
   *   - [onStreamInjectedStatus]{@link AgoraRtcEvents.onStreamInjectedStatus}, with the state of the injecting the online stream.
   *   - [onUserJoined]{@link AgoraRtcEvents.onUserJoined}(uid: 666), if the method call is successful and the online media stream
   * is injected into the channel.
   * - The remote client: [onUserJoined]{@link AgoraRtcEvents.onUserJoined}(uid: 666), if the method call is successful and the
   * online media stream is injected into the channel.
   *
   * **Note**
   *
   * - Ensure that you enable the RTMP Converter service before using this function.
   * - This method applies to the SDK of v3.1.2 and later.
   * - This method applies to the `LIVE_BROADCASTING` profile only.
   * - You can inject only one media stream into the channel at the same time.
   *
   * @param url The URL address to be added to the ongoing streaming. Valid protocols are RTMP, HLS, and HTTP-FLV.
   * - Supported audio codec type: AAC.
   * - Supported video codec type: H264 (AVC).
   * @param config [InjectStreamConfig]{@link AgoraRtcEngine.InjectStreamConfig} contains the configuration of
   * the added voice or video stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *   - -2(`ERR_INVALID_ARGUMENT`): The injected URL does not exist. Call this method again to inject the stream and
   * ensure that the URL is valid.
   *   - -3(`ERR_NOT_READY`): The user is not in the channel.
   *   - -4(`ERR_NOT_SUPPORTED`): The channel profile is not `LIVE_BROADCASTING`. Call the
   * [setChannelProfile]{@link AgoraRtcEngine.setChannelProfile} method and set the channel profile to `LIVE_BROADCASTING`
   * before calling this method.
   *   - -7(ERR_NOT_INITIALIZED): The SDK is not initialized. Ensure that the Agora engine is initialized before
   * calling this method.
   */
  function addInjectStreamUrl(url: string, config: InjectStreamConfig): number;
  /**
   * Starts to relay media streams across channels.
   *
   * After a successful method call, the SDK triggers the
   * [onChannelMediaRelayStateChanged]{@link AgoraRtcEvents.onChannelMediaRelayStateChanged} and
   * [onChannelMediaRelayEvent]{@link AgoraRtcEvents.onChannelMediaRelayEvent} callbacks, and these callbacks return the
   * state and events of the media stream relay.
   * - If the `onChannelMediaRelayStateChanged` callback returns
   * [RELAY_STATE_RUNNING]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_STATE.RELAY_STATE_RUNNING}(2) and
   * [RELAY_OK]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_ERROR.RELAY_OK}(0), and the `onChannelMediaRelayEvent` callback returns
   * [RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_EVENT.RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL}(4),
   * the host starts sending data to the destination channel.
   * - If the `onChannelMediaRelayStateChanged` callback returns
   * [RELAY_STATE_FAILURE]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_STATE.RELAY_STATE_FAILURE}(3), an exception occurs during
   * the media stream relay.
   *
   * **Note**
   *
   * - Call this method after the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   * - This method takes effect only when you are a host in a `LIVE_BROADCASTING` channel.
   * - After a successful method call, if you want to call this method again, ensure that you call the
   * [stopChannelMediaRelay]{@link AgoraRtcEngine.stopChannelMediaRelay} method to quit the current relay.
   * - Contact sales-us@AgoraRtcEngine.io before implementing this function.
   * - We do not support string user accounts in this API.
   *
   * @param configuration The configuration of the media stream relay:
   * [ChannelMediaRelayConfiguration]{@link AgoraRtcEngine.ChannelMediaRelayConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function startChannelMediaRelay(configuration: ChannelMediaRelayConfiguration): number;
  /**
   * Updates the channels for media stream relay.
   *
   * After a successful [startChannelMediaRelay]{@link AgoraRtcEngine.startChannelMediaRelay} method call, if you want to
   * relay the media  stream to more channels, or leave the current relay channel, you can call the
   * [updateChannelMediaRelay]{@link AgoraRtcEngine.updateChannelMediaRelay} method.
   *
   * After a successful method call, the SDK triggers the
   * [onChannelMediaRelayEvent]{@link AgoraRtcEvents.onChannelMediaRelayEvent} callback with the
   * [RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_EVENT.RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL}(7)
   * state code.
   *
   * @note Call this method after the `startChannelMediaRelay` method to update the destination channel.
   *
   * @param configuration The media stream relay configuration:
   * [ChannelMediaRelayConfiguration]{@link AgoraRtcEngine.ChannelMediaRelayConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function updateChannelMediaRelay(configuration: ChannelMediaRelayConfiguration): number;
  /**
   * Stops the media stream relay.
   *
   * Once the relay stops, the host quits all the destination channels.
   *
   * After a successful method call, the SDK triggers the
   * [onChannelMediaRelayStateChanged]{@link AgoraRtcEvents.onChannelMediaRelayStateChanged} callback. If the callback returns
   * [RELAY_STATE_IDLE]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_STATE.RELAY_STATE_IDLE}(0) and
   * [RELAY_OK]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_ERROR.RELAY_OK}(0), the host successfully stops the relay.
   *
   * @note If the method call fails, the SDK triggers the `onChannelMediaRelayStateChanged` callback with the
   * [RELAY_ERROR_SERVER_NO_RESPONSE]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_ERROR.RELAY_ERROR_SERVER_NO_RESPONSE}(2) or
   * [RELAY_ERROR_SERVER_CONNECTION_LOST]{@link AgoraRtcEngine.CHANNEL_MEDIA_RELAY_ERROR.RELAY_ERROR_SERVER_CONNECTION_LOST}(8) state code.
   * You can leave the channel by calling the [leaveChannel]{@link AgoraRtcEngine.leaveChannel} method, and the media stream relay
   * automatically stops.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function stopChannelMediaRelay(): number;
  /**
   * Removes the voice or video stream URL address from the live streaming.
   *
   * This method removes the URL address (added by the [addInjectStreamUrl]{@link AgoraRtcEngine.addInjectStreamUrl} method) from the
   * live streaming.
   *
   * @note If this method is called successfully, the SDK triggers the [onUserOffline]{@link AgoraRtcEvents.onUserOffline} callback
   * and returns a stream `uid` of `666`.
   *
   * @param url The URL address of the injected stream to be removed.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function removeInjectStreamUrl(url: string): number;
  /**
   * Agora supports reporting and analyzing customized messages.
   *
   * This function is in the beta stage with a free trial. The ability provided in its beta test version is reporting a maximum of
   * 10 message pieces within 6 seconds, with each message piece not exceeding 256 bytes.
   *
   * To try out this function, contact [support@AgoraRtcEngine.io](mailto:support@AgoraRtcEngine.io) and discuss the format of customized messages
   * with us.
   */
  function sendCustomReportMessage(id: string, category: string, event: string, label: string, value: number): number;
  /**
   * Gets the current connection state of the SDK.
   *
   * @return See [CONNECTION_STATE_TYPE]{@link AgoraRtcEngine.CONNECTION_STATE_TYPE}.
   */
  function getConnectionState(): CONNECTION_STATE_TYPE;
  /**
   * TODO
   *
   * @param userId
   * @param enable
   */
  function enableRemoteSuperResolution(userId: number, enable: boolean): number;
  /**
   * Sends the metadata.
   *
   * **Note**
   *
   * - Call this method after [registerMediaMetadataObserver]{@link AgoraRtcEngine.registerMediaMetadataObserver}.
   * - Ensure that the size of the metadata does not exceed the value set in the
   * [setMaxMetadataSize]{@link AgoraRtcEngine.setMaxMetadataSize} callback.
   *
   * @param uid ID of the user who sends the metadata.
   * @param size The size of the sent metadata.
   * @param buffer The sent metadata.
   * @param timeStampMs The timestamp (ms) of the metadata.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function sendMetadata({ uid, size, buffer, timeStampMs, }: Metadata): number;
  /**
   * Sets the maximum size of the [Metadata]{@link AgoraRtcEngine.Metadata}.
   *
   * The metadata includes the following parameters:
   * - `uid`: ID of the user who sends the metadata.
   * - `size`: The size of the sent or received metadata.
   * - `buffer`: The sent or received metadata.
   * - `timeStampMs`: The timestamp (ms) of the metadata.
   *
   * @note Call this method after [registerMediaMetadataObserver]{@link AgoraRtcEngine.registerMediaMetadataObserver}.
   *
   * @param size The maximum size of the buffer of the metadata that you want to use. The highest value is 1024 bytes.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setMaxMetadataSize(size: number): number;
  /**
   * Registers the metadata observer.
   *
   * You need to specify the metadata type in this method.
   *
   * This method enables you to add synchronized metadata in the video stream for more diversified live interactive
   * streaming, such as sending shopping links, digital coupons, and online quizzes.
   *
   * **Note**
   *
   * - Call this method before the [joinChannel]{@link AgoraRtcEngine.joinChannel} method.
   * - This method applies to the `LIVE_BROADCASTING` channel profile.
   *
   * @param type See [METADATA_TYPE]{@link AgoraRtcEngine.METADATA_TYPE}. The SDK supports `VIDEO_METADATA(0)` only for now.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function registerMediaMetadataObserver(type: METADATA_TYPE): number;
  /**
   * Provides technical preview functionalities or special customizations by configuring the SDK with JSON options.
   *
   * The JSON options are not public by default. Agora is working on making commonly used JSON options public in a standard way.
   *
   * @param parameters Sets the parameter as a JSON string in the specified format.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  function setParameters(parameters: string): number;
}
export declare namespace AgoraRtcEngine {
  /**
   * @ignore
   */
  export interface BufferMap {
    [key: number]: {
      width: number;
      height: number;
      yBuffer: ArrayBuffer;
      yStride: number;
      uBuffer: ArrayBuffer;
      uStride: number;
      vBuffer: ArrayBuffer;
      vStride: number;
    };
  }
  /**
   * @ignore
   */
  interface AudioDeviceManager {
    enumeratePlaybackDevices(): {
      deviceName: string;
      deviceId: string;
    }[];
    enumerateRecordingDevices(): {
      deviceName: string;
      deviceId: string;
    }[];
    setPlaybackDevice(deviceId: string): number;
    setRecordingDevice(deviceId: string): number;
    startPlaybackDeviceTest(testAudioFilePath: string): number;
    stopPlaybackDeviceTest(): number;
    setPlaybackDeviceVolume(volume: number): number;
    getPlaybackDeviceVolume(): number;
    setRecordingDeviceVolume(volume: number): number;
    getRecordingDeviceVolume(): number;
    setPlaybackDeviceMute(mute: boolean): number;
    getPlaybackDeviceMute(): boolean;
    setRecordingDeviceMute(mute: boolean): number;
    getRecordingDeviceMute(): boolean;
    startRecordingDeviceTest(indicationInterval: number): number;
    stopRecordingDeviceTest(): number;
    getPlaybackDevice(): string;
    getPlaybackDeviceInfo(): {
      deviceName: string;
      deviceId: string;
    };
    getRecordingDevice(): string;
    getRecordingDeviceInfo(): {
      deviceName: string;
      deviceId: string;
    };
    startAudioDeviceLoopbackTest(indicationInterval: number): number;
    stopAudioDeviceLoopbackTest(): number;
    release(): void;
  }
  /**
   * @ignore
   */
  interface VideoDeviceManager {
    enumerateVideoDevices(): {
      deviceName: string;
      deviceId: string;
    }[];
    startDeviceTest(hwnd: number): number;
    stopDeviceTest(): number;
    setDevice(deviceId: string): number;
    getDevice(): string;
    release(): void;
  }
  export const audioDeviceManager: AudioDeviceManager;
  export const videoDeviceManager: VideoDeviceManager;
  export {};
}
