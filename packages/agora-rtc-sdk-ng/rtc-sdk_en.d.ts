
declare const AgoraRTC: IAgoraRTC;
export default AgoraRTC;

/**
 * @ignore
 */
declare class AgoraRTCError {
    readonly code: AgoraRTCErrorCode;
    readonly message: string;
    readonly data?: any;
    private readonly name;
    constructor(code: AgoraRTCErrorCode, message?: string, data?: any);
    toString(): string;
    throw(): never;
}

/**
 * @ignore
 */
declare enum AgoraRTCErrorCode {
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
    UNEXPECTED_RESPONSE = "UNEXPECTED_RESPONSE",
    TIMEOUT = "TIMEOUT",
    INVALID_PARAMS = "INVALID_PARAMS",
    NOT_SUPPORTED = "NOT_SUPPORTED",
    INVALID_OPERATION = "INVALID_OPERATION",
    OPERATION_ABORTED = "OPERATION_ABORTED",
    WEB_SECURITY_RESTRICT = "WEB_SECURITY_RESTRICT",
    NETWORK_ERROR = "NETWORK_ERROR",
    NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
    NETWORK_RESPONSE_ERROR = "NETWORK_RESPONSE_ERROR",
    API_INVOKE_TIMEOUT = "API_INVOKE_TIMEOUT",
    ENUMERATE_DEVICES_FAILED = "ENUMERATE_DEVICES_FAILED",
    DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
    ELECTRON_IS_NULL = "ELECTRON_IS_NULL",
    ELECTRON_DESKTOP_CAPTURER_GET_SOURCES_ERROR = "ELECTRON_DESKTOP_CAPTURER_GET_SOURCES_ERROR",
    CHROME_PLUGIN_NO_RESPONSE = "CHROME_PLUGIN_NO_RESPONSE",
    CHROME_PLUGIN_NOT_INSTALL = "CHROME_PLUGIN_NOT_INSTALL",
    MEDIA_OPTION_INVALID = "MEDIA_OPTION_INVALID",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    CONSTRAINT_NOT_SATISFIED = "CONSTRAINT_NOT_SATISFIED",
    TRACK_IS_DISABLED = "TRACK_IS_DISABLED",
    SHARE_AUDIO_NOT_ALLOWED = "SHARE_AUDIO_NOT_ALLOWED",
    LOW_STREAM_ENCODING_ERROR = "LOW_STREAM_ENCODING_ERROR",
    INVALID_UINT_UID_FROM_STRING_UID = "INVALID_UINT_UID_FROM_STRING_UID",
    CAN_NOT_GET_PROXY_SERVER = "CAN_NOT_GET_PROXY_SERVER",
    CAN_NOT_GET_GATEWAY_SERVER = "CAN_NOT_GET_GATEWAY_SERVER",
    VOID_GATEWAY_ADDRESS = "VOID_GATEWAY_ADDRESS",
    UID_CONFLICT = "UID_CONFLICT",
    INVALID_LOCAL_TRACK = "INVALID_LOCAL_TRACK",
    INVALID_TRACK = "INVALID_TRACK",
    SENDER_NOT_FOUND = "SENDER_NOT_FOUND",
    CREATE_OFFER_FAILED = "CREATE_OFFER_FAILED",
    SET_ANSWER_FAILED = "SET_ANSWER_FAILED",
    ICE_FAILED = "ICE_FAILED",
    PC_CLOSED = "PC_CLOSED",
    SENDER_REPLACE_FAILED = "SENDER_REPLACE_FAILED",
    GATEWAY_P2P_LOST = "GATEWAY_P2P_LOST",
    NO_ICE_CANDIDATE = "NO_ICE_CANDIDATE",
    CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS = "CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS",
    EXIST_DISABLED_VIDEO_TRACK = "EXIST_DISABLED_VIDEO_TRACK",
    INVALID_REMOTE_USER = "INVALID_REMOTE_USER",
    REMOTE_USER_IS_NOT_PUBLISHED = "REMOTE_USER_IS_NOT_PUBLISHED",
    CUSTOM_REPORT_SEND_FAILED = "CUSTOM_REPORT_SEND_FAILED",
    CUSTOM_REPORT_FREQUENCY_TOO_HIGH = "CUSTOM_REPORT_FREQUENCY_TOO_HIGH",
    FETCH_AUDIO_FILE_FAILED = "FETCH_AUDIO_FILE_FAILED",
    READ_LOCAL_AUDIO_FILE_ERROR = "READ_LOCAL_AUDIO_FILE_ERROR",
    DECODE_AUDIO_FILE_FAILED = "DECODE_AUDIO_FILE_FAILED",
    WS_ABORT = "WS_ABORT",
    WS_DISCONNECT = "WS_DISCONNECT",
    WS_ERR = "WS_ERR",
    LIVE_STREAMING_TASK_CONFLICT = "LIVE_STREAMING_TASK_CONFLICT",
    LIVE_STREAMING_INVALID_ARGUMENT = "LIVE_STREAMING_INVALID_ARGUMENT",
    LIVE_STREAMING_INTERNAL_SERVER_ERROR = "LIVE_STREAMING_INTERNAL_SERVER_ERROR",
    LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED = "LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED",
    LIVE_STREAMING_TRANSCODING_NOT_SUPPORTED = "LIVE_STREAMING_TRANSCODING_NOT_SUPPORTED",
    LIVE_STREAMING_CDN_ERROR = "LIVE_STREAMING_CDN_ERROR",
    LIVE_STREAMING_INVALID_RAW_STREAM = "LIVE_STREAMING_INVALID_RAW_STREAM",
    LIVE_STREAMING_WARN_STREAM_NUM_REACH_LIMIT = "LIVE_STREAMING_WARN_STREAM_NUM_REACH_LIMIT",
    LIVE_STREAMING_WARN_FAILED_LOAD_IMAGE = "LIVE_STREAMING_WARN_FAILED_LOAD_IMAGE",
    LIVE_STREAMING_WARN_FREQUENT_REQUEST = "LIVE_STREAMING_WARN_FREQUENT_REQUEST",
    WEBGL_INTERNAL_ERROR = "WEBGL_INTERNAL_ERROR",
    BEAUTY_PROCESSOR_INTERNAL_ERROR = "BEAUTY_PROCESSOR_INTERNAL_ERROR",
    CROSS_CHANNEL_WAIT_STATUS_ERROR = "CROSS_CHANNEL_WAIT_STATUS_ERROR",
    CROSS_CHANNEL_FAILED_JOIN_SRC = "CROSS_CHANNEL_FAILED_JOIN_SEC",
    CROSS_CHANNEL_FAILED_JOIN_DEST = "CROSS_CHANNEL_FAILED_JOIN_DEST",
    CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DEST = "CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DEST",
    CROSS_CHANNEL_SERVER_ERROR_RESPONSE = "CROSS_CHANNEL_SERVER_ERROR_RESPONSE",
    METADATA_OUT_OF_RANGE = "METADATA_OUT_OF_RANGE"
}

/**
 * Statistics of the call, which can be retrieved by calling [AgoraRTCClient.getRTCStats]{@link IAgoraRTCClient.getRTCStats}.
 */
export declare interface AgoraRTCStats {
    /**
     * Call duration in seconds.
     */
    Duration: number;
    /**
     * The total bitrate (bps) of the received audio and video, represented by an instantaneous value.
     */
    RecvBitrate: number;
    /**
     * The total number of bytes received, represented by an aggregate value.
     */
    RecvBytes: number;
    /**
     * The total bitrate (bps) of the sent audio and video, represented by an instantaneous value.
     */
    SendBitrate: number;
    /**
     * The total number of bytes sent, represented by an aggregate value.
     */
    SendBytes: number;
    /**
     * The number of users in the channel.
     *
     * - Communication profile: The number of users in the channel.
     * - Live Broadcast profile:
     *   - If the local user is an audience: The number of users in the channel = The number of hosts in the channel + 1.
     *   - If the local user is a host: The number of users in the channel = The number of hosts in the channel.
     */
    UserCount: number;
    /**
     * RTT (Round-Trip Time) between the SDK and Agora's edge server, in ms.
     */
    RTT: number;
    /**
     * The estimated bandwidth (Kbps) of the uplink network.
     */
    OutgoingAvailableBandwidth: number;
}

/**
 * Regions for the connection. Used for calling [AgoraRTC.setArea]{@link IAgoraRTC.setArea}.
 */
export declare const enum AREAS {
    /**
     * China.
     */
    CHINA = "CHINA",
    /**
     * Asia, excluding Mainland China.
     */
    ASIA = "ASIA",
    /**
     * North America.
     */
    NORTH_AMERICA = "NORTH_AMERICA",
    /**
     * Europe.
     */
    EUROPE = "EUROPE",
    /**
     * Japan.
     */
    JAPAN = "JAPAN",
    /**
     * India.
     */
    INDIA = "INDIA",
    OCEANIA = "OCEANIA",
    SOUTH_AMERICA = "SOUTH_AMERICA",
    AFRICA = "AFRICA",
    OVERSEA = "OVERSEA",
    /**
     * Global.
     */
    GLOBAL = "GLOBAL"
}

/**
 * The latency level of an audience member in a live interactive streaming. Takes effect only when the user role is `"audience"`.
 * - `1`: Low latency.
 * - `2`: (Default) Ultra low latency.
 */
export declare const enum AudienceLatencyLevelType {
    AUDIENCE_LEVEL_LOW_LATENCY = 1,
    AUDIENCE_LEVEL_ULTRA_LOW_LATENCY = 2
}

/**
 * @ignore
 */
declare const AUDIO_ENCODER_CONFIG_SETTINGS: {
    speech_low_quality: AudioEncoderConfiguration;
    speech_standard: AudioEncoderConfiguration;
    music_standard: AudioEncoderConfiguration;
    standard_stereo: AudioEncoderConfiguration;
    high_quality: AudioEncoderConfiguration;
    high_quality_stereo: AudioEncoderConfiguration;
};

/**
 *
 * `AudioEncoderConfiguration` is the interface that defines the audio encoder configurations.
 *
 * You can customize the audio encoder configurations when calling [AgoraRTC.createCustomAudioTrack]{@link IAgoraRTC.createCustomAudioTrack}, [AgoraRTC.createMicrophoneAudioTrack]{@link IAgoraRTC.createMicrophoneAudioTrack} or [AgoraRTC.createBufferSourceAudioTrack]{@link IAgoraRTC.createBufferSourceAudioTrack}.
 */
export declare interface AudioEncoderConfiguration {
    /**
     * Sample rate of the audio (Hz).
     */
    sampleRate?: number;
    /**
     * Sample size of the audio.
     */
    sampleSize?: number;
    /**
     * Whether to enable stereo.
     */
    stereo?: boolean;
    /**
     * Bitrate of the audio (Kbps).
     */
    bitrate?: number;
}

/**
 * The preset audio encoder configurations.
 *
 * You can pass the preset video encoder configurations when calling the following methods:
 * - [AgoraRTC.createCustomAudioTrack]{@link IAgoraRTC.createCustomAudioTrack}
 * - [AgoraRTC.createMicrophoneAudioTrack]{@link IAgoraRTC.createMicrophoneAudioTrack}
 * - [AgoraRTC.createBufferSourceAudioTrack]{@link IAgoraRTC.createBufferSourceAudioTrack}
 *
 * The following table lists all the preset audio profiles. The SDK uses `"music_standard"` by default.
 *
 * | Audio Profile | Configurations |
 * | -------- | --------------- |
 * |`"speech_low_quality"`|Sample rate 16 kHz, mono, encoding rate 24 Kbps|
 * |`"speech_standard"`|Sample rate 32 kHz, mono, encoding rate 24 Kbps|
 * |`"music_standard"`|Sample rate 48 kHz, mono, encoding rate 40 Kbps|
 * |`"standard_stereo"`|Sample rate 48 kHz, stereo, encoding rate 64 Kbps|
 * |`"high_quality"`|Sample rate 48 kHz, mono, encoding rate 128 Kbps|
 * |`"high_quality_stereo"`|Sample rate 48 kHz, stereo, encoding rate 192 Kbps| Kbps.
 * @public
 */
export declare type AudioEncoderConfigurationPreset = keyof typeof AUDIO_ENCODER_CONFIG_SETTINGS;

/**
 * Options for processing the audio buffer. You need to set the options for processing the audio buffer when calling [startProcessAudioBuffer]{@link IBufferSourceAudioTrack.startProcessAudioBuffer}.
 */
export declare interface AudioSourceOptions {
    /**
     * How many times the audio loops.
     */
    cycle?: number;
    /**
     * Whether to loop the audio infinitely.
     */
    loop?: boolean;
    /**
     * The playback position (seconds).
     */
    startPlayTime?: number;
}

/**
 * Processing state of the audio buffer:
 * - `"stopped"`: The SDK stops processing the audio buffer. Reasons may include:
 *  - The SDK finishes processing the audio buffer.
 *  - The user manually stops the processing of the audio buffer.
 * - `"playing"`: The SDK is processing the audio buffer.
 * - `"paused"`: The SDK pauses processing the audio buffer.
 *
 * You can get the state with [BufferSourceAudioTrack.on("source-state-change")]{@link IBufferSourceAudioTrack.event_source_state_change}.
 */
export declare type AudioSourceState = "stopped" | "playing" | "paused";

/**
 * Image enhancement options. You need to set the image enhancement options when calling [setBeautyEffect]{@link ILocalVideoTrack.setBeautyEffect}.
 */
export declare interface BeautyEffectOptions {
    /**
     *
     * The smoothness level.
     *
     * The value range is [0.0, 1.0]. The original smoothness level is 0.0. The default value is 0.5. This parameter is usually used to remove blemishes.
     */
    smoothnessLevel?: number;
    /**
     * The brightness level.
     *
     * The value range is [0.0, 1.0]. The original brightness level is 0.0. The default value is 0.7.
     */
    lighteningLevel?: number;
    /**
     * The redness level.
     *
     * The value range is [0.0, 1.0]. The original redness level is 0.0. The default value is 0.1. This parameter adjusts the red saturation level.
     */
    rednessLevel?: number;
    lighteningContrastLevel?: 0 | 1 | 2;
}

/**
 * Configurations for the audio track from an audio file or `AudioBuffer` object. Set these configurations when calling [AgoraRTC.createBufferSourceAudioTrack]{@link IAgoraRTC.createBufferSourceAudioTrack}.
 */
export declare interface BufferSourceAudioTrackInitConfig {
    /**
     * The type of the audio source:
     * - `File`: An [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object, representing a local audio file.
     * - `string`: The online audio file retrieved from an HTTPS address. Ensure the address supports HTTPS and CORS.
     * - `AudioBuffer`: An [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) object, representing the raw data in PCM format.
     */
    source: File | string | AudioBuffer;
    /**
     * Whether to cache the online file:
     * - `true`: Cache the online file.
     * - `false`: (default) Do not cache the online file.
     */
    cacheOnlineFile?: boolean;
    /**
     * The audio encoder configurations.
     *
     * You can set the audio encoder configurations in either of the following ways:
     * - Pass the preset audio encoder configurations by using [[AudioEncoderConfigurationPreset]].
     * - Pass your customized audio encoder configurations by using [[AudioEncoderConfiguration]].
     */
    encoderConfig?: AudioEncoderConfiguration | AudioEncoderConfigurationPreset;
}

/**
 * Configurations for the video track from the video captured by a camera. Set these configurations when calling [AgoraRTC.createCameraVideoTrack]{@link IAgoraRTC.createCameraVideoTrack}.
 */
export declare interface CameraVideoTrackInitConfig {
    /**
     * The video encoder configurations.
     *
     * You can set the video encoder configurations in either of the following ways:
     * - Pass the preset video encoder configurations by using [[VideoEncoderConfigurationPreset]].
     * - Pass your customized video encoder configurations by using [[VideoEncoderConfiguration]].
     */
    encoderConfig?: VideoEncoderConfiguration | VideoEncoderConfigurationPreset;
    /**
     * Whether to user the front camera or the rear camera.
     *
     * You can use this parameter to choose between the front camera and the rear camera on a mobile device:
     * - `"user"`: The front camera.
     * - `"environment"`: The rear camera.
     */
    facingMode?: "user" | "environment";
    /**
     * Specifies the camera ID.
     *
     * You can get a list of the available cameras by calling [AgoraRTC.getCameras]{@link IAgoraRTC.getCameras}.
     */
    cameraId?: string;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Transmission optimization mode. Whether to prioritize video quality or smoothness:
     * - `"detail"`: Prioritizes video quality.
     *   - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
     *   - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
     * -  `"motion"`: Prioritizes video smoothness.
     *   - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
     *   - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.
     * - Empty: Uses the default transmission optimization mode. The SDK may reduce the frame rate or the sending resolution in poor network conditions.
     *
     * > Note: This method is only supported on Chrome.
     */
    optimizationMode?: "motion" | "detail";
}

/**
 * The error code of the media stream relay. You can get the code through [AgoraRTCClient.on("channel-media-relay-state")]{@link IAgoraRTCClient.event_channel_media_relay_state}.
 */
export declare const enum ChannelMediaRelayError {
    /**
     * No error.
     */
    RELAY_OK = "RELAY_OK",
    /**
     * The SDK disconnects from the relay service.
     */
    SERVER_CONNECTION_LOST = "SERVER_CONNECTION_LOST",
    /**
     * The token of the source channel has expired.
     */
    SRC_TOKEN_EXPIRED = "SRC_TOKEN_EXPIRED",
    /**
     * The token of the destination channel has expired.
     */
    DEST_TOKEN_EXPIRED = "DEST_TOKEN_EXPIRED"
}

/**
 * Events during the media stream relay. You can get the event through [AgoraRTCClient.on("channel-media-relay-event")]{@link IAgoraRTCClient.event_channel_media_relay_event}.
 */
export declare const enum ChannelMediaRelayEvent {
    /**
     * The user disconnects from the server due to a poor network connection.
     */
    NETWORK_DISCONNECTED = "NETWORK_DISCONNECTED",
    /**
     * The user is connected to the server.
     */
    NETWORK_CONNECTED = "NETWORK_CONNECTED",
    /**
     * The user joins the source channel.
     */
    PACKET_JOINED_SRC_CHANNEL = "PACKET_JOINED_SRC_CHANNEL",
    /**
     * The user joins the destination channel.
     */
    PACKET_JOINED_DEST_CHANNEL = "PACKET_JOINED_DEST_CHANNEL",
    /**
     * The SDK starts relaying the media stream to the destination channel.
     */
    PACKET_SENT_TO_DEST_CHANNEL = "PACKET_SENT_TO_DEST_CHANNEL",
    /**
     * The server receives the video stream from the source channel.
     */
    PACKET_RECEIVED_VIDEO_FROM_SRC = "PACKET_RECEIVED_VIDEO_FROM_SRC",
    /**
     * The server receives the audio stream from the source channel.
     */
    PACKET_RECEIVED_AUDIO_FROM_SRC = "PACKET_RECEIVED_AUDIO_FROM_SRC",
    /**
     * The destination channel is updated.
     */
    PACKET_UPDATE_DEST_CHANNEL = "PACKET_UPDATE_DEST_CHANNEL",
    /**
     * Fails to update the destination channel due to an internal error.
     */
    PACKET_UPDATE_DEST_CHANNEL_REFUSED = "PACKET_UPDATE_DEST_CHANNEL_REFUSED",
    /**
     * The destination channel is not updated.
     */
    PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE = "PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE"
}

