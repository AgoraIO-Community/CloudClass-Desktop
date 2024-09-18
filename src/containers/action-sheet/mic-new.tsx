export const MicrophoneIndicatorNew = ({
  size = 24,
  voicePercent = 0,
}: {
  size?: number;
  voicePercent?: number;
}) => {

  return (
    <div className="fcr-microphone">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient x1="0%" x2="0%" y1="0%" y2="100%" id="gradient">
            <stop stopColor={'#fff'} offset="0%"></stop>
            <stop stopColor={'#fff'} offset={`${100 - voicePercent}%`}></stop>
            <stop stopColor="#64BB5C" offset={`${100 - voicePercent}%`}></stop>
            <stop stopColor="#64BB5C" offset="100%"></stop>
          </linearGradient>
        </defs>
        <path d="M12.5 14.5C14.16 14.5 15.5 13.16 15.5 11.5V5.5C15.5 3.84 14.16 2.5 12.5 2.5C10.84 2.5 9.5 3.84 9.5 5.5V11.5C9.5 13.16 10.84 14.5 12.5 14.5Z"  fill="url(#gradient)" />
        <path d="M17.5 11.5C17.5 14.26 15.26 16.5 12.5 16.5C9.74 16.5 7.5 14.26 7.5 11.5H5.5C5.5 15.03 8.11 17.93 11.5 18.42V21.5H13.5V18.42C16.89 17.93 19.5 15.03 19.5 11.5H17.5Z" fill="#FEFEFE" />
      </svg>
    </div>
  );
};
