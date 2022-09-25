import { useExtensionCabinets } from '@/infra/hooks/cabinet';
import { useStore } from '@/infra/hooks/ui-store';
import { CabinetItemEnum } from '@/infra/stores/common/type';
import { observer } from 'mobx-react';
import React from 'react';
import { SvgIconEnum } from '~components';
import { IconButton } from '~components-v2';


type DeviceDropdownProps = {
    disabled: boolean, muted: boolean, icon: SvgIconEnum
};

const DeviceDropdown = observer(({ disabled, muted, icon }: DeviceDropdownProps) => {
    let opacity = 1;
    let backgroundColor = '#18191B';

    if (muted) {
        backgroundColor = '#F5655C';
    }

    if (disabled) {
        opacity = 0.5;
    }

    return <IconButton icon={icon} iconColor={"#fff"} backgroundColor={backgroundColor} opacity={opacity} disabled={disabled} />;
});

export const CameraDropdown = observer(() => {
    const disabled = true;
    const muted = true;
    const icon = muted ? SvgIconEnum.CAMERA_OFF : SvgIconEnum.CAMERA_ON;

    return <DeviceDropdown disabled={disabled} muted={muted} icon={icon} />;
});


export const MicDropdown = () => {
    const disabled = true;
    const muted = true;
    const icon = muted ? SvgIconEnum.MIC_OFF : SvgIconEnum.MIC_ON;

    return <DeviceDropdown disabled={disabled} muted={muted} icon={icon} />;
}

export const ScreenShareTool = observer(() => {
    const { toolbarUIStore } = useStore();

    const handleClick = () => {
        toolbarUIStore.openBuiltinCabinet(CabinetItemEnum.ScreenShare);
    }

    return <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.SCREENSHARING} onClick={handleClick} />;
});


export const ChatTool = observer(() => {
    return <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.COLORED_CHAT} />;
});


export const RosterTool = observer(() => {
    const { toolbarUIStore } = useStore();

    const handleClick = () => {
        toolbarUIStore.setTool('register');
    }

    return <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.PEOPLE} onClick={handleClick} />;
});

export const Quit = observer(() => {
    return <IconButton iconColor='#fff' backgroundColor={'#F5655C'} icon={SvgIconEnum.QUIT} />;
});