/**
 * Channel information in the media relay, used in [ChannelMediaRelayConfiguration]{@link IChannelMediaRelayConfiguration}.
 */
export declare interface ChannelMediaRelayInfo {
    /**
     * The channel name.
     */
    channelName: string;
    /**
     * The token generated with the `channelName` and `uid`. Do not set this parameter if you have not enabled token.
     */
    token?: string;
    /**
     * The unique ID to identify the relay stream.
     *
     * A 32-bit unsigned integer with a value ranging from 0 to (2<sup>32</sup>-1). If you set it as `0`, the server assigns a random one.
     *
     * When used for the source channel, it is the ID to identify the relay stream in the source channel.
     *
     * When used for the destination channel, it is the ID to identify the relay stream in the destination channel. To avoid UID conflicts, this value must be different from any other user IDs in the destination channel.
     */
    uid: number;
}

/**
 * The state code of the media stream relay. You can get the code through [AgoraRTCClient.on("channel-media-relay-state")]{@link IAgoraRTCClient.event_channel_media_relay_state}.
 */
export declare const enum ChannelMediaRelayState {
    /**
     * The SDK is initialized, but has not started the media stream relay service.
     */
    RELAY_STATE_IDLE = "RELAY_STATE_IDLE",
    /**
     * The SDK is connecting to the media stream relay service.
     */
    RELAY_STATE_CONNECTING = "RELAY_STATE_CONNECTING",
    /**
     * The SDK successfully relays the media stream to the destination channel.
     */
    RELAY_STATE_RUNNING = "RELAY_STATE_RUNNING",
    /**
     * An error occurs in the media stream relay. See {@link ChannelMediaRelayError} for the error code.
     */
    RELAY_STATE_FAILURE = "RELAY_STATE_FAILURE"
}

/**
 * Interface for defining the behavior of a web client.
 *
 * You need to configure it when calling the {@link createClient} method to create a web client.
 *
 * > The [mode]{@link ClientConfig.mode} and [codec]{@link ClientConfig.codec} properties are required.
 */
export declare interface ClientConfig {
    /**
     * The codec that the Web browser uses for encoding.
     * - `"vp8"`: Use VP8 for encoding.
     * - `"h264"`: Use H.264 for encoding.
     *
     * > Safari 12.1 or earlier does not support the VP8 codec.
     */
    codec: SDK_CODEC;
    /**
     * The channel profile.
     *
     * The SDK differentiates channel profiles and applies different optimization algorithms accordingly. For example, it prioritizes smoothness and low latency for a video call, and prioritizes video quality for a video streaming.
     *
     * The SDK supports the following channel profiles:
     * - `"live"`: Sets the channel profile as live streaming. You need to go on to call [setClientRole]{@link IAgoraRTCClient.setClientRole} to set the client as either a host or an audience. A host can send and receive audio or video, while an audience can only receive audio or video.
     * - `"rtc"`: Sets the channel profile as communication. It is used for a one-on-one call or a group call where all users in the channel can converse freely.
     */
    mode: SDK_MODE;
    /**
     * The user role in a live interactive streaming (when [mode]{@link ClientConfig.mode} is `"live"`).
     *
     * The user role determines the permissions that the SDK grants to a user, such as permission to publish local streams, subscribe to remote streams, and push streams to a CDN address. You can set the user role as `"host"` or `"audience"`. A host can publish and subscribe to tracks, while an audience member can only subscribe to tracks. The default role in a live streaming is `"audience"`. Before publishing tracks, you must set the user role as `"host"`.
     *
     * After creating a client, you can call {@link setClientRole} to switch the user role.
     */
    role?: ClientRole;
    /**
     * The detailed options of the user role, including user level.
     *
     * The user level determines the level of services that a user can enjoy within the permissions of the user's role. For example, an audience can choose to receive remote streams with low latency or ultra low latency. Levels affect prices.
     */
    clientRoleOptions?: ClientRoleOptions;
    /**
     * @ignore
     */
    proxyServer?: string;
    /**
     * @ignore
     */
    turnServer?: TurnServerConfig;
    /**
     * @ignore
     */
    httpRetryConfig?: RetryConfiguration;
    /**
     * @ignore
     */
    websocketRetryConfig?: RetryConfiguration;
}

/**
 * The user role in a live broadcast channel.
 * - `"host"`: Host. A host can both publish tracks and subscribe to tracks.
 * - `"audience"`: Audience. An audience can only subscribe to tracks.
 */
export declare type ClientRole = "audience" | "host";

/**
 * The detailed options of the user role, including the user level.
 *
 * Used by the {@link ClientConfig.clientRoleOptions} property or the [AgoraRTCClient.setClientRole]{@link IAgoraRTCClient.setClientRole} method.
 */
export declare interface ClientRoleOptions {
    /**
     * The latency level of an audience member in a live interactive streaming.
     *
     * > Note:
     * > - Takes effect only when the user role is `"audience"`.
     * > - Levels affect prices.
     */
    level: AudienceLatencyLevelType;
}

/**
 * Reason for the disconnection.
 */
export declare const enum ConnectionDisconnectedReason {
    /**
     * The user has left the channel.
     */
    LEAVE = "LEAVE",
    /**
     * The network is down, and cannot recover after retry.
     */
    NETWORK_ERROR = "NETWORK_ERROR",
    /**
     * The server returns an error. This is usually caused by incorrect parameter settings.
     */
    SERVER_ERROR = "SERVER_ERROR",
    /**
     * The user is banned.
     */
    UID_BANNED = "UID_BANNED",
    /**
     * The IP is banned.
     */
    IP_BANNED = "IP_BANNED",
    /**
     * The channel is banned.
     */
    CHANNEL_BANNED = "CHANNEL_BANNED"
}

/**
 * Connection state between the SDK and Agora's edge server.
 *
 * You can get the connection state through [connectionState]{@link IAgoraRTCClient.connectionState}.
 *
 * The connection between the SDK and the edge server has the following states:
 * - `"DISCONNECTED"`: The SDK is disconnected from the server.
 *  - This is the initial state until you call [join]{@link IAgoraRTCClient.join}.
 *  - The SDK also enters this state after you call [leave]{@link IAgoraRTCClient.leave}, when the user is banned, or when the connection fails.
 * - `"CONNECTING"`: The SDK is connecting to the server. The SDK enters this state when you call [join]{@link IAgoraRTCClient.join}.
 * - `"CONNECTED"`: The SDK is connected to the server and joins a channel. The user can now publish streams or subscribe to streams in the channel.
 * - `"RECONNECTING"`: The SDK is reconnecting to the server. If the connection is lost because the network is down or switched, the SDK enters this state.
 * - `"DISCONNECTING"`: The SDK is disconnecting from the server. The SDK enters this state when you call [leave]{@link IAgoraRTCClient.leave}.
 */
export declare type ConnectionState = "DISCONNECTED" | "CONNECTING" | "RECONNECTING" | "CONNECTED" | "DISCONNECTING";

/**
 * Specifies a constraint for a property, such as the resolution or bitrate for video capture in [[VideoEncoderConfiguration]].
 */
export declare interface ConstrainLong {
    /**
     * The lower limit of the property.
     */
    min?: number;
    /**
     * The upper limit of the property.
     */
    max?: number;
    /**
     * An ideal value of a property. If the video capture device cannot output this value, it outputs the closest value instead.
     */
    ideal?: number;
    /**
     * A required value of a property. If the video capture device cannot output this value, the video capture fails.
     */
    exact?: number;
}

/**
 * Configurations for the custom audio track. Set these configurations when calling [AgoraRTC.createCustomAudioTrack]{@link IAgoraRTC.createCustomAudioTrack}.
 */
export declare interface CustomAudioTrackInitConfig {
    /**
     * Your [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     */
    mediaStreamTrack: MediaStreamTrack;
    /**
     * The audio encoder configurations.
     *
     * You can set the audio encoder configurations in either of the following ways:
     * - Pass the preset audio encoder configurations by using [[AudioEncoderConfigurationPreset]].
     * - Pass your customized audio encoder configurations by using [[AudioEncoderConfiguration]].
     */
    encoderConfig?: AudioEncoderConfiguration | AudioEncoderConfigurationPreset;
}

/**
 * Configurations for the custom video track. Set these configurations when calling [AgoraRTC.createCustomVideoTrack]{@link IAgoraRTC.createCustomVideoTrack}.
 */
export declare interface CustomVideoTrackInitConfig {
    /**
     * Your [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     */
    mediaStreamTrack: MediaStreamTrack;
    /**
     * The minimum bitrate of sending the video track (Kbps).
     */
    bitrateMin?: number;
    /**
     * The maximum bitrate of sending the video track (Kbps).
     */
    bitrateMax?: number;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Transmission optimization mode. Whether to prioritize video quality or smoothness:
     * - `"detail"`: Prioritizes video quality.
     *   - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
     *   - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
     * -  `"motion"`: Prioritizes video smoothness.
     *   - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
     *   - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.
     * - Empty: Uses the default transmission optimization mode. The SDK may reduce the frame rate or the sending resolution in poor network conditions.
     *
     * > Note: This method is only supported on Chrome.
     */
    optimizationMode?: "motion" | "detail";
}

/**
 * Information of the media input device.
 *
 * - You can get the audio sampling device information through [onMicrophoneChanged]{@link onMicrophoneChanged}.
 * - You can get the video capture device information through [onCameraChanged]{@link onCameraChanged}.
 * - You can get the audio playback device information through [onPlaybackDeviceChanged]{@link onPlaybackDeviceChanged}.
 */
export declare interface DeviceInfo {
    /**
     * The latest time when the state of the media input device was updated.
     *
     * A Unix timestamp in milliseconds.
     */
    updateAt: number;
    /**
     * The time when the SDK first detects the media input device.
     *
     * A Unix timestamp in milliseconds.
     */
    initAt: number;
    /**
     * The state of the capture device.
     */
    state: DeviceState;
    /**
     * Device information of the media input device. See [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) for details.
     */
    device: MediaDeviceInfo;
}

/**
 * The state of the media input device.
 * - `"ACTIVE"`: The device is plugged in.
 * - `"INACTIVE"`: The device is unplugged.
 */
export declare type DeviceState = "ACTIVE" | "INACTIVE";

/**
 * Information of the sharing screen source on Electron, which is retrieved by calling {@link getElectronScreenSources}.
 *
 * See [DesktopCapturerSource](https://www.electronjs.org/docs/api/structures/desktop-capturer-source) in the Electron API documentation for details.
 */
export declare interface ElectronDesktopCapturerSource {
    /**
     * The ID of the screen source.
     */
    id: string;
    /**
     * The name of the screen source.
     */
    name: string;
    /**
     * The thumbnail of the screen source.
     *
     * See [ElectronNativeImage](https://electronjs.org/docs/api/native-image#nativeimage) for details.
     */
    thumbnail: IElectronNativeImage;
}

/**
 * The encryption mode, which is used in the {@link setEncryptionConfig} method call.
 * - `"aes-128-xts"`: 128-bit AES encryption, XTS mode.
 * - `"aes-256-xts"`: 128-bit AES encryption, ECB mode.
 * - `"aes-128-ecb"`: 256-bit AES encryption, XTS mode.
 * - `"sm4-128-ecb"`: 128-bit SM4 encryption, ECB mode.
 * - `"none"`: No encryption.
 */
export declare type EncryptionMode = "aes-128-xts" | "aes-256-xts" | "aes-128-ecb" | "sm4-128-ecb" | "none";

/**
 * Occurs when the device is overloaded after you call [setBeautyEffect]{@link ILocalVideoTrack.setBeautyEffect} to enable image enhancement.
 *
 * You can listen for this event to notify users of the device overload and disable image enhancement.
 *
 * ```javascript
 * localVideoTrack.on("beauty-effect-overload", () => {
 *   console.log("beauty effect overload, disable beauty effect");
 *   localVideoTrack.setBeautyEffect(false);
 * });
 * ```
 * @event
 * @asMemberOf ILocalVideoTrack
 */
declare function event_beauty_effect_overload(): void;

/**
 * Reports events during a media stream relay.
 *
 * @param event The event code for a media stream relay.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_channel_media_relay_event(event: ChannelMediaRelayEvent): void;

/**
 * Occurs when the state of the media stream relay changes.
 *
 * The SDK reports the state and error code of the current media relay with this callback.
 *
 * If the media relay is in an abnormal state, you can find the error code in {@link ChannelMediaRelayError} (for example if the token has expired, or repeated reconnection attempts fail.)
 * @param state The state of the media relay.
 * @param code The error code.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_channel_media_relay_state(state: ChannelMediaRelayState, code: ChannelMediaRelayError): void;

/**
 * Occurs when the state of the connection between the SDK and the server changes.
 * @param curState The current connection state.
 * @param revState The previous connection state.
 * @param reason The reason of disconnection if `curState` is `"DISCONNECTED"`.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_connection_state_change(curState: ConnectionState, revState: ConnectionState, reason?: ConnectionDisconnectedReason): void;

/**
 * Occurs when decryption fails.
 *
 * The SDK triggers this callback when the decryption fails during the process of subscribing to a stream. The failure is usually caused by incorrect encryption settings. See {@link setEncryptionConfig} for details.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_crypt_error(): void;

/**
 * Reports exceptions in the channel.
 *
 * Exceptions are not errors, but usually reflect quality issues.
 *
 * This callback also reports recovery from an exception.
 *
 * Each exception corresponds to a recovery event.
 *
 * **Exception**
 *
 * | Code | Message                   | Exception            |
 * | :----- | :------------------------- | :--------------- |
 * | 1001   | FRAMERATE_INPUT_TOO_LOW    | Captured video frame rate is too low |
 * | 1002   | FRAMERATE_SENT_TOO_LOW     | Sent video frame rate is too low |
 * | 1003   | SEND_VIDEO_BITRATE_TOO_LOW | Sent video bitrate is too low |
 * | 1005   | RECV_VIDEO_DECODE_FAILED   | Decoding received video fails |
 * | 2001   | AUDIO_INPUT_LEVEL_TOO_LOW  | Sent audio volume is too low     |
 * | 2002   | AUDIO_OUTPUT_LEVEL_TOO_LOW | Received audio volume is too low     |
 * | 2003   | SEND_AUDIO_BITRATE_TOO_LOW | Sent audio bitrate is too low |
 * | 2005   | RECV_AUDIO_DECODE_FAILED   | Decoding received audio fails |
 *
 * **Recoveries**
 *
 * | Code | Message                   | Recovery             |
 * | :----- | :------------------------- | :--------------- |
 * |3001   | FRAMERATE_INPUT_TOO_LOW_RECOVER    | Captured video frame rate recovers |
 * |3002   | FRAMERATE_SENT_TOO_LOW_RECOVER     | Sent video frame rate recovers |
 * |3003   | SEND_VIDEO_BITRATE_TOO_LOW_RECOVER | Sent video bitrate recovers |
 * |3005   | RECV_VIDEO_DECODE_FAILED_RECOVER   | Decoding received video recovers |
 * |4001   | AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER  | Sent audio volume recovers     |
 * |4002   | AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER | Received audio volume recovers     |
 * |4003   | SEND_AUDIO_BITRATE_TOO_LOW_RECOVER | Sent audio bitrate recovers |
 * |4005   | RECV_AUDIO_DECODE_FAILED_RECOVER   | Decoding received audio recovers |
 *
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_exception(event: {
    /**
     * The event code.
     */
    code: number;
    /**
     * The event message.
     */
    msg: string;
    /**
     * The ID of the user who has experienced the exception or recovery event.
     */
    uid: UID;
}): void;

/**
 * Occurs when the first remote audio or video frame is decoded.
 *
 * @event
 * @asMemberOf IRemoteTrack
 */
declare function event_first_frame_decoded(): void;

/**
 * Occurs when an error occurs in CDN live streaming.
 *
 * After the method call of {@link startLiveStreaming} succeeds, the SDK triggers this callback when errors occur during CDN live streaming.
 *
 * You can visit `err.code` to get the error code. The errors that you may encounter include:
 * - `LIVE_STREAMING_INVALID_ARGUMENT`: Invalid argument.
 * - `LIVE_STREAMING_INTERNAL_SERVER_ERROR`: An error occurs in Agora's streaming server.
 * - `LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED`: The URL is occupied.
 * - `LIVE_STREAMING_TRANSCODING_NOT_SUPPORTED`: Sets the transcoding parameters when the transcoding is not enabled.
 * - `LIVE_STREAMING_CDN_ERROR`: An error occurs in the CDN.
 * - `LIVE_STREAMING_INVALID_RAW_STREAM`: Timeout for the CDN live streaming. Please check your media stream.
 *
 * @param url The URL of the CDN live streaming that has errors.
 * @param err The error details.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_live_streaming_error(url: string, err: AgoraRTCError): void;

/**
 * Occurs when a warning occurs in CDN live streaming.
 *
 * After the method call of {@link startLiveStreaming} succeeds, the SDK triggers this callback when warnings occur during CDN live streaming.
 *
 * You can visit `err.code` to get the warning code. The warnings that you may encounter include:
 * - `LIVE_STREAMING_WARN_STREAM_NUM_REACH_LIMIT`: Pushes stremas to more than 10 URLs.
 * - `LIVE_STREAMING_WARN_FAILED_LOAD_IMAGE`: Fails to load the background image or watermark image.
 * - `LIVE_STREAMING_WARN_FREQUENT_REQUEST`: Pushes stremas to the CDN too frequently.
 *
 * @param url The URL of the CDN live streaming that has warnings.
 * @param err The warning details.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_live_streaming_warning(url: string, warning: AgoraRTCError): void;

/**
 * Occurs when the SDK ends reestablishing the media connection for publishing and subscribing.
 * @param uid The ID of the user who reestablishes the connection. If it is the local `uid`, the connection is for publishing; if it is a remote `uid`, the connection is for subscribing.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_media_reconnect_end(uid: UID): void;

/**
 * Occurs when the SDK starts to reestablish the media connection for publishing and subscribing.
 * @param uid The ID of the user who reestablishes the connection.  If it is the local `uid`, the connection is for publishing; if it is a remote `uid`, the connection is for subscribing.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_media_reconnect_start(uid: UID): void;

/**
 * Reports the network quality of the local user.
 *
 * After the local user joins the channel, the SDK triggers this callback to report the uplink and downlink network conditions of the local user once every second.
 *
 * > Agora recommends listening for this event and diaplaying the network quality.
 *
 * @param stats The network quality of the local user.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_network_quality(stats: NetworkQuality): void;

/**
 * Occurs when the state of processing the audio buffer in [BufferSourceAudioTrack]{@link IBufferSourceAudioTrack} changes.
 *
 * @param currentState The state of processing the audio buffer:
 * - `"stopped"`: The SDK stops processing the audio buffer. Reasons may include:
 *  - The SDK finishes processing the audio buffer.
 *  - The user manually stops the processing of the audio buffer.
 * - `"paused"`: The SDK pauses the processing of the audio buffer.
 * - `"playing"`: The SDK is processing the audio buffer.
 *
 * @event
 * @asMemberOf IBufferSourceAudioTrack
 */
