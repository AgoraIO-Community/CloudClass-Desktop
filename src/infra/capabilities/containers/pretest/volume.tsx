import { FC, useMemo } from 'react';

interface VolumeProps {
  maxLength?: number;
  cursor: number;
  peek: number;
}

export const Volume: FC<VolumeProps> = ({ maxLength = 12, cursor, peek = 12 }) => {
  const activityIndex = useMemo(() => {
    const percentage = cursor / peek;
    return Math.round(maxLength * percentage);
  }, [maxLength, peek, cursor]);

  return (
    <div className='fcr-flex fcr-items-center' style={{
      width: '100%',
      height: '100%',
      gap: 4,
    }}>
      {Array(maxLength)
        .fill('agora')
        .map((item, index) => (
          <div
            style={{
              width: `${Math.round(1 / maxLength * 100)}%`,
              height: 10,
              borderRadius: 10,
              background: `rgba(53, 123, 246, ${activityIndex >= index + 1 ? 1 : 0.1})`,
              transition: 'all 0.3s ease-in'
            }}
            key={`${item}-${index}`}
          />
        ))}
    </div>
  );
};

