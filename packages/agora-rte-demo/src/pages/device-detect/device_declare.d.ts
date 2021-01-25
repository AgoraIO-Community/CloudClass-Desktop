declare interface DevicePageProps {
  url?: string
  children?: React.ReactChild
}

declare interface AudioPageProps extends DevicePageProps {
}

declare interface VideoPageProps extends DevicePageProps {

}

declare interface SpeakerPageProps extends DevicePageProps {
}