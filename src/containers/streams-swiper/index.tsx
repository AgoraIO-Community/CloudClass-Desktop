import { useStore } from '@classroom/hooks/ui-store';
import { AGError, Scheduler } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState, FC } from 'react';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduRoleTypeEnum,
  GroupDetail,
} from 'agora-edu-core';

import './index.css';
import { Button, SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { TeacherStream } from '@classroom/containers/teacher-stream';
import { StudentStreamsContainer } from '@classroom/containers/student-streams';
import { VerticalStreamsContainer } from '../vertical-streams';

type Props = {
  children?: React.ReactNode;
};

export const StreamsSwiper: FC<Props> = observer(() => {
  const { streamUIStore } = useStore();
  const { swapperRight } = streamUIStore;
  return (
    <div
      className="streams-swiper-vertical"
      style={{
        width: swapperRight,
        height: '100vh',
        backgroundColor: 'rgba(53, 54, 56, 0.95)',
      }}>
      <VerticalStreamsContainer></VerticalStreamsContainer>
    </div>
  );
});
