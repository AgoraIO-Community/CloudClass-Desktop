const virtualSoundCardPatternList = [/BlackHole/i, /SoundFlower/i, /AgoraALD/i];

export const matchVirtualSoundCardPattern = (deviceName: string) => {
  return virtualSoundCardPatternList.reduce((prev, pattern) => {
    pattern.test(deviceName) && (prev = true);
    return prev;
  }, false);
};
