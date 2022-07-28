import {
  FcrEngagement,
  FcrExtension,
  FcrFooter,
  FcrHeader,
  FcrStage,
  FcrUIBaseProps,
  FcrUIConfig,
} from '@/infra/types/config';
import { loadUIConfig } from '@/infra/utils/config-loader';
import { EduRoomTypeEnum } from 'agora-edu-core';

export class FcrUIConfigImpl implements FcrUIConfig {
  get version(): string {
    return '1.0.0';
  }

  get engagement(): FcrEngagement {
    return {
      get roster() {
        return {
          enable: true,
        };
      },
      get screenShare() {
        return {
          enable: true,
        };
      },
      get raiseHand() {
        return {
          enable: true,
        };
      },
      get popupQuiz() {
        return {
          enable: true,
        };
      },
      get breakoutRoom() {
        return {
          enable: true,
        };
      },
      get agoraChat() {
        return {
          get muteAll(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get emoji(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get picture(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          enable: true,
        };
      },
      get counter() {
        return {
          enable: true,
        };
      },
      get poll() {
        return {
          enable: true,
        };
      },
      get netlessBoard() {
        return {
          get hand(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get switch(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get mouse(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get selector(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get pencil(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get text(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get eraser(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get clear(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get save(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get laserPointer(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          enable: true,
        };
      },
      get cloudStorage() {
        return {
          enable: true,
        };
      },
    };
  }
  get stage(): FcrStage {
    return {
      get teacherVideo() {
        return {
          get resetPosition(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get offStage(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          enable: true,
        };
      },
      get studentVideo() {
        return {
          get camera(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get microphone(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get boardAuthorization(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get reward(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get offStage(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          enable: true,
        };
      },
    };
  }
  get header(): FcrHeader {
    return {
      get stateBar() {
        return {
          get networkState(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get roomName(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get scheduleTime(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get classState(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get microphone(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          get camera(): FcrUIBaseProps {
            return {
              enable: false,
            };
          },
          enable: true,
        };
      },
    };
  }
  get footer(): FcrFooter {
    return {
      enable: false,
    };
  }
  get extension(): FcrExtension {
    return {
      get agoraChat() {
        return {
          enable: true,
          get muteAll(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get emoji(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },

          get picture(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
        };
      },
    };
  }
}
loadUIConfig(EduRoomTypeEnum.RoomSmallClass, new FcrUIConfigImpl());