declare function event_source_state_change(currentState: AudioSourceState): void;

/**
 * Occurs when a remote video stream falls back to an audio stream due to unreliable network conditions or switches back to video after the network conditions improve.
 * @param uid The ID of the remote user.
 * @param isFallbackOrRecover Whether the remote media stream falls back or recovers:
 * - `"fallback"`: The remote media stream falls back to audio-only due to unreliable network conditions.
 * - `"recover"`: The remote media stream switches back to the video stream after the network conditions improve.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_stream_fallback(uid: UID, isFallbackOrRecover: "fallback" | "recover"): void;

/**
 * Occurs when the status of the media stream injected by [[addInjectStreamUrl]] updates.
 *
 * @param status The current status.
 * @param uid The ID of the user who injects the media stream.
 * @param url The URL address of the medida stream.
 */
declare function event_stream_inject_status(status: InjectStreamEventStatus, uid: UID, url: string): void;

/**
 * Occurs when the type of a remote video stream changes.
 *
 * The SDK triggers this callback when a high-quality video stream changes to a low-quality video stream, or vice versa.
 * @param uid The ID of the remote user.
 * @param streamType The new stream type:
 * - 0: High-bitrate, high-resolution video stream.
 * - 1: Low-bitrate, low-resolution video stream.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_stream_type_changed(uid: UID, streamType: RemoteStreamType): void;

/**
 * Occurs when the token expires.
 *
 * You must request a new token from your server and call {@link join} to use the new token to join the channel.
 *
 * ``` javascript
 * client.on("token-privilege-did-expire", async function(){
 *   //After requesting a new token
 *   await client.renewToken(token);
 * });
 *
 * ```
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_token_privilege_did_expire(): void;

/**
 * Occurs 30 seconds before a token expires.
 *
 * You must request a new token from your server and call {@link renewToken} to pass a new token as soon as possible.
 *
 * ``` javascript
 * client.on("token-privilege-will-expire", async function(){
 *   //After requesting a new token
 *   await client.renewToken(token);
 * });
 *
 * ```
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_token_privilege_will_expire(): void;

/**
 * Occurs when a audio or video track ends.
 *
 * Reasons may include:
 * - Camera is unplugged.
 * - Microphone is unplugged.
 * - The local user stops screen sharing.
 * - The local user closes the track.
 * - A local media device malfunctions.
 * @event
 * @asMemberOf ILocalTrack
 */
declare function event_track_ended(): void;

/**
 * Reports the state change of users using the Agora RTC Native SDK when your scenario involves the Native SDK.
 *
 * This event is only for synchronizing states with the clients that integrate the Native SDK.
 *
 * In most cases, you only need to listen for [user-published]{@link IAgoraRTCClient.event_user_published} and [user-unpublished]{@link IAgoraRTCClient.event_user_unpublished} events for operations including subscribeing, unsubscribing, and displaying whether the remote user turns on the camera and microphone. You do not need to pay special attention to user states since the SDK automatically handles user states.
 *
 * > This event indicating the media stream of a remote user is active does not necessarily mean that the local user can subscribe to this remote user. The local user can subscribe to a remote user only when receiving the [user-published]{@link IAgoraRTCClient.event_user_published} event.
 *
 * @param uid The ID of the remote user.
 * @param msg The current user state.
 */
declare function event_user_info_updated(uid: UID, msg: "mute-audio" | "mute-video" | "enable-local-video" | "unmute-audio" | "unmute-video" | "disable-local-video"): void;

/**
 * Occurs when a remote user or host joins the channel.
 *
 * - In a communication channel, this callback indicates that another user joins the channel and reports the ID of that user. The SDK also triggers this callback to report the existing users in the channel when a user joins the channel.
 * - In a live-broadcast channel, this callback indicates that a host joins the channel. The SDK also triggers this callback to report the existing hosts in the channel when a user joins the channel. Ensure that you have no more than 17 hosts in a channel.
 *
 * The SDK triggers this callback when one of the following situations occurs:
 * - A remote user or host joins the channel by calling {@link join}.
 * - A remote audience switches the user role to host by calling {@link setClientRole} after joining the channel.
 * - A remote user or host rejoins the channel after a network interruption.
 * - A host injects an online media stream into the channel by calling {@link addInjectStreamUrl}.
 * @param user Information of the remote user.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_user_joined(user: IAgoraRTCRemoteUser): void;

/**
 * Occurs when a remote user becomes offline.
 *
 * The SDK triggers this callback when one of the following situations occurs:
 * - A remote user calls {@link leave} and leaves the channel.
 * - A remote user has dropped offline. If no data packet of the user or host is received for 20 seconds, the SDK assumes that the user has dropped offline. A poor network connection may cause a false positive.
 * - A remote user switches the client role from host to audience.
 *
 * > In live-broadcast channels, the SDK triggers this callback only when a host goes offline.
 * @param user Information of the user who is offline.
 * @param reason Reason why the user has gone offline.
 * - `"Quit"`: The user calls {@link leave} and leaves the channel.
 * - `"ServerTimeOut"`: The user has dropped offline.
 * - `"BecomeAudience"`: The client role is switched from host to audience.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_user_left(user: IAgoraRTCRemoteUser, reason: string): void;

/**
 * Occurs when a remote user publishes an audio or video track.
 *
 * You can subscribe to and play the audio or video track in this callback. See {@link subscribe} and [RemoteTrack.play]{@link IRemoteTrack.play}.
 *
 * > The SDK also triggers this callback to report the existing tracks in the channel when a user joins the channel.
 *
 * ```javascript
 * client.on("user-published", async (user, mediaType) => {
 *   await client.subscribe(user, mediaType);
 *   if (mediaType === "video") {
 *     console.log("subscribe video success");
 *     user.videoTrack.play("xxx");
 *   }
 *   if (mediaType === "audio") {
 *     console.log("subscribe audio success");
 *     user.audioTrack.play();
 *   }
 * })
 * ```
 * @param user Information of the remote user.
 * @param mediaType Type of the track.
 * - `"audio"`: The remote user publishes an audio track.
 * - `"video"`: The remote user publishes a video track.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_user_published(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): void;

/**
 * Occurs when a remote user unpublishes an audio or video track.
 * @param user Information of the remote user.
 * @param mediaType Type of the track.
 * - `"audio"`: The remote user unpublishes an audio track.
 * - `"video"`: The remote user unpublishes a video track.
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_user_unpublished(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): void;

/**
 * Reports all the speaking remote users and their volumes.
 *
 * It is disabled by default. You can enable this callback by calling {@link enableAudioVolumeIndicator}.
 * If enabled, it reports the users' volumes every two seconds regardless of whether there are users speaking.
 *
 * The volume is an integer ranging from 0 to 100. Usually a user with volume above five is a speaking user.
 *
 * ``` javascript
 * client.on("volume-indicator", function(result){
 *     result.forEach(function(volume, index){
 *     console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
 *   });
 * });
 * ```
 * @asMemberOf IAgoraRTCClient
 * @event
 */
declare function event_volume_indicator(result: {
    /**
     * The volume of the speaking user, ranging from 0 to 100.
     */
    level: number;
    /**
     * The ID of the speaking user.
     */
    uid: UID;
}[]): void;

/**
 * Parameters for reporting customized messages. Used when calling [AgoraRTCClient.sendCustomReportMessage]{@link IAgoraRTCClient.sendCustomReportMessage}.
 */
export declare interface EventCustomReportParams {
    /**
     * The ID of the message.
     */
    reportId: string;
    /**
     * The category of the message.
     */
    category: string;
    /**
     * The event name of the message.
     */
    event: string;
    /**
     * The label of the message.
     */
    label: string;
    /**
     * The value of the message.
     */
    value: number;
}

/**
 * @ignore
 */
declare class EventEmitter {
    private _events;
    /**
     * Gets all the listeners for a specified event.
     *
     * @param event The event name.
     */
    getListeners(event: string): Function[];
    /**
     * Listens for a specified event.
     *
     * When the specified event happens, the SDK triggers the callback that you pass.
     * @param event The event name.
     * @param listener The callback to trigger.
     */
    on(event: string, listener: Function): void;
    /**
     * Listens for a specified event once.
     *
     * When the specified event happens, the SDK triggers the callback that you pass and then removes the listener.
     * @param event The event name.
     * @param listener The callback to trigger.
     */
    once(event: string, listener: Function): void;
    /**
     * Removes the listener for a specified event.
     *
     * @param event The event name.
     * @param listener The callback that corresponds to the event listener.
     */
    off(event: string, listener: Function): void;
    /**
     * Removes all listeners for a specified event.
     *
     * @param event The event name. If left empty, all listeners for all events are removed.
     */
    removeAllListeners(event?: string): void;
    private _indexOfListener;
}

/**
 * The entry point of the Agora Web SDK.
 */
