import { observer } from 'mobx-react';
import { useState } from 'react';
import { ActiveKeyEnum, CloudDriver } from './cloud-driver';

export type CloudDriverContainerProps = {
  onClose?: () => void;
  onDelete?: (fileName: string) => void;
};

export const CloudDriverContainer: React.FC<CloudDriverContainerProps> = observer(({ onClose }) => {
  const [activeKey, setActiveKey] = useState<ActiveKeyEnum>(ActiveKeyEnum.public);

  const handleChange = (key: string) => {
    setActiveKey(key as ActiveKeyEnum);
  };

  return <CloudDriver onClose={onClose} activeKey={activeKey} handleChange={handleChange} />;
});
