import { IconTypes } from "../icon/icon-types";
export declare type ProfileRole = 'student' | 'teacher' | 'assistant' | 'invisible';
export declare const canOperate: (role: any, localUid: string, data: any, col: any) => boolean;
export declare const getChatState: (profile: any, canOperate: boolean) => {
    type: IconTypes;
    operateStatus: string;
    chatStatus: string;
};
export declare const getCameraState: (profile: any, canOperate: boolean) => {
    type: IconTypes;
    operateStatus: string;
    cameraStatus: any;
};
export declare const getMicrophoneState: (profile: any, canOperate: boolean) => {
    type: IconTypes;
    operateStatus: string;
    microphoneStatus: any;
};
interface PublicProfile {
    name: string;
    onPodium: boolean;
}
export declare const studentListSort: <T extends PublicProfile>(list: T[]) => T[];
export {};