export declare interface IAgoraRTC {
    /**
     * The version of the Agora Web SDK.
     */
    VERSION: string;
    /**
     * Gets the codecs that the browser supports.
     *
     * This method gets a list of the codecs supported by the SDK and the web browser. The Agora Web SDK supports video codecs VP8 and H.264, and audio codec OPUS.
     *
     * > Note:
     * > - The method works with all major browsers. It gets an empty list if it does not recognize the browser or the browser does not support WebRTC.
     * > - The returned codec list is based on the [SDP](https://tools.ietf.org/html/rfc4566) used by the web browser and for reference only.
     * > - Some Android phones claim to support H.264 but have problems in communicating with other platforms using this codec, in which case we recommend VP8 instead.
     *
     * ```javascript
     * AgoraRTC.getSupportedCodec().then(result => {
     * console.log(`Supported video codec: ${result.video.join(",")});
     * console.log(`Supported audio codec: ${result.audio.join(",")});
     * });
     * ```
     * @returns A `Promise` object. In the `.then(function(result){})` callback, `result` has the following properties:
     * - `video`: array, the supported video codecs. The array may include `"H264"` and `"VP8"`, or be empty.
     * - `audio`: array, the supported audio codecs. The array may include `"OPUS"`, or be empty.
     *
     */
    getSupportedCodec(): Promise<{
        video: string[];
        audio: string[];
    }>;
    /**
     * Checks the compatibility of the current browser.
     *
     * Use this method before calling {@link createClient} to check if the SDK is compatible with the web browser.
     *
     * @returns
     * - `true`: The SDK is compatible with the current web browser.
     * - `false`: The SDK is incompatible with the current web browser.
     */
    checkSystemRequirements(): boolean;
    /**
     * Creates a local client object for managing a call.
     *
     * This is usually the first step of using the Agora Web SDK.
     * @param config The configurations for the client object, including channel profile and codec. The default codec is `vp8` and default channel profile is `rtc`. See {@link ClientConfig} for details.
     * @category Agora Core
     */
    createClient(config: ClientConfig): IAgoraRTCClient;
    /**
     * Creates a customized audio track.
     *
     * This method creates a customized audio track from a [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     *
     * @param config Configurations for the customized audio track.
     * @category Local Track
     */
    createCustomAudioTrack(config: CustomAudioTrackInitConfig): ILocalAudioTrack;
    /**
     * Creates an audio track from the audio sampled by a microphone.
     *
     * @param config Configurations for the sampled audio, such as the capture device and the encoder configuration. See {@link MicrophoneAudioTrackInitConfig}.
     * @category Local Track
     */
    createMicrophoneAudioTrack(config?: MicrophoneAudioTrackInitConfig): Promise<IMicrophoneAudioTrack>;
    /**
     *
     * Creates an audio track from an audio file or [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) object.
     *
     * This method works with both the local and online audio files, supporting the following formats:
     * - MP3.
     * - AAC.
     * - Other audio formats supported by the browser.
     * @param config Configurations such as the file path, caching strategies, and encoder configuration.
     * @returns Unlike other audio track objects, this audio track object adds the methods for audio playback control, such as playing, pausing, seeking and playback status querying.
     * @category Local Track
     */
    createBufferSourceAudioTrack(config: BufferSourceAudioTrackInitConfig): Promise<IBufferSourceAudioTrack>;
    /**
     * Creates a customized video track.
     *
     * This method creates a customized video track from a [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     * @param config Configurations for the customized video track. See {@link CustomVideoTrackInitConfig}.
     * > You can set the sending bitrate for a customized video track by [config]{@link CustomVideoTrackInitConfig}. Other video encoder configurations are not supported.
     * @category Local Track
     */
    createCustomVideoTrack(config: CustomVideoTrackInitConfig): ILocalVideoTrack;
    /**
     * Creates a video track from the video captured by a camera.
     *
     * @param config Configurations for the captured video, such as the capture device and the encoder configuration.
     * @category Local Track
     */
    createCameraVideoTrack(config?: CameraVideoTrackInitConfig): Promise<ICameraVideoTrack>;
    /**
     * Creates an audio track and a video track.
     *
     * Creates an audio track from the audio sampled by a microphone and a video track from the video captured by a camera.
     *
     * > Calling this method differs from calling {@link createMicrophoneAudioTrack} and {@link createCameraVideoTrack} separately:
     * > - This method call requires access to the microphone and the camera at the same time. In this case, users only need to do authorization once.
     * > - Calling {@link createMicrophoneAudioTrack} and {@link createCameraVideoTrack} requires access to the microphone and the camera separately. In this case, users need to do authorization twice.
     * @param audioConfig Configurations for the sampled audio, such as the capture device and the encoder configurations.
     * @param videoConfig Configurations for the captured video, such as the capture device and the encoder configurations.
     */
    createMicrophoneAndCameraTracks(audioConfig?: MicrophoneAudioTrackInitConfig, videoConfig?: CameraVideoTrackInitConfig): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]>;
    /**
     * Creates a video track for screen sharing.
     *
     * @param config Configurations for the screen-sharing video, such as encoder configuration and capture configuration.
     * @param withAudio Whether to share the audio of the **screen sharing input source** when sharing the screen.
     * - `enable`: Share the audio.
     * - `disable`: (Default) Do not share the audio.
     * - `auto`: Share the audio, dependent on whether the browser supports this function.
     * > Note:
     * > - This function is only supported on Chrome 74 or later on Windows and macOS platforms.
     * > - On Windows, this function allows you to share the audio when sharing the entire screen and sharing Chrome tabs, but not when sharing the application window.
     * On macOS, this function allows you to share the audio only when sharing Chrome tabs.
     * > - For the audio sharing to take effect, the end user must check **Share audio** in the pop-up window when sharing the screen.
     * @returns
     * - If `withAudio` is `enable`, then this method returns a list containing a video track for screen sharing and an audio track. If the end user does not check **Share audio**, the SDK throws an error.
     * - If `withAudio` is `disable`, then this method returns a video track for screen sharing.
     * - If `withAudio` is `auto`, then the SDK attempts to share the audio on browsers supporting this function.
     *   - If the end user checks **Share audio**, then this method returns a list containing a video track for screen sharing and an audio track.
     *   - If the end user does not check **Share audio**, then this method only returns a video track for screen sharing.
     * @category Local Track
     */
    createScreenVideoTrack(config: ScreenVideoTrackInitConfig, withAudio: "enable"): Promise<[ILocalVideoTrack, ILocalAudioTrack]>;
    /**
     * Creates a video track for screen sharing.
     *
     * @param config Configurations for the screen-sharing video, such as encoder configuration and capture configuration.
     * @param withAudio Whether to share the audio of the **screen sharing input source** when sharing the screen.
     * - `enable`: Share the audio.
     * - `disable`: (Default) Do not share the audio.
     * - `auto`: Share the audio, dependent on whether the browser supports this function.
     * > Note:
     * > - This function is only supported on Chrome 74 or later on Windows and macOS platforms.
     * > - On Windows, this function allows you to share the audio when sharing the entire screen and sharing Chrome tabs, but not when sharing the application window.
     * On macOS, this function allows you to share the audio only when sharing Chrome tabs.
     * > - For the audio sharing to take effect, the end user must check **Share audio** in the pop-up window when sharing the screen.
     * @returns
     * - If `withAudio` is `enable`, then this method returns a list containing a video track for screen sharing and an audio track. If the end user does not check **Share audio**, the SDK throws an error.
     * - If `withAudio` is `disable`, then this method returns a video track for screen sharing.
     * - If `withAudio` is `auto`, then the SDK attempts to share the audio on browsers supporting this function.
     *   - If the end user checks **Share audio**, then this method returns a list containing a video track for screen sharing and an audio track.
     *   - If the end user does not check **Share audio**, then this method only returns a video track for screen sharing.
     */
    createScreenVideoTrack(config: ScreenVideoTrackInitConfig, withAudio: "disable"): Promise<ILocalVideoTrack>;
    /**
     * Creates a video track for screen sharing.
     *
     * @param config Configurations for the screen-sharing video, such as encoder configuration and capture configuration.
     * @param withAudio Whether to share the audio of the **screen sharing input source** when sharing the screen.
     * - `enable`: Share the audio.
     * - `disable`: (Default) Do not share the audio.
     * - `auto`: Share the audio, dependent on whether the browser supports this function.
     * > Note:
     * > - This function is only supported on Chrome 74 or later on Windows and macOS platforms.
     * > - On Windows, this function allows you to share the audio when sharing the entire screen and sharing Chrome tabs, but not when sharing the application window.
     * On macOS, this function allows you to share the audio only when sharing Chrome tabs.
     * > - For the audio sharing to take effect, the end user must check **Share audio** in the pop-up window when sharing the screen.
     * @returns
     * - If `withAudio` is `enable`, then this method returns a list containing a video track for screen sharing and an audio track. If the end user does not check **Share audio**, the SDK throws an error.
     * - If `withAudio` is `disable`, then this method returns a video track for screen sharing.
     * - If `withAudio` is `auto`, then the SDK attempts to share the audio on browsers supporting this function.
     *   - If the end user checks **Share audio**, then this method returns a list containing a video track for screen sharing and an audio track.
     *   - If the end user does not check **Share audio**, then this method only returns a video track for screen sharing.
     */
    createScreenVideoTrack(config: ScreenVideoTrackInitConfig, withAudio?: "enable" | "disable" | "auto"): Promise<[ILocalVideoTrack, ILocalAudioTrack] | ILocalVideoTrack>;
    /**
     * Enumerates the media input and output devices available, such as microphones, cameras, and headsets.
     *
     * If this method call succeeds, the SDK returns a list of media devices in an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects.
     *
     * > Calling this method turns on the camera and microphone shortly for the device permission request. On browsers including Chrome 81 or later, Firefox, and Safari, the SDK cannot get accurate device information without permission for the media device.
     *
     * ```javascript
     * getDevices().then(devices => {
     * console.log("first device id", devices[0].deviceId);
     * }).catch(e => {
     * console.log("get devices error!", e);
     * });
     * ```
     * @param skipPermissionCheck Whether to skip the permission check. If you set this parameter as `true`, the SDK does not trigger the request for media device permission. In this case, the retrieved media device information may be inaccurate.
     * - `true`: Skip the permission check.
     * - `false`: (Default) Do not skip the permission check.
     * @category Media Devices
     */
    getDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * Enumerates the audio sampling devices available, such as microphones.
     *
     * If this method call succeeds, the SDK returns a list of audio input devices in an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects.
     *
     * > Calling this method turns on the microphone shortly for the device permission request. On browsers including Chrome 81 or later, Firefox, and Safari, the SDK cannot get accurate device information without permission for the media device.
     *
     * @param skipPermissionCheck Whether to skip the permission check. If you set this parameter as `true`, the SDK does not trigger the request for media device permission. In this case, the retrieved media device information may be inaccurate.
     * - `true`: Skip the permission check.
     * - `false`: (Default) Do not skip the permission check.
     * @category Media Devices
     */
    getMicrophones(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * Enumerates the video capture devices available, such as cameras.
     *
     * If this method call succeeds, the SDK returns a list of video input devices in an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects.
     *
     * > Calling this method turns on the camera shortly for the device permission request. On browsers including Chrome 81 or later, Firefox, and Safari, the SDK cannot get accurate device information without permission for the media device.
     *
     * @param skipPermissionCheck Whether to skip the permission check. If you set this parameter as `true`, the SDK does not trigger the request for media device permission. In this case, the retrieved media device information may be inaccurate.
     * - `true`: Skip the permission check.
     * - `false`: (Default) Do not skip the permission check.
     * @category Media Devices
     */
    getCameras(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Enumerates the audio playback devices available, such as speakers.
     *
     * If this method call succeeds, the SDK returns a list of audio playback devices in an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects.
     *
     * > Calling this method turns on the microphone briefly for the device permission request. On browsers including Chrome 81 or later, Firefox, and Safari, the SDK cannot get accurate device information without permission for the media device.
     *
     * @param skipPermissionCheck Whether to skip the permission check. If you set this parameter as `true`, the SDK does not trigger the request for media device permission. In this case, the retrieved media device information may be inaccurate.
     * - `true`: Skip the permission check.
     * - `false`: (Default) Do not skip the permission check.
     * @category Media Devices
     */
    getPlaybackDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * Gets the sources for screen-sharing through Electron.
     *
     * If this method call succeeds, the SDK returns a list of screen sources in an array of {@link ElectronDesktopCapturerSource} objects.
     * @param type The type of screen sources (window/application/screen) to get. See {@link ScreenSourceType}. If it is left empty, this method gets all the available sources.
     * @category Media Devices
     */
    getElectronScreenSources(type?: ScreenSourceType): Promise<ElectronDesktopCapturerSource[]>;
    /**
     * Sets the output log level of the SDK.
     *
     * Choose a level to see the logs preceding that level. The log level follows the sequence of NONE, ERROR, WARNING, INFO, and DEBUG.
     *
     * For example, if you set the log level as `AgoraRTC.Logger.setLogLevel(1);`, then you can see logs in levels INFO, ERROR, and WARNING.
     * @param level The output log level.
     * - 0: DEBUG. Output all API logs.
     * - 1: INFO. Output logs of the INFO, WARNING and ERROR level.
     * - 2: WARNING. Output logs of the WARNING and ERROR level.
     * - 3: ERROR. Output logs of the ERROR level.
     * - 4: NONE. Do not output any log.
     * @category Logger
     */
    setLogLevel(level: number): void;
    /**
     * Enables log upload.
     *
     * Call this method to enable log upload to Agora’s server.
     *
     * The log-upload function is disabled by default. To enable this function, you must call this method before calling all the other methods.
     *
     * > If a user fails to join the channel, the log information (for that user) is unavailable on Agora's server.
     * @category Logger
     */
    enableLogUpload(): void;
    /**
     * Disables log upload.
     *
     * The log-upload function is disabled by default. If you have called {@link enableLogUpload}, then call this method when you need to stop uploading the log.
     * @category Logger
     */
    disableLogUpload(): void;
    /**
     * Creates an object for configuring the media stream relay.
     */
    createChannelMediaRelayConfiguration(): IChannelMediaRelayConfiguration;
    /**
     * Checks whether a video track is active.
     *
     * The SDK determines whether a video track is active by checking for image changes during the specified time frame.
     *
     * Agora recommends calling this method before starting a call to check the availability of the video capture device. You can pass the camera video track as a parameter in this method to check whether the camera works.
     *
     * > Notes:
     * > - If a video track is muted, this method returns `false`.
     * > - Do not call this method frequently as the check may affect web performance.
     *
     * ``` javascript
     * const videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId });
     * AgoraRTC.checkVideoTrackIsActive(videoTrack).then(result => {
     *   console.log(`${ cameraLabel } is ${ result ? "available" : "unavailable" }`);
     * }).catch(e => {
     *   console.log("check video track error!", e);
     * });
     * ```
     *
     * @param track The local or remote video track to be checked.
     * @param timeout The time frame (ms) for checking. The default value is 5,000 ms.
     *
     * @returns Whether the image in the specified video track changes during the specified time frame:
     * - `true`: The image changes. For the camera video track, it means the video capture device works.
     * - `false`: The image does not change. Possible reasons:
     *   - The video capturing device does not work properly or is blocked.
     *   - The video track is muted.
     */
    checkVideoTrackIsActive(track: ILocalVideoTrack | IRemoteVideoTrack, timeout?: number): Promise<boolean>;
    /**
     * Check whether an audio track is active.
     *
     * The SDK determines whether an audio track is active by checking whether the volume changes during the specified time frame.
     *
     * Agora recommends calling this method before starting a call to check the availability of the audio sampling device. You can pass the audio track from the audio sampled by a microphone as a parameter in this method to check whether the microphone works.
     *
     * > Notes:
     * > - The check may fail in a quiet environment. Agora suggests you instruct the end user to speak or make some noise when calling this method.
     * > - If an audio track is muted, this method returns `false`.
     * > - Do not call this method frequently as the check may affect web performance.
     *
     * ``` javascript
     * const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId });
     * AgoraRTC.checkAudioTrackIsActive(audioTrack).then(result => {
     *   console.log(`${ microphoneLabel } is ${ result ? "available" : "unavailable" }`);
     * }).catch(e => {
     *   console.log("check audio track error!", e);
     * });
     * ```
     *
     * @param track The local or remote audio track to be checked.
     * @param timeout The time frame (ms) for checking. The default value is 5,000 ms.
     *
     * @returns Whether the volume in the specified audio track changes during the specified time frame:
     * - `true`: The volume changes. For the microphone audio track, it means the audio sampling device works.
     * - `false`: The volume does not change. Possible reasons:
     *   - The audio sampling device does not work properly.
     *   - The volume in the customized audio track does not change.
     *   - The audio track is muted.
     */
    checkAudioTrackIsActive(track: ILocalAudioTrack | IRemoteAudioTrack, timeout?: number): Promise<boolean>;
    /**
     * Occurs when a video capture device is added or removed.
     *
     * ``` javascript
     * AgoraRTC.onCameraChanged = (info) => {
     *   console.log("camera changed!", info.state, info.device);
     * };
     * ```
     * **Parameters**
     *
     * - **deviceInfo**: The information of the video capture device. See {@link DeviceInfo}.
     *
     * @category Global Callback
     */
    onCameraChanged?: (deviceInfo: DeviceInfo) => void;
    /**
     * Occurs when an audio sampling device is added or removed.
     *
     * ``` javascript
     * AgoraRTC.onMicrophoneChanged = (info) => {
     *   console.log("microphone changed!", info.state, info.device);
     * };
     * ```
     * **Parameters**
     *
     * - **deviceInfo**: The information of the device. See {@link DeviceInfo}.
     * @category Global Callback
     */
    onMicrophoneChanged?: (deviceInfo: DeviceInfo) => void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Occurs when an audio playback device is added or removed.
     *
     * ``` javascript
     * AgoraRTC.onPlaybackDeviceChanged = (info) => {
     *   console.log("speaker changed!", info.state, info.device);
     * };
     * ```
     * **Parameters**
     *
     * - **deviceInfo**: The information of the device. See {@link DeviceInfo}.
     * @category Global Callback
     */
    onPlaybackDeviceChanged?: (deviceInfo: DeviceInfo) => void;
    /**
     * Occurs when the autoplay of an audio track fails.
     *
     * The autoplay failure is caused by browsers' [autoplay blocking](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#Autoplay_and_autoplay_blocking), which does not affect video tracks.
     *
     * In the Agora Web SDK, once the user has interacted with the webpage, the autoplay blocking is removed. You can deal with the issue in either of the following ways:
     * - If you do not want to receive the `onAudioAutoplayFailed` callback, ensure that the user has interacted with the webpage before `RemoteAudioTrack.play` or `LocalAudioTrack.play` is called.
     * - If you cannot guarantee a user interaction before the call of `RemoteAudioTrack.play` or `LocalAudioTrack.play`, you can display a button and instruct the user to click it in the `onAudioAutoplayFailed` callback.
     * > As long as the browser blocks autoplay, autoplay with sound is impossible before user interaction. As the number of visits on a webpage increases, the browser adds it to the autoplay whitelist, but this information is not accessible by JavaScript.
     *
     * The following example demonstrates how to display a button for the user to click when autoplay fails.
     *
     * > If multiple audio tracks call `play()`, the `onAudioAutoplayFailed` is triggered multiple times. The example uses the `isAudioAutoplayFailed` object to avoid repeatedly creating buttons.
     * ```javascript
     *  let isAudioAutoplayFailed = false;
     *  AgoraRTC.onAudioAutoplayFailed = () => {
     *   if (isAudioAutoplayFailed) return;
     *
     *   isAudioAutoplayFailed = true;
     *   const btn = document.createElement("button");
     *   btn.innerText = "Click me to resume the audio playback";
     *   btn.onClick = () => {
     *     isAudioAutoplayFailed = false;
     *     btn.remove();
     *   };
     *   document.body.append(btn);
     * };
     * ```
     * @category Global Callback
     */
    onAudioAutoplayFailed?: () => void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.2.0*
     *
     * Sets the region for connection.
     *
     * This advanced feature applies to scenarios that have regional restrictions.
     *
     * By default, the SDK connects to nearby Agora servers. After specifying the region, the SDK connects to the Agora servers within that region.
     *
     * > Note: The SDK supports specifying only one region.
     *
     * @param area The region for connection. For details, see {@link AREAS}.
     */
    setArea: (area: AREAS[]) => void;
}

/**
 * An interface providing the local client with basic functions for a voice or video call, such as joining a channel, publishing tracks, or subscribing to tracks.
 *
 * An `AgoraRTCClient` object is created by the [[createClient]] method.
 * @public
 */
export declare interface IAgoraRTCClient extends EventEmitter {
    /**
     * Connection state between the SDK and the Agora server.
     */
    readonly connectionState: ConnectionState;
    /**
     * A list of the remote users in the channel, each of which includes the user ID and the corresponding track information.
     *
     * The list is empty if the local user has not joined a channel.
     */
    readonly remoteUsers: IAgoraRTCRemoteUser[];
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * The list of the local tracks that the local user is publishing.
     *
     * - After a success method call of [[publish]], the published track object is added to this list automatically.
     * - After a success method call of [[unpublish]], the unpublished track object is removed from this list automatically.
     */
    readonly localTracks: ILocalTrack[];
    /**
     * The ID of the local user.
     *
     * The value is `undefined` if the local user has not joined a channel.
     */
    readonly uid?: UID;
    /**
     * The current channel name.
     *
     * The value is `undefined` if the local user has not joined a channel.
     */
    readonly channelName?: string;
    on(event: "connection-state-change", listener: typeof event_connection_state_change): void;
    on(event: "user-joined", listener: typeof event_user_joined): void;
    on(event: "user-left", listener: typeof event_user_left): void;
    on(event: "user-published", listener: typeof event_user_published): void;
    on(event: "user-unpublished", listener: typeof event_user_unpublished): void;
    on(event: "user-info-updated", listener: typeof event_user_info_updated): void;
    on(event: "media-reconnect-start", listener: typeof event_media_reconnect_start): void;
    on(event: "media-reconnect-end", listener: typeof event_media_reconnect_end): void;
    on(event: "stream-type-changed", listener: typeof event_stream_type_changed): void;
    on(event: "stream-fallback", listener: typeof event_stream_fallback): void;
    on(event: "channel-media-relay-state", listener: typeof event_channel_media_relay_state): void;
    on(event: "channel-media-relay-event", listener: typeof event_channel_media_relay_event): void;
    on(event: "volume-indicator", listener: typeof event_volume_indicator): void;
    on(event: "crypt-error", listener: typeof event_crypt_error): void;
    on(event: "token-privilege-will-expire", listener: typeof event_token_privilege_will_expire): void;
    on(event: "token-privilege-did-expire", listener: typeof event_token_privilege_did_expire): void;
    on(event: "network-quality", listener: typeof event_network_quality): void;
    on(event: "live-streaming-error", listener: typeof event_live_streaming_error): void;
    on(event: "live-streaming-warning", listener: typeof event_live_streaming_warning): void;
    on(event: "stream-inject-status", listener: typeof event_stream_inject_status): void;
    on(event: "exception", listener: typeof event_exception): void;
    on(event: string, listener: Function): void;
    /**
     * Allows a user to join a channel.
     *
     * Users in the same channel can talk to each other.
     *
     * When joining a channel, the [AgoraRTCClient.on("connection-state-change")]{@link event_connection_state_change} callback is triggered on the local client.
     *
     * After joining a channel, if the user is in the communication profile, or is a host in the Live Broadcast profile, the [AgoraRTCClient.on("user-joined")]{@link event_user_joined} callback is triggered on the remote client.
     *
     * @param appid The [App ID](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#appid) of your Agora project.
     * @param token The token generated at your server:
     * - For low-security requirements: You can use the temporary token generated at Console. For details, see [Get a temporary token](https://docs.agora.io/en/Video/token?platform=All%20Platforms#get-a-temporary-token).
     * - For high-security requirements: Set it as the token generated at your server. For details, see [Get a token](https://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms#get-a-token).
     * @param channel A string that provides a unique channel name for the call. The length must be within 64 bytes. Supported character scopes:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - Punctuation characters and other symbols, including: "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param uid The user ID, an integer or a string, ASCII characters only. Ensure this ID is unique. If you set the uid to `null`, the server assigns one and returns it in the Promise object.
     *
     * > Note:
     * > - All users in the same channel should have the same type (number or string) of `uid`.
     * > - If you use a number as the user ID, it should be a 32-bit unsigned integer with a value ranging from 0 to (2<sup>32</sup>-1).
     * > - If you use a string as the user ID, the maximum length is 255 characters.
     *
     * @returns A Promise object with the user ID (number).
     * @category Agora Core
     */
    join(appid: string, channel: string, token: string | null, uid?: UID | null): Promise<UID>;
    /**
     * Leaves a channel.
     *
     * When leaving the channel, the [AgoraRTCClient.on("connection-state-change")]{@link IAgoraRTCClient.event_connection_state_change} callback is triggered on the local client.
     *
     * When a user (in the communication profile) or a host (in the live-broadcast profile) leaves the channel, the [AgoraRTCClient.on("user-left")]{@link IAgoraRTCClient.event_user_left} callback is triggered on each remote client in the channel.
     * @category Agora Core
     */
    leave(): Promise<void>;
    /**
     * Publishes local audio and/or video tracks to a channel.
     *
     * After publishing the local tracks, the [AgoraRTCClient.on("user-published")]{@link event_user_published} callback is triggered on the remote client.
     *
     * > Note:
     * > - In a live broadcast channel, call {@link setClientRole} to set the user role as host before calling this method.
     * > - You can call this method multiple times to add tracks for publishing.
     * > - An `AgoraRTCClient` object can publish multiple audio tracks. The SDK automatically mixes the audio tracks into one audio track. Exception: Safari does not support publishing multiple audio tracks on versions earlier than Safari 12.
     * > - An `AgoraRTCClient` object can publish **only one video track**. If you want to switch the published video track, for example, from a camera video track to a scree-sharing video track, you must unpublish the published video track.
     * @param tracks Local tracks created by [AgoraRTC.createMicrophoneAudioTrack]{@link IAgoraRTC.createMicrophoneAudioTrack} / [AgoraRTC.createCameraVideoTrack]{@link IAgoraRTC.createCameraVideoTrack} or other methods.
     * @category Agora Core
     */
    publish(tracks: ILocalTrack | ILocalTrack[]): Promise<void>;
    /**
     * Unpublishes the local audio and/or video tracks.
     *
     * After the local client unpublishes, the [AgoraRTCClient.on("user-unpublished")]{@link event_user_unpublished} callback is triggered on each remote client in the channel.
     *
     * @param tracks The tracks to unpublish. If left empty, all the published tracks are unpublished.
     * @category Agora Core
     */
    unpublish(tracks?: ILocalTrack | ILocalTrack[]): Promise<void>;
    subscribe(user: IAgoraRTCRemoteUser, mediaType: "video"): Promise<IRemoteVideoTrack>;
    subscribe(user: IAgoraRTCRemoteUser, mediaType: "audio"): Promise<IRemoteAudioTrack>;
    /**
     * Subscribes to the audio and/or video tracks of a remote user.
     *
     * ```javascript
     * await client.subscribe(user，"audio");
     * user.audioTrack.play();
     * ```
     * @param user The remote user.
     * @param mediaType The media type of the tracks to subscribe to.
     * - `"video"`: Subscribe to the video track only.
     * - `“audio”`: Subscribe to the audio track only.
     *
     * @returns When the subscription succeeds, the SDK adds the subscribed tracks to [user.audioTrack]{@link IAgoraRTCRemoteUser.audioTrack} and [user.videoTrack]{@link IAgoraRTCRemoteUser.videoTrack}. You can go on to call [audioTrack.play]{@link IRemoteAudioTrack.play} or [videoTrack.play]{@link IRemoteVideoTrack.play} to play the tracks.
     * > The `Promise` object throws the `TRACK_IS_NOT_PUBLISHED` error if the specified tracks do not exist.
     * @category Agora Core
     */
    subscribe(user: IAgoraRTCRemoteUser, mediaType: "video" | "audio"): Promise<IRemoteTrack>;
    /**
     * Unsubscribes from the audio and/or tracks of a remote user.
     *
     * @param user The remote user.
     * @param mediaType The media type of the tracks to unsubscribe from:
     * - `"video"`: Unsubscribe from the video track only.
     * - `“audio”`: Unsubscribe from the audio track only.
     * - empty: Unsubscribe from all the tracks published by the remote user.
     * @returns The `Promise` object throws the `TRACK_IS_NOT_SUBSCRIBED` error if the specified tracks do not exist.
     * @category Agora Core
     */
    unsubscribe(user: IAgoraRTCRemoteUser, mediaType?: "video" | "audio"): Promise<void>;
    /**
     * Sets the video profile of the low-quality video stream.
     *
     * If you have enabled the dual-stream mode by calling {@link enableDualStream}, use this method to set the low-quality video stream profile.
     *
     * If you do not set the low-quality video stream profile, the SDK assigns the default values based on your stream video profile.
     *
     * > Note:
     * > - Frame rate settings do not take effect on Firefox. The browser sets the frame rate as 30 fps.
     * > - Due to limitations of some devices and browsers, the resolution you set may get adjusted by the browser. In this case, billings are calculated based on the actual resolution.
     * > - Call this method before calling {@link publish}.
     * @param streamParameter The video profile of the low-quality video stream.
     * @category Dual Stream
     */
    setLowStreamParameter(streamParameter: LowStreamParameter): void;
    /**
     * Enables dual-stream mode.
     *
     * Enables dual-stream mode for the local stream. Dual streams are a hybrid of a high-quality video stream and a low-quality video stream:
     * - High-quality video stream: High bitrate, high resolution.
     * - Low-quality video stream: Low bitrate, low resolution.
     *
     * > Note:
     * > - This method is not supported on Safari.
     * > - Dual-stream mode is not supported mobile devices.
     *
     * ```javascript
     * client.enableDualStream().then(() => {
     *   console.log("Enable Dual stream success!");
     * }).catch(err => {
     *   console.log(err);
     * })
     * ```
     * @category Dual Stream
     */
    enableDualStream(): Promise<void>;
    /**
     * Disables dual-stream mode.
     * @category Dual Stream
     */
    disableDualStream(): Promise<void>;
    /**
     * Sets the user role and level in a live streaming (when [mode]{@link ClientConfig.mode} is `"live"`).
     *
     * - The user role determines the permissions that the SDK grants to a user, such as permission to publish local streams, subscribe to remote streams, and push streams to a CDN address. You can set the user role as `"host"` or `"audience"`. A host can publish and subscribe to streams, while an audience member can only subscribe to streams. The default role in a live streaming is `"audience"`. Before publishing tracks, you must call this method to set the user role as `"host"`.
     * - The detailed options of a user, including the user level. The user level determines the level of services that a user can enjoy within the permissions of the user's role. For example, an audience can choose to receive remote streams with low latency or ultra low latency. Levels affect prices.
     *
     * > Note:
     * > - When [mode]{@link ClientConfig.mode} is `"rtc"`, this method does not take effect and all users are `"host"` by default.
     * > - If the local client switches the user role after joining a channel, the SDK triggers the [AgoraRTCClient.on("user-joined")]{@link event_user_joined} or [AgoraRTCClient.on("user-left")]{@link event_user_left} callback on the remote client.
     * > - To switch the user role to `"audience"` after calling {@link publish}, call {@link unpublish} first. Otherwise the method call fails and throws an exception.
     *
     * @param role The role of the user.
     * @param options The detailed options of a user, including user level.
     */
    setClientRole(role: ClientRole, options?: ClientRoleOptions): Promise<void>;
    /**
     * @ignore
     * Deploys a proxy server.
     *
     * You can also use cloud proxy by {@link startProxyServer}. See [Use Cloud Proxy](https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web?platform=Web) for details.
     *
     * > Note:
     * > - Call this method before {@link join}.
     * > - Proxy services by different service providers may result in slow performance if you are using the Firefox browser. Therefore, Agora recommends using the same service provider for the proxy services. If you use different service providers, Agora recommends not using the Firefox browser.
     * @param proxyServer Your proxy server domain name. ASCII characters only.
     * @category Proxy
     */
    setProxyServer(proxyServer: string): void;
    /**
     * @ignore
     * Deploys a TURN server.
     *
     * You can also use cloud proxy by {@link startProxyServer}. See [Use Cloud Proxy](https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web?platform=Web) for details.
     *
     * > Call this method before {@link join}.
     *
     * @param turnServer The TURN server settings.
     * @category Proxy
     */
    setTurnServer(turnServer: TurnServerConfig): void;
    /**
     * Enables cloud proxy.
     *
     * You must call this method before joining the channel or after leaving the channel.
     *
     * For the extra settings required for using the cloud proxy service, see [Use Cloud Proxy](https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web).
     *
     * @param mode Cloud proxy mode.
     * @category Proxy
     */
    startProxyServer(mode?: number): void;
    /**
     * Disables cloud proxy.
     *
     * You must call this method before joining the channel or after leaving the channel.
     * @category Proxy
     */
    stopProxyServer(): void;
    /**
     * Sets the video type of a remote stream.
     *
     * If a remote user enables dual-stream mode, use this method to set which stream to subscribe to. The local client subscribes to the high-quality video stream by default.
     *
     * > This method works only if the remote client has enabled dual-stream mode ({@link enableDualStream}).
     * @param uid The ID of the remote user.
     * @param streamType The remote video stream type. The following lists the video-stream types:
     * - 0: High-bitrate, high-resolution video stream.
     * - 1: Low-bitrate, low-resolution video stream.
     * @category Dual Stream
     */
    setRemoteVideoStreamType(uid: UID, streamType: RemoteStreamType): Promise<void>;
    /**
     * Sets the stream fallback option.
     *
     * Use this method to set the fallback option for the subscribed video stream.
     * Under poor network conditions, the SDK can subscribe to the low-quality video stream or only to the audio stream.
     *
     * If the auto-fallback option is enabled, the SDK triggers the [AgoraRTCClient.on("stream-type-changed")]{@link event_stream_type_changed} callback when the remote stream changes from a high-quality video stream to a low-quality video stream or vice versa, and triggers the [AgoraRTCClient.on("stream-fallback")]{@link event_stream_fallback} callback when the remote stream changes from a video stream to an audio stream or vice versa.
     *
     * > This method works only if the remote user has enabled the dual-stream mode by {@link enableDualStream}.
     * @param uid The ID of the remote user.
     * @param fallbackType The fallback option. See {@link RemoteStreamFallbackType} for details.
     * @category Dual Stream
     */
    setStreamFallbackOption(uid: UID, fallbackType: RemoteStreamFallbackType): Promise<void>;
    /**
     * Sets the encryption configurations.
     *
     * Use this method to enable the built-in encryption before joining a channel.
     *
     * If the encryption configurations are incorrect, the SDK triggers the [AgoraRTCClient.on("crypt-error")]{@link event_crypt_error} callback when publishing tracks or subscribing to tracks.
     *
     * > Notes:
     * > - All users in a channel must use the same encryption configurations.
     * > - You must call this method before joining a channel, otherwise the method call does not take effect and encryption is not enabled.
     * > - Do not use this method for CDN live streaming.
     *
     * @param encryptionMode The encryption mode.
     * @param secret The encryption secret. ASCII characters only. When a user uses a weak secret, the SDK outputs a warning message to the Web Console and prompts the users to set a strong secret. A strong secret must contain at least eight characters and be a combination of uppercase and lowercase letters, numbers, and special characters.
     */
    setEncryptionConfig(encryptionMode: EncryptionMode, secret: string): void;
    /**
     * Renews the token.
     *
     * The token expires after a set time once token is enabled. When the SDK triggers the [AgoraRTCClient.on("token-privilege-will-expire")]{@link event_token_privilege_will_expire} callback, call this method to pass a new token. Otherwise the SDK disconnects from the server.
     * @param token The new token.
     */
    renewToken(token: string): Promise<void>;
    /**
     * Enables the volume indicator.
     *
     * This method enables the SDK to regularly report the remote users who are speaking and their volumes.
     *
     * After the volume indicator is enabled, the SDK triggers the [AgoraRTCClient.on("volume-indicator")]{@link event_volume_indicator} callback to report the volumes every two seconds, regardless of whether there are active speakers in the channel.
     *
     * ```javascript
     * client.enableAudioVolumeIndicator();
     * client.on("volume-indicator", volumes => {
     *   volumes.forEach((volume, index) => {
     *     console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
     *   });
     * })
     * ```
     */
    enableAudioVolumeIndicator(): void;
    /**
     * Gets the statistics of the call.
     *
     * @returns The statistics of the call.
     */
    getRTCStats(): AgoraRTCStats;
    /**
     * Sets the video layout and audio for CDN live streaming.
     *
     * > Ensure that you [enable the RTMP Converter service](https://docs.agora.io/en/Interactive%20Broadcast/cdn_streaming_web?platform=Web#prerequisites) before using this function.
     * @param config Configurations for live transcoding. See {@link LiveStreamingTranscodingConfig} for details.
     * @category Live Streaming
     */
    setLiveTranscoding(config: LiveStreamingTranscodingConfig): Promise<void>;
    /**
     * Publishes the local stream to the CDN.
     *
     * See [Push Streams to the CDN](https://docs.agora.io/en/Interactive%20Broadcast/cdn_streaming_web?platform=Web) for details.
     *
     * > Note:
     * > - This method adds only one stream HTTP/HTTPS URL address each time it is called.
     * > - Pushing streams to the CDN is not supported on mobile devices.
     *
     * @param url The CDN streaming URL in the RTMP format. ASCII characters only.
     * @param transcodingEnabled Whether to enable live transcoding.
     * Transcoding sets the audio and video profiles and the picture-in-picture layout for the stream to be pushed to the CDN. It is often used to combine the audio and video streams of multiple hosts in a CDN live stream.
     * > If set as `true`, {@link setLiveTranscoding} must be called before this method.
     * - `true`: Enable transcoding.
     * - `false`: (Default) Disable transcoding.
     * @category Live Streaming
     */
    startLiveStreaming(url: string, transcodingEnabled?: boolean): Promise<void>;
    /**
     * Removes a URL from CDN live streaming.
     *
     * This method removes only one URL address each time it is called. To remove multiple URLs, call this method multiple times.
     * @param url The URL to be removed.
     * @category Live Streaming
     */
    stopLiveStreaming(url: string): Promise<void>;
    /**
     * Injects an online media stream to a live-broadcast channel.
     *
     * After you call this method, the server pulls the online stream and injects it into a live-broadcast channel. This is applicable to scenarios where all audience members in the channel can watch a live show and interact with each other. See [Inject Online Media Stream](https://docs.agora.io/en/Interactive%20Broadcast/inject_stream_web_ng?platform=Web) for details.
     *
     * If the online media stream is injected successfully, this stream is added to the channel, and all users in the channel receive the [AgoraRTCClient.on("user-published")]{@link event_user_published} and [AgoraRTCClient.on("user-joined")]{@link event_user_joined} callbacks with the `uid` 666.
     *
     * The SDK reports the status of the media stream by triggering the [AgoraRTCClient.on("stream-inject-status")]{@link event_stream_inject_status} event.
     *
     * @param url The URL address to be injected to the ongoing live broadcast. ASCII characters only, and the string length must be less than 1024 bytes. Valid protocols are RTMP, HLS, and HTTP-FLV.
     * - Supported audio codec type: AAC.
     * - Supported video codec type: H264(AVC).
     * @param config Configurations for the injected stream.
     * @category Inject Stream
     */
    addInjectStreamUrl(url: string, config: InjectStreamConfig): Promise<void>;
    /**
     * Removes an injected stream.
     *
     * This method removes an injected stream (added by [[addInjectStreamUrl]]) from the live broadcast.
     *
     * If the injected stream is removed successfully, all users in the channel receive the [AgoraRTCClient.on("user-left")]{@link event_user_left} and [AgoraRTCClient.on("user-unpublished")]{@link event_user_unpublished} callbacks.
     * @category Inject Stream
     */
    removeInjectStreamUrl(): Promise<void>;
    /**
     * Starts relaying media streams across channels.
     *
     * After this method call, the SDK triggers the following callbacks:
     *
     * - [AgoraRTCClient.on("channel-media-relay-state")]{@link event_channel_media_relay_state}, which reports the state and error code of the media stream relay.
     *   - If the media stream relay fails, this callback returns `state` 3. Refer to `code` for the error code and call this method again.
     * - [AgoraRTCClient.on("channel-media-relay-event")]{@link event_channel_media_relay_event}, which reports the events of the media stream relay.
     *   - If the media stream relay starts successfully, this callback returns `code` 4, reporting that the SDK starts relaying the media stream to the destination channel.
     *
     * > Note:
     * >
     * > - Contact sales-us@agora.io to enable this function.
     * > - We do not support string user IDs in this API.
     * > - Call this method only after joining a channel.
     * > - In a live-broadcast channel, only a host can call this method.
     * > - To call this method again after it succeeds, you must call {@link stopChannelMediaRelay} to quit the current relay.
     *
     * ```javascript
     * client.startChannelMediaRelay(config).then(() => {
     *   console.log("startChannelMediaRelay success");
     * }).catch(e => {
     *   console.log("startChannelMediaRelay failed", e);
     * })
     * ```
     * @param config Configurations of the media stream relay.
     * @returns A `Promise` object, which is resolved if the media relay starts successfully.
     * @category Channel Media Relay
     */
    startChannelMediaRelay(config: IChannelMediaRelayConfiguration): Promise<void>;
    /**
     * Updates the destination channels for media stream relay.
     *
     * After the channel media relay starts, if you want to relay the media stream to more channels, or leave the current relay channel, you can call this method.
     *
     * > Note:
     * >
     * > - Call this method after {@link startChannelMediaRelay}.
     * > - You can add a maximum of four destination channels to a relay.
     * @param config Configurations of the media stream relay.
     * @returns A Promise object, which is resolved if the update succeeds. If the update fails, the media relay state is reset, and you need to call {@link startChannelMediaRelay} again to restart the relay.
     * @category Channel Media Relay
     */
    updateChannelMediaRelay(config: IChannelMediaRelayConfiguration): Promise<void>;
    /**
     * Stops the media stream relay.
     *
     * Once the relay stops, the user leaves all the destination channels.
     *
     * @returns A `Promise` object, which is resolved if the relay stops successfully.
     * @category Channel Media Relay
     */
    stopChannelMediaRelay(): Promise<void>;
    /**
     * Reports customized messages to Agora's data center.
     *
     * > Temporarily, Agora supports reporting a maximum of 20 message pieces within 5 seconds.
     *
     * @param params Messages. You can report multiple messages one time.
     *
     * ```js
     * client.sendCustomReportMessage({
     *   reportId: "id1", category: "category1", event: "custom", label: "label1", value: 0,
     * }).then(() => {
     *   console.log("send custom report success");
     * }).catch(e => {
     *   console.error("send custom report error");
     * });
     * ```
     */
    sendCustomReportMessage(reports: EventCustomReportParams[] | EventCustomReportParams): Promise<void>;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the statistics of a local audio track.
     *
     */
    getLocalAudioStats(): LocalAudioTrackStats;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the statistics of remote audio tracks.
     *
     */
    getRemoteAudioStats(): {
        [uid: string]: RemoteAudioTrackStats;
    };
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.2.0*
     *
     * Gets the network quality of all the remote users to whom the local user subscribes.
     *
     */
    getRemoteNetworkQuality(): {
        [uid: string]: NetworkQuality;
    };
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the statistics of a local video track.
     *
     * > Note: You cannot get the `encodeDelay` property on iOS.
     */
    getLocalVideoStats(): LocalVideoTrackStats;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the statistics of remote video tracks.
     *
     */
    getRemoteVideoStats(): {
        [uid: string]: RemoteVideoTrackStats;
    };
}

/**
 * Information about a remote user. You can get this through [AgoraRTCClient.remoteUsers]{@link IAgoraRTCClient.remoteUsers}.
 */
export declare interface IAgoraRTCRemoteUser {
    /**
     * The ID of the remote user.
     */
    uid: UID;
    /**
     * The subscribed audio track.
     */
    audioTrack?: IRemoteAudioTrack;
    /**
     * The subscribed video track.
     */
    videoTrack?: IRemoteVideoTrack;
    /**
     * Whether the remote user is sending an audio track.
     * - `true`: The remote user is sending an audio track.
     * - `false`: The remote user is not sending an audio track.
     */
    hasAudio: boolean;
    /**
     * Whether the remote user is sending a video track.
     * - `true`: The remote user is sending an audio track.
     * - `false`: The remote user is not sending an audio track.
     */
    hasVideo: boolean;
}

/**
 * Inherited from [LocalAudioTrack]{@link ILocalAudioTrack}, `BufferSourceAudioTrack` is an interface for the audio from a local audio file and adds several functions for controlling the processing of the audio buffer, such as starting processing, stopping processing, and seeking a specified time location.
 *
 * You can create an audio track from an audio file by calling [AgoraRTC.createBufferSourceAudioTrack]{@link IAgoraRTC.createBufferSourceAudioTrack}.
 */
export declare interface IBufferSourceAudioTrack extends ILocalAudioTrack {
    /**
     * The [source]{@link BufferSourceAudioTrackInitConfig.source} specified when creating an audio track.
     */
    source: string | File | AudioBuffer;
    /**
     * The current state of audio processing, such as start, pause, or stop.
     */
    currentState: AudioSourceState;
    /**
     * The total duration of the audio (seconds).
     */
    duration: number;
    on(event: "source-state-change", listener: typeof event_source_state_change): void;
    on(event: string, listener: Function): void;
    getCurrentTime(): number;
    /**
     * Starts processing the audio buffer.
     *
     * > Starting processing the audio buffer means that the processing unit in the SDK has received the audio data. If the audio track has been published, the remote user can hear the audio.
     * > Whether the local user can hear the audio depends on whether the SDK calls the [[play]] method and sends the audio data to the sound card.
     *
     * @param options Options for processing the audio buffer. See [[AudioSourceOptions]].
     */
    startProcessAudioBuffer(options?: AudioSourceOptions): void;
    /**
     * Pauses processing the audio buffer.
     */
    pauseProcessAudioBuffer(): void;
    /**
     * Jumps to a specified time point.
     *
     * > Note: This method is not supported on iOS.
     *
     * @param time The specified time point (seconds).
     */
    seekAudioBuffer(time: number): void;
    /**
     * Resumes processing the audio buffer.
     */
    resumeProcessAudioBuffer(): void;
    /**
     * Stops processing the audio buffer.
     */
    stopProcessAudioBuffer(): void;
}

/**
 *
 * Inherited from [LocalVideoTrack]{@link ILocalVideoTrack}, `CameraVideoTrack` is an interface for the video captured by a local camera and adds functions such as switching devices and adjusting video encoder configurations.
 *
 * You can create a local camera video track by calling [AgoraRTC.createCameraVideoTrack]{@link IAgoraRTC.createCameraVideoTrack}.
 */
export declare interface ICameraVideoTrack extends ILocalVideoTrack {
    /**
     * Sets the device for capturing video.
     *
     * > You can call this method either before or after publishing the video track.
     *
     * @param deviceId The ID of the specified device. You can get the `deviceId` by calling [AgoraRTC.getCameras]{@link IAgoraRTC.getCameras}.
     */
    setDevice(deviceId: string): Promise<void>;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Enables/Disables the track.
     *
     * After a track is disabled, the SDK stops playing and publishing the track.
     *
     * > - Disabling a track does not trigger the [LocalTrack.on("track-ended")]{@link event_track_ended} event.
     * > - If a track is published, disabling this track triggers the [user-unpublished]{@link IAgoraRTCClient.event_user_unpublished} event on the remote client, and re-enabling this track triggers the [user-published]{@link IAgoraRTCClient.event_user_published} event.
     *
     * @param enabled Whether to enable the track:
     * - `true`: Enable the track.
     * - `false`: Disable the track.
     */
    setEnabled(enabled: boolean): Promise<void>;
    /**
     * Sets the video encoder configurations, such as resolution, frame rate, and bitrate.
     *
     * > Note: This method is not supported on mobile devices.
     *
     * @param config The video encoder configurations. You can pass either [[VideoEncoderConfigurationPreset]] or a customized [[VideoEncoderConfiguration]] object.
     */
    setEncoderConfiguration(config: VideoEncoderConfiguration | VideoEncoderConfigurationPreset): Promise<void>;
}

/**
 * Configurations of the media stream relay.
 *
 * Use this interface to set the media stream relay when calling [startChannelMediaRelay]{@link IAgoraRTCClient.startChannelMediaRelay} or [updateChannelMediaRelay]{@link IAgoraRTCClient.updateChannelMediaRelay}.
 *
 * ```javascript
 * const configuration = AgoraRTC.createChannelMediaRelayConfiguration();
 * configuration.setSrcChannelInfo({ channelName: "test", token: "xxx", uid: 12345 });
 * configuration.addDestChannelInfo({ channelName: "test2", token: "xxx", uid: 23456 });
 * ```
 */
export declare interface IChannelMediaRelayConfiguration {
    /**
     * Sets the information of the source channel.
     *
     * ```javascript
     * const config = new ChannelMediaRelayConfiguration();
     * config.setSrcChannelInfo({ channelName: "test", token: "xxx", uid: 123456 });
     * ```
     * @param info The information of the source channel.
     */
    setSrcChannelInfo(info: ChannelMediaRelayInfo): void;
    /**
     * Adds a destination channel.
     *
     * To relay a media stream across multiple channels, call this method as many times (to a maximum of four).
     *
     * ```javascript
     * const config = new ChannelMediaRelayConfiguration();
     * config.addDestChannelInfo({ channelName: "test2", token: "xxx", uid: 23456 });
     * config.addDestChannelInfo({ channelName: "test3", token: "xxx", uid: 23457 });
     * ```
     *
     * @param info The information of the destination channel.
     */
    addDestChannelInfo(info: ChannelMediaRelayInfo): void;
    /**
     * Removes the destination channel added through {@link addDestChannelInfo}.
     * @param channelName The name of the destination channel to be removed.
     */
    removeDestChannelInfo(channelName: string): void;
}

/**
 * @ignore
 */
declare interface IElectronNativeImage {
    toDataURL(): string;
}

/**
 * `LocalAudioTrack` is the basic interface for local audio tracks, providing main methods of local audio tracks.
 *
 * You can create a local audio track by calling [AgoraRTC.createCustomAudioTrack]{@link IAgoraRTC.createCustomAudioTrack}.
 *
 * The following interfaces are inherited from `LocalAudioTrack`:
 * - [MicrophoneAudioTrack]{@link IMicrophoneAudioTrack}, the interface for the audio sampled by a local microphone, which adds several microphone-related functions.
 * - [BufferSourceAudioTrack]{@link IBufferSourceAudioTrack}, the interface for the audio from a local audio file, which adds several audio-file-related functions.
 */
export declare interface ILocalAudioTrack extends ILocalTrack {
    /**
     * Sets the volume of a local audio track.
     *
     * @param volume The volume. The value ranges from 0 (mute) to 1000 (maximum). A value of 100 is the original volume.
     */
    setVolume(volume: number): void;
    /**
     * Gets the audio level of a local audio track.
     *
     * @returns The audio level. The value range is [0,1]. 1 is the highest audio level.
     */
    getVolumeLevel(): number;
    /**
     * Sets the callback for getting raw audio data in PCM format.
     *
     * After you successfully set the callback, the SDK constantly returns the audio frames of a local audio track in this callback by using [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer).
     *
     * > You can set the `frameSize` parameter to determine the frame size in each callback, which affects the interval between the callbacks. The larger the frame size, the longer the interval between them.
     *
     * ```js
     * track.setAudioFrameCallback((buffer) => {
     *   for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
     *     // Float32Array with PCM data
     *     const currentChannelData = buffer.getChannelData(channel);
     *     console.log("PCM data in channel", channel, currentChannelData);
     *   }
     * }, 2048);
     *
     * // ....
     * // Stop getting the raw audio data
     * track.setAudioFrameCallback(null);
     * ```
     *
     * @param audioFrameCallback The callback function for receiving the [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) object. If you set `audioBufferCallback` as `null`, the SDK stops getting raw audio data.
     * @param frameSize The number of samples of each audio channel that an `AudioBuffer` object contains. You can set `frameSize` as 256, 512, 1024, 2048, 4096, 8192, or 16384. The default value is 4096.
     */
    setAudioFrameCallback(audioFrameCallback: null | ((buffer: AudioBuffer) => void), frameSize?: number): void;
    /**
     * Plays a local audio track.
     *
     * > When playing a audio track, you do not need to pass any DOM element.
     */
    play(): void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Sets the audio playback device, for example, the speaker.
     * > This method supports Chrome only. Other browsers throw a '`NOT_SUPPORTED` error when calling this method.
     * @param deviceId Device ID, which can be retrieved by calling [[getPlaybackDevices]].
     */
    setPlaybackDevice(deviceId: string): Promise<void>;
    /**
     * Gets the statistics of a local audio track.
     *
     * **DEPRECATED** from v4.1.0. Use [AgoraRTCClient.getLocalVideoStats]{@link IAgoraRTCClient.getLocalVideoStats} and [AgoraRTCClient.getLocalAudioStats]{@link IAgoraRTCClient.getLocalAudioStats} instead.
     */
    getStats(): LocalAudioTrackStats;
}

/**
 * `LocalTrack` is the basic interface for local tracks, providing public methods for [LocalAudioTrack]{@link ILocalAudioTrack} and [LocalVideoTrack]{@link ILocalVideoTrack}.
 */
export declare interface ILocalTrack extends ITrack {
    on(event: "track-ended", listener: typeof event_track_ended): void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Enables/Disables the track.
     *
     * After a track is disabled, the SDK stops playing and publishing the track.
     *
     * > - Disabling a track does not trigger the [LocalTrack.on("track-ended")]{@link event_track_ended} event.
     * > - If a track is published, disabling this track triggers the [user-unpublished]{@link IAgoraRTCClient.event_user_unpublished} event on the remote client, and re-enabling this track triggers the [user-published]{@link IAgoraRTCClient.event_user_published} event.
     *
     * @param enabled Whether to enable the track:
     * - `true`: Enable the track.
     * - `false`: Disable the track.
     */
    setEnabled(enabled: boolean): Promise<void>;
    /**
     * **DEPRECATED** from v4.1.0. Use [AgoraRTCClient.getLocalVideoStats]{@link IAgoraRTCClient.getLocalVideoStats} and [AgoraRTCClient.getLocalAudioStats]{@link IAgoraRTCClient.getLocalAudioStats} instead.
     *
     * Gets the statistics of a local track.
     *
     * > Note: When getting the statistics of a local video track, you cannot get the `encodeDelay` property on iOS.
     */
    getStats(): LocalVideoTrackStats | LocalAudioTrackStats;
    /**
     * Gets the label of a local track.
     *
     * @return The label that the SDK returns may include:
     * - The [MediaDeviceInfo.label](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/label) property, if the track is created by calling `createMicrophoneAudioTrack` or `createCameraVideoTrack`.
     * - The `sourceId` property, if the track is created by calling `createScreenVideoTrack`.
     * - The [MediaStreamTrack.label](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/label) property, if the track is created by calling `createCustomAudioTrack` or `createCustomVideoTrack`.
     */
    getTrackLabel(): string;
    /**
     * Closes a local track and releases the audio and video resources that it occupies.
     *
     * Once you close a local track, you can no longer reuse it.
     */
    close(): void;
}

/**
 * `LocalVideoTrack` is the basic interface for local video tracks, providing the main methods for local video tracks.
 *
 * You can get create a local video track by calling [AgoraRTC.createCustomVideoTrack]{@link IAgoraRTC.createCustomVideoTrack} or [AgoraRTC.createScreenVideoTrack]{@link IAgoraRTC.createScreenVideoTrack} method.
 *
 * Inherited from `LocalVideoTrack`, [CameraVideoTrack]{@link ICameraVideoTrack} is an interface for the video captured by a local camera and adds several camera-related functions.
 */
export declare interface ILocalVideoTrack extends ILocalTrack {
    on(event: "beauty-effect-overload", listener: typeof event_beauty_effect_overload): void;
    on(event: "track-ended", listener: typeof event_track_ended): void;
    /**
     * Plays a local video track on the web page.
     *
     * @param element Specifies a DOM element. The SDK will create a `<video>` element under the specified DOM element to play the video track. You can specify a DOM element in either of the following ways:
     * - `string`: Specify the ID of the DOM element.
     * - `HTMLElement`: Pass a DOM object.
     * @param config Sets the playback configurations, such as display mode and mirror mode. See [[VideoPlayerConfig]]. By default, the SDK enables mirror mode for a local video track.
     */
    play(element: string | HTMLElement, config?: VideoPlayerConfig): void;
    /**
     * Gets the statistics of a local video track.
     *
     * **DEPRECATED** from v4.1.0. Use [AgoraRTCClient.getLocalVideoStats]{@link IAgoraRTCClient.getLocalVideoStats} and [AgoraRTCClient.getLocalAudioStats]{@link IAgoraRTCClient.getLocalAudioStats} instead.
     */
    getStats(): LocalVideoTrackStats;
    /**
     * Enables/Disables image enhancement and sets the options.
     *
     * > Notes:
     * > - This method supports the following browsers:
     * >  - Safari 12 or later.
     * >  - Chrome 65 or later.
     * >  - Firefox 70.0.1 or later.
     * > - This function is not supported on mobile devices.
     * > - If you enable dual-stream mode, the image enhancement options only apply to the high-quality video stream.
     *
     * @param enabled Whether to enable image enhancement:
     * - `true`: Enable image enhancement.
     * - `false`: Disable image enhancement.
     * @param options Sets image enhancement options. See [[BeautyEffectOptions]].
     */
    setBeautyEffect(enabled: boolean, options?: BeautyEffectOptions): Promise<void>;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the data of the video frame being rendered.
     *
     * > You should call this method after calling [[play]]. Otherwise, the method call returns null.
     *
     * @returns An `ImageData` object that stores RGBA data. `ImageData` is a web API supported by the browser. For details, see [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
     */
    getCurrentFrameData(): ImageData;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.2.0*
     *
     * Sets the video transmission optimization mode.
     *
     * You can call this method during a video call, a live streaming or screen sharing to dynamically change the optimization mode. For example, during the screen sharing, before you change the shared content from text to video, you can change the optimization mode from `"detail"` to `"motion"` to ensure smoothness in poor network conditions.
     *
     * > Note: This method supports Chrome only.
     *
     * @param mode The video transmission optimization mode:
     *             - `"balanced"`: Uses the default optimization mode.
     *               - For a screen-sharing video track, the default transmission optimization strategy is to prioritizes clarity.
     *               - For the other types of video tracks, the SDK may reduce the frame rate or the sending resolution in poor network conditions.
     *             - `"detail"`: Prioritizes video quality.
     *               - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
     *               - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
     *             -  `"motion"`: Prioritizes video smoothness.
     *               - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
     *               - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.
     */
    setOptimizationMode(mode: "balanced" | "motion" | "detail"): Promise<void>;
}

/**
 * Inherited from [LocalAudioTrack]{@link ILocalAudioTrack}, `MicrophoneAudioTrack` is an interface for the audio sampled by a local microphone and adds several functions such as switching devices.
 *
 * You can create a local microphone audio track by calling [AgoraRTC.createMicrophoneAudioTrack]{@link IAgoraRTC.createMicrophoneAudioTrack}.
 */
export declare interface IMicrophoneAudioTrack extends ILocalAudioTrack {
    /**
     * Sets the device for sampling audio.
     *
     * > You can call the method either before or after publishing an audio track.
     *
     * @param deviceId The ID of the specified device. You can get the `deviceId` by calling [AgoraRTC.getMicrophones]{@link IAgoraRTC.getMicrophones}.
     */
    setDevice(deviceId: string): Promise<void>;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Enables/Disables the track.
     *
     * After a track is disabled, the SDK stops playing and publishing the track.
     *
     * > - Disabling a track does not trigger the [LocalTrack.on("track-ended")]{@link event_track_ended} event.
     * > - If a track is published, disabling this track triggers the [user-unpublished]{@link IAgoraRTCClient.event_user_unpublished} event on the remote client, and re-enabling this track triggers the [user-published]{@link IAgoraRTCClient.event_user_published} event.
     *
     * @param enabled Whether to enable the track:
     * - `true`: Enable the track.
     * - `false`: Disable the track.
     */
    setEnabled(enabled: boolean): Promise<void>;
}

/**
 * The configurations for the injected online stream in [AgoraRTCClient.addInjectStreamUrl]{@link IAgoraRTCClient.addInjectStreamUrl}.
 */
export declare interface InjectStreamConfig {
    audioVolume?: number;
    /**
     * The audio bitrate (Kbps) of the injected stream.
     *
     * A positive integer. The default value is 48.
     */
    audioBitrate?: number;
    /**
     * The number of audio channels of the injected stream.
     *
     * A positive integer. The default value is 1. The value range is [1,2].
     */
    audioChannels?: number;
    /**
     * The audio sampling rate of the injected stream.
     *
     * - 32000: 32 kHz
     * - 44100: (Default) 44.1 kHz
     * - 48000: 48 kHz
     *
     * > Agora recommends using the default value.
     */
    audioSampleRate?: number;
    /**
     * The height of the injected stream.
     *
     * The default value is 0, which is the same height as the original stream.
     */
    height?: number;
    /**
     * The width of the injected stream.
     *
     * The default value is 0, which is the same width as the original stream.
     */
    width?: number;
    /**
     * The video bitrate (Kbps) of the injected stream.
     *
     * A positive integer. The default value is 400.
     */
    videoBitrate?: number;
    /**
     * The video frame rate (fps) of the injected stream.
     *
     * A positive integer. The default value is 15.
     */
    videoFramerate?: number;
    videoGop?: number;
}

/**
 * The status of the media stream injected by [[addInjectStreamUrl]], reported in the [AgoraRTCClient.on("stream-inject-status")]{AgoraRTCClient.event_stream_inject_status} event.
 */
declare const enum InjectStreamEventStatus {
    /**
     * Successfully injects the online media stream.
     */
    INJECT_STREAM_STATUS_START_SUCCESS = 0,
    /**
     * The online media stream already exists.
     */
    INJECT_STREAM_STATUS_START_ALREADY_EXISTS = 1,
    /**
     * Injecting the online media stream is not authorized.
     */
    INJECT_STREAM_STATUS_START_UNAUTHORIZED = 2,
    /**
     * Timeout when injecting the online media stream.
     */
    INJECT_STREAM_STATUS_START_TIMEOUT = 3,
    /**
     * Fails to inject the online media stream.
     */
    INJECT_STREAM_STATUS_START_FAILED = 4,
    /**
     * Succeessfully stops injecting the online media stream.
     */
    INJECT_STREAM_STATUS_STOP_SUCCESS = 5,
    /**
     * Fails to find the online media stream.
     */
    INJECT_STREAM_STATUS_STOP_NOT_FOUND = 6,
    /**
     * Stopping injecting the online media stream is not authorized.
     */
    INJECT_STREAM_STATUS_STOP_UNAUTHORIZED = 7,
    /**
     * Timeout when stopping the online media stream.
     */
    INJECT_STREAM_STATUS_STOP_TIMEOUT = 8,
    INJECT_STREAM_STATUS_STOP_FAILED = 9,
    /**
     * The online media stream is corrupted.
     */
    INJECT_STREAM_STATUS_BROKEN = 10
}

/**
 * `RemoteAudioTrack` is the basic interface for the remote audio track.
 *
 * You can get create a remote audio track by the [AgoraRTCRemoteUser.audioTrack]{@link IAgoraRTCRemoteUser.audioTrack} object after calling [subscribe]{@link IAgoraRTCClient.subscribe}.
 */
export declare interface IRemoteAudioTrack extends IRemoteTrack {
    /**
     * Gets the statistics of a remote audio track.
     *
     * @return An [[RemoteAudioTrackStats]] object.
     */
    getStats(): RemoteAudioTrackStats;
    /**
     * Plays a remote audio track.
     *
     * > When playing the audio track, you do not need to pass any DOM element.
     */
    play(): void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Sets the audio playback device, for example, the speaker.
     * > This method supports Chrome only. Other browsers throw a '`NOT_SUPPORTED` error when calling this method.
     * @param deviceId Device ID, which can be retrieved by calling [[getPlaybackDevices]].
     */
    setPlaybackDevice(deviceId: string): Promise<void>;
    /**
     * Sets the callback for getting raw audio data in PCM format.
     *
     * After you successfully set the callback, the SDK constantly returns the audio frames of a remote audio track in this callback by using [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer).
     *
     * > You can set the `frameSize` parameter to determine the frame size in each callback, which affects the interval between the callbacks. The larger the frame size, the longer the interval between them.
     *
     * ```js
     * track.setAudioFrameCallback((buffer) => {
     *   for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
     *     // Float32Array with PCM data
     *     const currentChannelData = buffer.getChannelData(channel);
     *     console.log("PCM data in channel", channel, currentChannelData);
     *   }
     * }, 2048);
     *
     * // ....
     * // Stop getting the raw audio data
     * track.setAudioFrameCallback(null);
     * ```
     *
     * @param audioFrameCallback The callback function for receiving the [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) object. If you set `audioBufferCallback` as `null`, the SDK stops getting raw audio data.
     * @param frameSize The number of samples of each audio channel that an `AudioBuffer` object contains. You can set `frameSize` as 256, 512, 1024, 2048, 4096, 8192, or 16384. The default value is 4096.
     */
    setAudioFrameCallback(audioFrameCallback: null | ((buffer: AudioBuffer) => void), frameSize?: number): void;
    /**
     * Sets the volume of a remote audio track.
     *
     * @param volume The volume. The value ranges from 0 (mute) to 1000 (maximum). A value of 100 is the current volume.
     */
    setVolume(volume: number): void;
    /**
     * Gets the audio level of a remote audio track.
     *
     * @returns The audio level. The value range is [0,1]. 1 is the highest audio level.
     */
    getVolumeLevel(): number;
}

/**
 * `RemoteTrack` is the basic interface for remote tracks, providing public methods for [RemoteAudioTrack]{@link IRemoteAudioTrack} and [RemoteVideoTrack]{@link IRemoteVideoTrack}.
 */
export declare interface IRemoteTrack extends ITrack {
    on(event: "first-frame-decoded", listener: typeof event_first_frame_decoded): void;
    /**
     * Gets the `uid` of the remote user who publishes the remote track.
     *
     * @return The `uid` of the remote user.
     */
    getUserId(): UID;
    /**
     * Gets the statistics of a remote track.
     *
     * **DEPRECATED** from v4.1.0. Use [AgoraRTCClient.getRemoteVideoStats]{@link IAgoraRTCClient.getRemoteVideoStats} and [AgoraRTCClient.getRemoteAudioStats]{@link IAgoraRTCClient.getRemoteAudioStats} instead.
     * @return An [[RemoteAudioTrackStats]] or [[RemoteVideoTrackStats]] object.
     */
    getStats(): RemoteAudioTrackStats | RemoteVideoTrackStats;
}

/**
 * `RemoteVideoTrack` is the basic interface for the remote video track.
 *
 * You can get create a remote video track by the [AgoraRTCRemoteUser.videoTrack]{@link IAgoraRTCRemoteUser.videoTrack} object after calling [subscribe]{@link IAgoraRTCClient.subscribe}.
 */
export declare interface IRemoteVideoTrack extends IRemoteTrack {
    /**
     * Gets the statistics of a remote video track.
     *
     * @return An [[RemoteVideoTrackStats]] object。
     */
    getStats(): RemoteVideoTrackStats;
    /**
     * Plays a remote video track on the web page.
     *
     * @param element Specifies a DOM element. The SDK will create a `<video>` element under the specified DOM element to play the video track. You can specify a DOM element in either of following ways:
     * - `string`: Specify the ID of the DOM element.
     * - `HTMLElement`: Pass a DOM object.
     * @param config Sets the playback configurations, such as display mode and mirror mode. See [[VideoPlayerConfig]]. By default, the SDK enables mirror mode for a local video track.
     */
    play(element: string | HTMLElement, config?: VideoPlayerConfig): void;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.1.0*
     *
     * Gets the data of the video frame being rendered.
     *
     * > You should call this method after calling [[play]]. Otherwise, the method call returns null.
     *
     * @returns An `ImageData` object that stores RGBA data. `ImageData` is a web API supported by the browser. For details, see [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
     */
    getCurrentFrameData(): ImageData;
}

export declare interface ITrack extends EventEmitter {
    /**
     * The type of a media track:
     * - `"audio"`: Audio track.
     * - `"video"`: Video track.
     */
    trackMediaType: "audio" | "video";
    /**
     * Whether a media track is playing on the webpage:
     * - `true`: The media track is playing on the webpage.
     * - `false`: The media track is not playing on the webpage.
     */
    isPlaying: boolean;
    /**
     * Gets the ID of a media track, a unique identifier generated by the SDK.
     *
     * @return The media track ID.
     */
    getTrackId(): string;
    /**
     * Gets an [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     *
     * @return An [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object.
     */
    getMediaStreamTrack(): MediaStreamTrack;
    /**
     * Plays a media track on the webpage.
     *
     * @param element Specifies a DOM element. The SDK will create a `<video>` element under the specified DOM element to play the video track. You can specify a DOM element in either of following ways:
     * - `string`: Specify the ID of the DOM element.
     * - `HTMLElement`: Pass a DOM object.
     */
    play(element?: string | HTMLElement): void;
    /**
     * Stops playing the media track.
     */
    stop(): void;
}

/**
 * The configurations for CDN live stream transcoding. To be used when you call [setLiveTranscoding]{@link IAgoraRTCClient.setLiveTranscoding}.
 */
export declare interface LiveStreamingTranscodingConfig {
    /**
     * The audio bitrate (Kbps) of the CDN live stream.
     *
     * A positive integer. The default value is 48, and the highest value is 128.
     */
    audioBitrate?: number;
    /**
     * The number of audio channels for the CDN live stream.
     *
     * Agora recommends choosing 1 (mono), or 2 (stereo) audio channels. Special players are required if you choose 3, 4, or 5.
     *
     * - 1: (Default) Mono
     * - 2: Stereo
     * - 3: Three audio channels
     * - 4: Four audio channels
     * - 5: Five audio channels
     */
    audioChannels?: 1 | 2 | 3 | 4 | 5;
    /**
     * The audio sampling rate:
     *
     * - 32000: 32 kHz
     * - 44100: (Default) 44.1 kHz
     * - 48000: 48 kHz
     */
    audioSampleRate?: 32000 | 44100 | 48000;
    /**
     * The background color in RGB hex.
     *
     * Value only. Do not include a preceding #. The default value is 0x000000.
     */
    backgroundColor?: number;
    /**
     * The height of the video in pixels.
     *
     * A positive integer, the default value is 360.
     *
     * - When pushing video streams to the CDN, ensure that `height` is at least 64; otherwise, the Agora server adjusts the value to 64.
     * - When pushing audio streams to the CDN, set `width` and `height` as 0.
     */
    height?: number;
    /**
     * The width of the video in pixels.
     *
     * A positive integer, the default value is 640.
     *
     * - When pushing video streams to the CDN, ensure that `width` is at least 64; otherwise, the Agora server adjusts the value to 64.
     * - When pushing audio streams to the CDN, set `width` and `height` as 0.
     */
    width?: number;
    /**
     * @ignore
     */
    lowLatency?: boolean;
    /**
     * The bitrate (Kbps) of the output video stream.
     *
     * The default value is 400.
     */
    videoBitrate?: number;
    /**
     * The video codec profile type.
     *
     * Set it as `66`, `77`, or `100` (default). If you set this parameter to any other value, the Agora server adjusts it to the default value `100`.
     *
     * - `66`: Baseline video codec profile. Generally used for video calls on mobile phones.
     * - `77`: Main video codec profile. Generally used for mainstream electronic devices, such as MP4 players, portable video players, PSP, and iPads.
     * - `100`: (Default) High video codec profile. Generally used for high-resolution broadcasts or television.
     */
    videoCodecProfile?: 66 | 77 | 100;
    /**
     * The video frame rate (fps) of the CDN live stream.
     *
     * The default value is 15. The Agora server adjusts any value over 30 to 30.
     */
    videoFrameRate?: number;
    /**
     * The video GOP in frames.
     *
     * The default value is 30.
     */
    videoGop?: number;
    /**
     * **DEPRECATED**
     *
     * Watermark images for the CDN live stream.
     */
    images?: LiveStreamingTranscodingImage[];
    /**
     * Watermark image for the CDN live stream.
     */
    watermark?: LiveStreamingTranscodingImage;
    /**
     * Background image for the CDN live stream.
     */
    backgroundImage?: LiveStreamingTranscodingImage;
    /**
     * Manages the user layout configuration in the CDN live streaming.
     *
     * Agora supports a maximum of 17 transcoding users in a CDN streaming channel.
     */
    transcodingUsers?: LiveStreamingTranscodingUser[];
    userConfigExtraInfo?: string;
}

/**
 * Configurations for the watermark and background images to put on top of the video in [LiveStreamingTranscodingConfig]{@link LiveStreamingTranscodingConfig}.
 */
export declare interface LiveStreamingTranscodingImage {
    /**
     * The HTTP/HTTPS URL address of the image on the video.
     *
     * Supports online PNG only.
     */
    url: string;
    /**
     * The horizontal distance (pixel) between the image's top-left corner and the video's top-left corner.
     *
     * The default value is `0`.
     */
    x?: number;
    /**
     * The vertical distance (pixel) between the image's top-left corner and the video's top-left corner.
     *
     * The default value is `0`.
     */
    y?: number;
    /**
     * The width (pixel) of the image.
     *
     * The default value is `160`.
     */
    width?: number;
    /**
     * The height (pixel) of the image.
     *
     * The default value is `160`.
     */
    height?: number;
    /**
     * The transparency level of the image.
     *
     * The value range is [0.0,1.0]:
     * - 0.0: Completely transparent.
     * - 1.0: (Default) Opaque.
     */
    alpha?: number;
}

/**
 * Manages the user layout configuration in [LiveStreamingTranscodingConfig]{@link LiveStreamingTranscodingConfig}.
 */
export declare interface LiveStreamingTranscodingUser {
    /**
     * The transparency level of the user's video.
     *
     * The value ranges between 0.0 and 1.0:
     *
     * - 0.0: Completely transparent.
     * - 1.0: (Default) Opaque.
     */
    alpha?: number;
    /**
     * The height of the video.
     *
     * The default value is 640.
     */
    height?: number;
    /**
     * The user ID of the CDN live host.
     */
    uid: UID;
    /**
     * The width of the video.
     *
     * The default value is 360.
     */
    width?: number;
    /**
     * The position of the top-left corner of the video on the horizontal axis.
     *
     * The default value is 0.
     */
    x?: number;
    /**
     * The position of the top-left corner of the video on the vertical axis.
     *
     * The default value is 0.
     */
    y?: number;
    /**
     * The layer index of the video frame.
     *
     * An integer. The value range is [0,100].
     *
     * - 0: (Default) Bottom layer.
     * - 100: Top layer.
     */
    zOrder?: number;
    /**
     * The audio channel ranging between 0 and 5. The default value is 0.
     * - 0: (default) Supports dual channels. Depends on the upstream of the broadcaster.
     * - 1: The audio stream of the broadcaster uses the FL audio channel. If the broadcaster’s upstream uses multiple audio channels, these channels are mixed into mono first.
     * - 2: The audio stream of the broadcaster uses the FC audio channel. If the broadcaster’s upstream uses multiple audio channels, these channels are mixed into mono first.
     * - 3: The audio stream of the broadcaster uses the FR audio channel. If the broadcaster’s upstream uses multiple audio channels, these channels are mixed into mono first.
     * - 4: The audio stream of the broadcaster uses the BL audio channel. If the broadcaster’s upstream uses multiple audio channels, these channels are mixed into mono first.
     * - 5: The audio stream of the broadcaster uses the BR audio channel. If the broadcaster’s upstream uses multiple audio channels, these channels are mixed into mono first.
     */
    audioChannel?: number;
}

/**
 * Information of the local audio track, which can be retrieved by calling [AgoraRTCClient.getLocalAudioStats]{@link IAgoraRTCClient.getLocalAudioStats}.
 */
export declare interface LocalAudioTrackStats {
    /**
     * The audio codec.
     *
     * - `opus`: The audio codec is OPUS。
     * - `aac`: The audio codec is AAC。
     * > Firefox does not support this property.
     */
    codecType?: "opus" | "aac";
    /**
     * The energy level of the sent audio.
     *
     * The value range is [0,32767].
     *
     * > This value is retrieved by calling WebRTC-Stats and may not be up-to-date. To get the real-time sound volume, call [LocalAudioTrack.getVolumeLevel]{@link ILocalAudioTrack.getVolumeLevel}.
     */
    sendVolumeLevel: number;
    /**
     * The bitrate (bps) of the sent audio.
     */
    sendBitrate: number;
    /**
     * The total bytes of the sent audio.
     */
    sendBytes: number;
    /**
     * The total packets of the sent audio.
     */
    sendPackets: number;
    /**
     * The total number of lost audio packets that were sent.
     */
    sendPacketsLost: number;
}

/**
 * Information of the local video track, which can be retrieved by calling [AgoraRTCClient.getLocalVideoStats]{@link IAgoraRTCClient.getLocalVideoStats}.
 */
export declare interface LocalVideoTrackStats {
    /**
     * The video codec.
     *
     * - `"H264"`: The video codec is H.264.
     * - `"VP8"`: The video codec is VP8.
     *
     * > Firefox does not support this property.
     */
    codecType?: "H264" | "VP8";
    /**
     * The total bytes of the sent video.
     */
    sendBytes: number;
    /**
     * The frame rate (fps) of the sent video.
     *
     * > Firefox does not support this property.
     */
    sendFrameRate?: number;
    /**
     * The frame rate (fps) of the captured video.
     *
     * > Firefox does not support this property.
     */
    captureFrameRate?: number;
    /**
     * The total packets of the sent video.
     */
    sendPackets: number;
    /**
     * The total number of lost video packets that were sent.
     */
    sendPacketsLost: number;
    /**
     * The resolution height (pixel) of the sent video.
     */
    sendResolutionHeight: number;
    /**
     * The resolution width (pixel) of the sent video.
     */
    sendResolutionWidth: number;
    /**
     * The resolution height (pixel) of the captured video.
     */
    captureResolutionHeight: number;
    /**
     * The resolution width (pixel) of the captured video.
     */
    captureResolutionWidth: number;
    /**
     * The delay (ms) between video capture and video encoding.
     *
     * > Note: You cannot get this property on iOS.
     */
    encodeDelay?: number;
    /**
     * The bitrate (bps) of the sent video.
     */
    sendBitrate: number;
    /**
     * The target bitrate (bps) of the sent video, namely the bitrate set in {@link VideoEncoderConfiguration}.
     */
    targetSendBitrate: number;
    /**
     * The total duration of the sent video in seconds.
     */
    totalDuration: number;
    /**
     * The total freeze time of the encoded video in seconds.
     */
    totalFreezeTime: number;
}

/**
 * The video profile of the low-quality video stream. Set the the video profile of the low-quality video stream when calling [setLowStreamParameter]{@link IAgoraRTCClient.setLowStreamParameter}.
 */
export declare interface LowStreamParameter {
    /**
     * Width of the video.
     *
     * You can pass a `number`, or a constraint such as `{ max: 1280, min: 720 }`.
     *
     * For more details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    width: ConstrainULong;
    /**
     * Height of the video.
     *
     * You can pass a `number`, or a constraint such as `{ max: 1280, min: 720 }`.
     *
     * For more details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    height: ConstrainULong;
    /**
     * Frame rate of the video (fps).
     *
     * You can pass a `number`, or a constraint such as `{ max: 30, min: 5 }`.
     *
     * For details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    framerate?: ConstrainULong;
    /**
     * Bitrate of the video (Kbps).
     */
    bitrate?: number;
}

/**
 * Configurations for the audio track from the audio captured by a microphone. Set these configurations when calling [AgoraRTC.createMicrophoneAudioTrack]{@link IAgoraRTC.createMicrophoneAudioTrack}.
 */
export declare interface MicrophoneAudioTrackInitConfig {
    /**
     * The audio encoder configurations.
     *
     * You can set the audio encoder configurations in either of the following ways:
     * - Pass the preset audio encoder configurations by using [[AudioEncoderConfigurationPreset]].
     * - Pass your customized audio encoder configurations by using [[AudioEncoderConfiguration]].
     */
    encoderConfig?: AudioEncoderConfiguration | AudioEncoderConfigurationPreset;
    /**
     * Whether to enable automatic noise suppression:
     * - `true`: Enable automatic noise suppression.
     * - `false`: Do not enable automatic noise suppression.
     */
    AEC?: boolean;
    /**
     * Whether to enable audio gain control:
     * - `true`: Enable audio gain control.
     * - `false`: Do not enable audio gain control.
     */
    AGC?: boolean;
    /**
     * Whether to enable automatic noise suppression:
     * - `true`: Enable automatic noise suppression.
     * - `false`: Do not automatic noise suppression.
     */
    ANS?: boolean;
    /**
     * @ignore
     */
    DTX?: boolean;
    /**
     * Specifies the microphone ID.
     *
     * You can get a list of the available microphones by calling [AgoraRTC.getMicrophones]{@link IAgoraRTC.getMicrophones}.
     */
    microphoneId?: string;
}

/**
 * The last-mile network quality.
 *
 * Last mile refers to the connection between the local device and Agora edge server.
 *
 * - After the local user joins the channel, the SDK triggers the [AgoraRTCClient.on("network-quality")]{@link IAgoraRTCClient.event_network_quality} callback once every two seconds and provides the uplink and downlink last-mile network conditions of the user through this interface.
 * - You can call [AgoraRTCClient.getRemoteNetworkQuality]{@link IAgoraRTCClient.getRemoteNetworkQuality} to get the network quality of all remote users to whom the local user subscribes.
 */
export declare interface NetworkQuality {
    /**
     * The uplink network quality.
     *
     * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
     *
     * - 0: The quality is unknown.
     * - 1: The quality is excellent.
     * - 2: The quality is good, but the bitrate is less than optimal.
     * - 3: Users experience slightly impaired communication.
     * - 4: Users can communicate with each other, but not very smoothly.
     * - 5: The quality is so poor that users can barely communicate.
     * - 6: The network is disconnected and users cannot communicate.
     */
    uplinkNetworkQuality: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * The downlink network quality.
     *
     * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
     *
     * - 0: The quality is unknown.
     * - 1: The quality is excellent.
     * - 2: The quality is good, but the bitrate is less than optimal.
     * - 3: Users experience slightly impaired communication.
     * - 4: Users can communicate with each other, but not very smoothly.
     * - 5: The quality is so poor that users can barely communicate.
     * - 6: The network is disconnected and users cannot communicate.
     */
    downlinkNetworkQuality: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Statistics of the remote audio track, such as connection and transmission statistics, which can be retrieved by calling [AgoraRTCClient.getRemoteAudioStats]{@link IAgoraRTCClient.getRemoteAudioStats}.
 */
export declare interface RemoteAudioTrackStats {
    /**
     * Transmission delay (ms).
     *
     * The delay (ms) between a remote client sending the audio and the local client receiving the audio.
     */
    transportDelay: number;
    /**
     * The audio codec.
     *
     * - `opus`: The audio codec is OPUS。
     * - `aac`: The audio codec is AAC。
     * > Firefox does not support this property.
     */
    codecType?: "opus" | "aac";
    /**
     * End-to-end delay (ms).
     *
     * The delay (ms) between a remote client sampling the audio and the local client playing the audio.
     */
    end2EndDelay: number;
    /**
     * The bitrate (bps) of the received audio.
     */
    receiveBitrate: number;
    /**
     * The energy level of the received audio.
     *
     * The value range is [0,32767].
     *
     * > This value is retrieved by calling WebRTC-Stats and may not be up-to-date. To get the real-time sound volume, call [RemoteAudioTrack.getVolumeLevel]{@link IRemoteAudioTrack.getVolumeLevel}.
     */
    receiveLevel: number;
    /**
     * The total bytes of the received audio.
     */
    receiveBytes: number;
    /**
     * The delay (ms) between a remote client sending the audio and the local client playing the audio.
     */
    receiveDelay: number;
    /**
     * The total packets of the received audio.
     */
    receivePackets: number;
    /**
     * The total number of lost audio packets that should be received.
     */
    receivePacketsLost: number;
    /**
     * The packet loss rate of the received audio.
     */
    packetLossRate: number;
    /**
     * The total duration of the received audio in seconds.
     */
    totalDuration: number;
    /**
     * The total freeze time of the received audio in seconds.
     */
    totalFreezeTime: number;
    /**
     * The freeze rate of the received audio.
     */
    freezeRate: number;
    publishDuration: number;
}

/**
 * The stream fallback option. Set the stream fallback option when calling [setStreamFallbackOption]{@link IAgoraRTCClient.setStreamFallbackOption}.
 *
 */
export declare const enum RemoteStreamFallbackType {
    /**
     * 0: Disable the fallback.
     */
    DISABLE = 0,
    /**
     * 1: (Default) Automatically subscribe to the low-video stream under poor network conditions. */
    LOW_STREAM = 1,
    /**
     * 2: Subscribe to the low-quality video stream when the network conditions worsen, and subscribe to audio only when the conditions become too poor to support video transmission.
     */
    AUDIO_ONLY = 2
}

/**
 * The video type of the remote stream. Set the video type of the remote stream when calling [setRemoteVideoStreamType]{@link IAgoraRTCClient.setRemoteVideoStreamType}.
 */
export declare const enum RemoteStreamType {
    /**
     * 0: High-quality video stream (high-bitrate, high-resolution).
     */
    HIGH_STREAM = 0,
    /**
     * 1: Low-quality video stream (low-bitrate, low-resolution).
     */
    LOW_STREAM = 1
}

/**
 * Statistics of the remote video track, such as connection and transmission statistics, which can be retrieved by calling [AgoraRTCClient.getRemoteVideoStats]{@link IAgoraRTCClient.getRemoteVideoStats}.
 */
export declare interface RemoteVideoTrackStats {
    /**
     * Transmission delay (ms).
     *
     * The delay (ms) between a remote client sending the video and the local client receiving the video.
     */
    transportDelay: number;
    /**
     * The video codec.
     *
     * - `"H264"`: The video codec is H.264.
     * - `"VP8"`: The video codec is VP8.
     *
     * > Firefox does not support this property.
     */
    codecType?: "H264" | "VP8";
    /**
     * End-to-end delay (ms).
     *
     * The delay (ms) a remote client capturing the video and the local client playing the video.
     */
    end2EndDelay: number;
    /**
     * The bitrate (bps) of the received video.
     */
    receiveBitrate: number;
    /**
     * The delay (ms) between a remote client sending the video and the local client playing the video.
     */
    receiveDelay: number;
    /**
     * The total byes of the received video.
     */
    receiveBytes: number;
    /**
     * The frame rate (fps) of the decoded video.
     */
    decodeFrameRate?: number;
    /**
     * The frame rate (fps) of the received video.
     */
    receiveFrameRate?: number;
    /**
     * The rendering frame rate (fps) of the decoded video.
     */
    renderFrameRate?: number;
    /**
     * The total bytes of the received video.
     */
    receivePackets: number;
    /**
     * The total number of lost video packets that should be received.
     */
    receivePacketsLost: number;
    /**
     * The packet loss rate of the received video.
     */
    packetLossRate: number;
    /**
     * The resolution height (pixel) of the received video.
     */
    receiveResolutionHeight: number;
    /**
     * The resolution width (pixel) of the received video.
     */
    receiveResolutionWidth: number;
    /**
     * The total duration of the received video in seconds.
     */
    totalDuration: number;
    /**
     * The total freeze time of the received video in seconds.
     */
    totalFreezeTime: number;
    /**
     * The freeze rate of the received video.
     */
    freezeRate: number;
    publishDuration: number;
}

/**
 * @ignore
 */
declare interface RetryConfiguration {
    timeout: number;
    timeoutFactor: number;
    maxRetryCount: number;
    maxRetryTimeout: number;
}

/**
 * The preset video encoder configurations for screen sharing.
 *
 * You can pass the preset video encoder configurations when calling [AgoraRTC.createScreenVideoTrack]{@link IAgoraRTC.createScreenVideoTrack}.
 *
 * The following table lists all the preset video profiles for screen sharing.
 *
 * | Video Profile | Resolution (Width×Height) | Frame Rate (fps) |
 * | -------- | --------------- | ----------- |
 * | 480p     | 640 × 480       | 1           |
 * | 480p_1   | 640 × 480       | 1           |
 * | 480p_2   | 640 × 480       | 30          |
 * | 720p     | 1280 × 720      | 1           |
 * | 720p_1   | 1280 × 720      | 1           |
 * | 720p_2   | 1280 × 720      | 30          |
 * | 1080p    | 1920 × 1080     | 1           |
 * | 1080p_1  | 1920 × 1080     | 1           |
 * | 1080p_2  | 1920 × 1080     | 30          |
 */
export declare type ScreenEncoderConfigurationPreset = keyof typeof SUPPORT_SCREEN_ENCODER_CONFIG_LIST;

/**
 * The type of the source for screen sharing.
 * - `"screen"`: Sharing the whole screen.
 * - `"application"`: Sharing all windows of an app.
 * - `"window"`: Sharing a window of an app.
 */
export declare type ScreenSourceType = "screen" | "window" | "application";

/**
 * Configurations for the video track for screen sharing. Set these configurations when calling [AgoraRTC.createScreenVideoTrack]{@link IAgoraRTC.createScreenVideoTrack}.
 */
export declare interface ScreenVideoTrackInitConfig {
    /**
     * The video encoder configurations for screen sharing.
     *
     * You can set the video encoder configurations in either of the following ways:
     * - Pass the preset video encoder configurations by using [[ScreenEncoderConfigurationPreset]].
     * - Pass your customized video encoder configurations by using [[VideoEncoderConfiguration]].
     */
    encoderConfig?: VideoEncoderConfiguration | ScreenEncoderConfigurationPreset;
    /**
     * The `sourceId` when you share the screen through Electron.
     */
    electronScreenSourceId?: string;
    /**
     * The `extensionId` when you share the screen with a Chrome extension.
     */
    extensionId?: string;
    /**
     * The type of the source for screen sharing.
     *
     * > This parameter is valid only on Firefox.
     */
    screenSourceType?: ScreenSourceType;
    /**
     * **Since**
     * <br>&emsp;&emsp;&emsp;*4.0.0*
     *
     * Transmission optimization mode. Whether to prioritize video quality or smoothness:
     * - `"detail"`: (Default) Prioritizes video quality.
     *   - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
     *   - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
     * -  `"motion"`: Prioritizes video smoothness.
     *   - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
     *   - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.
     *
     * > Note: This method is only supported on Chrome.
     */
    optimizationMode?: "motion" | "detail";
}

/**
 * The codec that the Web browser uses for encoding.
 * - `"vp8"`: Use VP8 for encoding.
 * - `"h264"`: Use H.264 for encoding.
 *
 * > Safari 12.1 or earlier does not support the VP8 codec.
 */
export declare type SDK_CODEC = "h264" | "vp8";

/**
 * The channel profile.
 *
 * The SDK differentiates channel profiles and applies different optimization algorithms accordingly. For example, it prioritizes smoothness and low latency for a video call, and prioritizes video quality for a video broadcast.
 *
 * The SDK supports the following channel profiles:
 * - `"live"`: Sets the channel profile as live broadcast. You need to go on to call [setClientRole]{@link IAgoraRTCClient.setClientRole} to set the client as either a host or an audience. A host can send and receive audio or video, while an audience can only receive audio or video.
 * - `"rtc"`: Sets the channel profile as communication. It is used for a one-on-one call or a group call where all users in the channel can converse freely.
 */
export declare type SDK_MODE = "live" | "rtc";

/**
 * @ignore
 */
declare const SUPPORT_SCREEN_ENCODER_CONFIG_LIST: {
    "480p": VideoEncoderConfiguration;
    "480p_1": VideoEncoderConfiguration;
    "480p_2": VideoEncoderConfiguration;
    "720p": VideoEncoderConfiguration;
    "720p_1": VideoEncoderConfiguration;
    "720p_2": VideoEncoderConfiguration;
    "1080p": VideoEncoderConfiguration;
    "1080p_1": VideoEncoderConfiguration;
    "1080p_2": VideoEncoderConfiguration;
};

/**
 * @ignore
 */
declare const SUPPORT_VIDEO_ENCODER_CONFIG_LIST: {
    "90p": VideoEncoderConfiguration;
    "90p_1": VideoEncoderConfiguration;
    "120p": VideoEncoderConfiguration;
    "120p_1": VideoEncoderConfiguration;
    "120p_3": VideoEncoderConfiguration;
    "120p_4": VideoEncoderConfiguration;
    "180p": VideoEncoderConfiguration;
    "180p_1": VideoEncoderConfiguration;
    "180p_3": VideoEncoderConfiguration;
    "180p_4": VideoEncoderConfiguration;
    "240p": VideoEncoderConfiguration;
    "240p_1": VideoEncoderConfiguration;
    "240p_3": VideoEncoderConfiguration;
    "240p_4": VideoEncoderConfiguration;
    "360p": VideoEncoderConfiguration;
    "360p_1": VideoEncoderConfiguration;
    "360p_3": VideoEncoderConfiguration;
    "360p_4": VideoEncoderConfiguration;
    "360p_6": VideoEncoderConfiguration;
    "360p_7": VideoEncoderConfiguration;
    "360p_8": VideoEncoderConfiguration;
    "360p_9": VideoEncoderConfiguration;
    "360p_10": VideoEncoderConfiguration;
    "360p_11": VideoEncoderConfiguration;
    "480p": VideoEncoderConfiguration;
    "480p_1": VideoEncoderConfiguration;
    "480p_2": VideoEncoderConfiguration;
    "480p_3": VideoEncoderConfiguration;
    "480p_4": VideoEncoderConfiguration;
    "480p_6": VideoEncoderConfiguration;
    "480p_8": VideoEncoderConfiguration;
    "480p_9": VideoEncoderConfiguration;
    "480p_10": VideoEncoderConfiguration;
    "720p": VideoEncoderConfiguration;
    "720p_1": VideoEncoderConfiguration;
    "720p_2": VideoEncoderConfiguration;
    "720p_3": VideoEncoderConfiguration;
    "720p_5": VideoEncoderConfiguration;
    "720p_6": VideoEncoderConfiguration;
    "1080p": VideoEncoderConfiguration;
    "1080p_1": VideoEncoderConfiguration;
    "1080p_2": VideoEncoderConfiguration;
    "1080p_3": VideoEncoderConfiguration;
    "1080p_5": VideoEncoderConfiguration;
    "1440p": VideoEncoderConfiguration;
    "1440p_1": VideoEncoderConfiguration;
    "1440p_2": VideoEncoderConfiguration;
    "4k": VideoEncoderConfiguration;
    "4k_1": VideoEncoderConfiguration;
    "4k_3": VideoEncoderConfiguration;
};

export declare interface TurnServerConfig {
    turnServerURL: string;
    password: string;
    udpport: number;
    username: string;
    forceturn?: boolean;
    tcpport?: number;
}

/**
 * The user ID to identify a user in the channel.
 *
 * Each user in the same channel should have a unique user ID with the same data type (number or string).
 */
export declare type UID = number | string;

/**
 * `VideoEncoderConfiguration` is the interface that defines the video encoder configurations.
 *
 * You can customize the video encoder configurations when calling [AgoraRTC.createCameraVideoTrack]{@link IAgoraRTC.createCameraVideoTrack} or [AgoraRTC.createScreenVideoTrack]{@link IAgoraRTC.createScreenVideoTrack}.
 *
 * The SDK provides the preset video encoder configurations. For more information, see [[VideoEncoderConfigurationPreset]].
 *
 * > The actual bitrate may differ slightly from the value you set due to the limitations of the operation system or the web browser. Agora recommends setting the bitrate between 100 Kbps and 5000 Kbps.
 */
export declare interface VideoEncoderConfiguration {
    /**
     * Width of the video.
     *
     * You can pass a `number`, or a constraint such as `{ max: 1280, min: 720 }`.
     *
     * For more details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    width?: number | ConstrainLong;
    /**
     * Height of the video.
     *
     * You can pass a `number`, or a constraint such as `{ max: 1280, min: 720 }`.
     *
     * For more details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    height?: number | ConstrainLong;
    /**
     * Frame rate of the video (fps).
     *
     * You can pass a `number`, or a constraint such as `{ max: 30, min: 5 }`.
     *
     * For details about the constraint, see [ConstrainLong]{@link ConstrainLong}.
     */
    frameRate?: number | ConstrainLong;
    /**
     * The minimum bitrate of the video (Kbps).
     */
    bitrateMin?: number;
    /**
     * The maximum bitrate of the video (Kbps).
     */
    bitrateMax?: number;
}

/**
 *
 * The preset video encoder configurations.
 *
 * You can pass the preset video encoder configurations when calling [AgoraRTC.createCameraVideoTrack]{@link IAgoraRTC.createCameraVideoTrack} or [AgoraRTC.createScreenVideoTrack]{@link IAgoraRTC.createScreenVideoTrack}.
 *
 * The following table lists all the preset video profiles. The SDK uses `"480p_1"` by default.
 *
 * | Video Profile | Resolution (Width×Height) | Frame Rate (fps) | Bitrate (Kbps） | Chrome | Firefox | Safari |
 * | -------- | --------------- | ----------- | ------------ | ------ | ------- | ------ |
 * | 120p     | 160 × 120       | 15          | 65           | ✓      |         |        |
 * | 120p_1   | 160 × 120       | 15          | 65           | ✓      |         |        |
 * | 120p_3   | 120 × 120       | 15          | 50           | ✓      |         |        |
 * | 180p     | 320 × 180       | 15          | 140          | ✓      |         |        |
 * | 180p_1   | 320 × 180       | 15          | 140          | ✓      |         |        |
 * | 180p_3   | 180 × 180       | 15          | 100          | ✓      |         |        |
 * | 180p_4   | 240 × 180       | 15          | 120          | ✓      |         |        |
 * | 240p     | 320 × 240       | 15          | 200          | ✓      |         |        |
 * | 240p_1   | 320 × 240       | 15          | 200          | ✓      |         |        |
 * | 240p_3   | 240 × 240       | 15          | 140          | ✓      |         |        |
 * | 240p_4   | 424 × 240       | 15          | 220          | ✓      |         |        |
 * | 360p     | 640 × 360       | 15          | 400          | ✓      |         |        |
 * | 360p_1   | 640 × 360       | 15          | 400          | ✓      |         |        |
 * | 360p_3   | 360 × 360       | 15          | 260          | ✓      |         |        |
 * | 360p_4   | 640 × 360       | 30          | 600          | ✓      |         |        |
 * | 360p_6   | 360 × 360       | 30          | 400          | ✓      |         |        |
 * | 360p_7   | 480 × 360       | 15          | 320          | ✓      |         |        |
 * | 360p_8   | 480 × 360       | 30          | 490          | ✓      |         |        |
 * | 360p_9   | 640 × 360       | 15          | 800          | ✓      |         |        |
 * | 360p_10  | 640 × 360       | 24          | 800          | ✓      |         |        |
 * | 360p_11  | 640 × 360       | 24          | 1000         | ✓      |         |        |
 * | 480p     | 640 × 480       | 15          | 500          | ✓      | ✓       | ✓      |
 * | 480p_1   | 640 × 480       | 15          | 500          | ✓      | ✓       | ✓      |
 * | 480p_2   | 640 × 480       | 30          | 1000         | ✓      | ✓       | ✓      |
 * | 480p_3   | 480 × 480       | 15          | 400          | ✓      | ✓       | ✓      |
 * | 480p_4   | 640 × 480       | 30          | 750          | ✓      | ✓       | ✓      |
 * | 480p_6   | 480 × 480       | 30          | 600          | ✓      | ✓       | ✓      |
 * | 480p_8   | 848 × 480       | 15          | 610          | ✓      | ✓       | ✓      |
 * | 480p_9   | 848 × 480       | 30          | 930          | ✓      | ✓       | ✓      |
 * | 480p_10  | 640 × 480       | 10          | 400          | ✓      | ✓       | ✓      |
 * | 720p     | 1280 × 720      | 15          | 1130         | ✓      | ✓       | ✓      |
 * | 720p_1   | 1280 × 720      | 15          | 1130         | ✓      | ✓       | ✓      |
 * | 720p_2   | 1280 × 720      | 30          | 2000         | ✓      | ✓       | ✓      |
 * | 720p_3   | 1280 × 720      | 30          | 1710         | ✓      | ✓       | ✓      |
 * | 720p_5   | 960 × 720       | 15          | 910          | ✓      | ✓       | ✓      |
 * | 720p_6   | 960 × 720       | 30          | 1380         | ✓      | ✓       | ✓      |
 * | 1080p    | 1920 × 1080     | 15          | 2080         | ✓      |         | ✓      |
 * | 1080p_1  | 1920 × 1080     | 15          | 2080         | ✓      |         | ✓      |
 * | 1080p_2  | 1920 × 1080     | 30          | 3000         | ✓      |         | ✓      |
 * | 1080p_3  | 1920 × 1080     | 30          | 3150         | ✓      |         | ✓      |
 * | 1080p_5  | 1920 × 1080     | 60          | 4780         | ✓      |         | ✓      |
 * | 1440p    | 2560 × 1440     | 30          | 4850         | ✓      |         | ✓      |
 * | 1440p_1  | 2560 × 1440     | 30          | 4850         | ✓      |         | ✓      |
 * | 1440p_2  | 2560 × 1440     | 60          | 7350         | ✓      |         | ✓      |
 * | 4K       | 3840 × 2160     | 30          | 8910         | ✓      |         | ✓      |
 * | 4K_1     | 3840 × 2160     | 30          | 8910         | ✓      |         | ✓      |
 * | 4K_3     | 3840 × 2160     | 60          | 13500        | ✓      |         | ✓      |
 */
export declare type VideoEncoderConfigurationPreset = keyof typeof SUPPORT_VIDEO_ENCODER_CONFIG_LIST;

/**
 * Playback configurations for a video track. Set the playback configurations for a video track when calling [ILocalVideoTrack.play]{@link ILocalVideoTrack.play}.
 */
export declare interface VideoPlayerConfig {
    /**
     * Sets whether to enable mirror mode:
     * - `true`: Enable mirror mode.
     * - `false`: Disable mirror mode.
     *
     * > Notes:
     * > - The SDK enables mirror mode for the local video track by default.
     * > - The SDK disables mirror mode for the remote video track by default.
     */
    mirror?: boolean;
    /**
     * Sets video display mode:
     * - `"cover"`: The image files the height and width of the box, while maintaining its aspect ratio but often cropping the image in the process. For more information, see the `cover` option of `object-fit` in CSS.
     * - `"contain"`: The size of the image increases or decreases to fill the box while preserving its aspect-ratio. Areas that are not filled due to the disparity in the aspect ratio are filled with black. For more information, see the `contain` option of `object-fit` in CSS.
     * - `"fill"`: The image stretches to fit the box, regardless of its aspect-ratio. For more information, see the `fill` option of `object-fit` in CSS.
     *
     * > Notes:
     * > - When playing the local camera video track, the SDK uses cover mode by default; when playing the local video track of screen sharing, the SDK uses contain mode by default.
     * > - When playing the remote video track, the SDK uses cover mode by default.
     */
    fit?: "cover" | "contain" | "fill";
}

export { }
