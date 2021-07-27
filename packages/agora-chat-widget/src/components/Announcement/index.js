import React from 'react';
import { useSelector } from 'react-redux';

import { ShowAnnouncement } from './ShowAnnouncement';
import { EditAnnouncement } from './EditAnnouncement';

import announcement from '../../themes/img/announcement.png';

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
