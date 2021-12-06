export type CarouselSetting = {
  state: 1 | 0; // 1-enabled    0-disabled
  type: 1 | 2; // 1-sequential  2-random
  range: 1 | 2; // 1-all        2-available
  interval: number;
};

export type HandUpProgress = {
  userUuid: string;
  ts: number;
};

export enum ClassState {
  beforeClass = 0,
  ongoing = 1,
  afterClass = 2,
  // close state is front-end only state
  close = 3,
}

export type ClassroomSchedule = {
  state?: ClassState;
  // course open time, unit: milliseconds
  startTime?: number;
  // course duration, unit: seconds
  duration?: number;
  // delay to close the classroom after class, unit: seconds
  closeDelay: number;
};

export enum RecordStatus {
  started = 1,
  stopped = 0,
}

export type IMConfig = {
  chatRoomId: string;
  orgName: string;
  appName: string;
};

export type TrackData = {
  position: {
    xaxis: number;
    yaxis: number;
  };
  size: {
    height: number;
    width: number;
  };
  extra?: any;
};

export type TrackState = Record<string, TrackData>;
