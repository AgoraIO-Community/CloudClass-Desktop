import { useSelector } from 'react-redux';
import { ShowAnnouncement } from './ShowAnnouncement';
import { EditAnnouncement } from './EditAnnouncement';

import './index.css';

// 公告
export const Announcement = () => {
  const state = useSelector((state) => state);
  const editStatus = state?.announcementStatus;
  return (
    <div>
      {editStatus && <ShowAnnouncement />}
      {!editStatus && <EditAnnouncement />}
    </div>
  );
};
