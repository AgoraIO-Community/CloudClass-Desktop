import { FC, useMemo } from 'react';
import styled from 'styled-components';

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
    <VolumeContainer>
      {Array(maxLength)
        .fill('agora')
        .map((item, index) => (
          <VolumeColumn
            key={`${item}-${index}`}
            span={1 / maxLength}
            activity={activityIndex >= index + 1}
          />
        ))}
    </VolumeContainer>
  );
};

const VolumeContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const VolumeColumn = styled.div<{ span: number; activity?: boolean }>`
  width: ${(props) => `${Math.round(props.span * 100)}%`};
  height: 10px;
  border-radius: 10px;
  background: rgba(53, 123, 246, ${(props) => (props.activity ? 1 : 0.1)});
  transition: all 0.3s ease-in;
`;
