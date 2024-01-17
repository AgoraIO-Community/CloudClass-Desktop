export const MicrophoneIndicator = ({
  size = 24,
  voicePercent = 0,
}: {
  size?: number;
  voicePercent?: number;
}) => {
  return (
    <div className="fcr-microphone">
      <svg viewBox="0 0 48 48" fill="none" width={size} height={size}>
        <defs>
          <linearGradient x1="0%" x2="0%" y1="0%" y2="100%" id="gradient">
            <stop stopColor="#fff" offset="0%"></stop>
            <stop stopColor="#fff" offset={`${100 - voicePercent}%`}></stop>
            <stop stopColor="#64BB5C" offset={`${100 - voicePercent}%`}></stop>
            <stop stopColor="#64BB5C" offset="100%"></stop>
          </linearGradient>
        </defs>

        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.4001 23.0001C16.4001 22.2269 15.7733 21.6001 15.0001 21.6001C14.2269 21.6001 13.6001 22.2269 13.6001 23.0001V26.0001C13.6001 31.7439 18.2563 36.4001 24.0001 36.4001C29.7439 36.4001 34.4001 31.7439 34.4001 26.0001V23.0001C34.4001 22.2269 33.7733 21.6001 33.0001 21.6001C32.2269 21.6001 31.6001 22.2269 31.6001 23.0001V26.0001C31.6001 30.1975 28.1975 33.6001 24.0001 33.6001C19.8027 33.6001 16.4001 30.1975 16.4001 26.0001V23.0001Z"
          fill="white"
        />
        <path
          d="M24 12C20.6863 12 18 14.6863 18 18V26C18 29.3137 20.6863 32 24 32C27.3137 32 30 29.3137 30 26V18C30 14.6863 27.3137 12 24 12Z"
          fill="url(#gradient)"
        />
      </svg>
    </div>
  );
};
