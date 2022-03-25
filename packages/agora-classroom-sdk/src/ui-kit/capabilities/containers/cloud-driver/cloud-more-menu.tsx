import React from 'react';
import { transI18n } from '~ui-kit';

export type CloudMoreMenuProps = {
  resourceUuid: string;
  deleteResource: (uuid: string) => void;
};

export default function CloudMoreMenu({ resourceUuid, deleteResource }: CloudMoreMenuProps) {
  return (
    <div className="cloud-more-menu">
      <div
        className="more-menu-item"
        onClick={() => {
          deleteResource(resourceUuid);
        }}>
        {transI18n('cloud.delete')}
      </div>
    </div>
  );
}
