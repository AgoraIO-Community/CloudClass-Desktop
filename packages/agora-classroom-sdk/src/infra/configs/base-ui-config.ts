import {
  FcrAgoraChat,
  FcrEngagement,
  FcrExtension,
  FcrFooter,
  FcrHeader,
  FcrNetlessBoard,
  FcrStage,
  FcrStateBar,
  FcrStudentVideo,
  FcrTeacherVideo,
  FcrUIBaseProps,
  FcrUIConfig,
} from '@/infra/types/config';

class FcrUIConfigImpl implements FcrUIConfig {
  get version(): string {
    return '1.0.0';
  }
  get name(): string {
    return '';
  }
  get header(): FcrHeader {
    return {
      get stateBar(): FcrStateBar & FcrUIBaseProps {
        return {
          get networkState(): FcrUIBaseProps {
            return { enable: true };
          },
          get roomName(): FcrUIBaseProps {
            return { enable: true };
          },
          get scheduleTime(): FcrUIBaseProps {
            return { enable: true };
          },
          get classState(): FcrUIBaseProps {
            return { enable: true };
          },
          get microphone(): FcrUIBaseProps {
            return { enable: true };
          },
          get camera(): FcrUIBaseProps {
            return { enable: true };
          },
          enable: true,
        };
      },
    };
  }
  get stage(): FcrStage {
    return {
      get teacherVideo(): FcrTeacherVideo & FcrUIBaseProps {
        return {
          get resetPosition(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get offStage(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          enable: true,
        };
      },
      get studentVideo(): FcrStudentVideo & FcrUIBaseProps {
        return {
          get camera(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get microphone(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get boardAuthorization(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get reward(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          get offStage(): FcrUIBaseProps {
            return {
              enable: true,
            };
          },
          enable: true,
        };
      },
    };
  }
  get engagement(): FcrEngagement {
    return {
      get netlessBoard(): FcrNetlessBoard & FcrUIBaseProps {
        return {
          enable: true,
          get switch(): FcrUIBaseProps {
            return { enable: true };
          },
          get mouse(): FcrUIBaseProps {
            return { enable: true };
          },
          get text(): FcrUIBaseProps {
            return { enable: true };
          },
          get selector(): FcrUIBaseProps {
            return { enable: true };
          },
          get pencil(): FcrUIBaseProps {
            return { enable: true };
          },
          get eraser(): FcrUIBaseProps {
            return { enable: true };
          },
          get move(): FcrUIBaseProps {
            return { enable: true };
          },
          get save(): FcrUIBaseProps {
            return { enable: true };
          },
        };
      },
      get laserPointer(): FcrUIBaseProps {
        return { enable: true };
      },
      get popupQuiz(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get counter(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get poll(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get screenShare(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get cloudStorage(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get breakoutRoom(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get roster(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
      get raiseHand(): FcrUIBaseProps {
        return {
          enable: true,
        };
      },
    };
  }
  get footer(): FcrFooter {
    return {};
  }
  get extension(): FcrExtension {
    return {
      get agoraChat(): FcrAgoraChat & FcrUIBaseProps {
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

export const room1V1Class = new FcrUIConfigImpl();
export const roomMidClass = new FcrUIConfigImpl();
export const roomBigClass = new FcrUIConfigImpl();
