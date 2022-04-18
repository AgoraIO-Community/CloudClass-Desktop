import { EduNavAction } from '@/infra/stores/common/nav-ui';
import { observer } from 'mobx-react';
import { useStore } from '~hooks/use-edu-stores';
import { Header, Inline, Popover, SvgImg, Tooltip, Button, transI18n } from '~ui-kit';
import './index.css';

export const ClassStatusComponent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { classStatusText, classStatusTextColor } = navigationBarUIStore;
  return <Inline color={classStatusTextColor}>{classStatusText}</Inline>;
});

export const SignalContent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { networkQualityLabel, delay, packetLoss } = navigationBarUIStore;
  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className="biz-col label left">{transI18n('signal.status')}:</td>
            <td className="biz-col value left">{networkQualityLabel}</td>
            <td className="biz-col label right">{transI18n('signal.delay')}:</td>
            <td className="biz-col value right">{delay}</td>
          </tr>
          <tr>
            <td className="biz-col label left">{transI18n('signal.lose')}:</td>
            <td className="biz-col value left">{packetLoss}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
});

export const SignalQualityComponent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { networkQualityClass, networkQualityIcon } = navigationBarUIStore;

  return (
    <Popover content={<SignalContent />} placement="bottomLeft">
      <div className={`biz-signal-quality ${networkQualityClass}`}>
        <SvgImg className="cursor-pointer" type={networkQualityIcon} size={24} />
      </div>
    </Popover>
  );
});

export const NavigationBarContainer = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { readyToMount } = navigationBarUIStore;

  return <>{readyToMount ? <NavigationBar></NavigationBar> : null}</>;
});

export const NavigationBarAction = observer(({ action }: { action: EduNavAction }) => {
  return (
    <Tooltip title={action.title} placement="bottom">
      <SvgImg
        canHover
        color={action.iconColor}
        type={action.iconType}
        size={24}
        onClick={action.onClick}
      />
    </Tooltip>
  );
});

export const NavigationBar = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { navigationTitle, actions, isBeforeClass, startClass } = navigationBarUIStore;

  // const { isRecording } = useRecordingContext();
  // const { roomInfo } = useRoomContext();

  // const { addDialog } = useUIStore();

  // const addRecordDialog = useCallback(() => {
  //   return addDialog(Record, { starting: isRecording });
  // }, [addDialog, Record, isRecording]);

  // const [perfState, setPerfState] = useState<boolean>(false);

  // const bizHeaderDialogs = {
  //   perf: () => setPerfState(true),
  //   setting: () => addDialog(SettingContainer),
  //   exit: () => addDialog(Exit),
  //   record: () => addRecordDialog(),
  // };

  // function handleClick(type: string) {
  //   const showDialog = bizHeaderDialogs[type];
  //   showDialog && showDialog(type);
  // }

  return (
    <Header className="biz-header">
      <div>
        <SignalQualityComponent />
      </div>
      <div className="biz-header-title-wrap">
        <div className="biz-header-title">{navigationTitle}</div>
        <div className="biz-header-title biz-subtitle">
          <ClassStatusComponent />
        </div>
        {isBeforeClass ? (
          <Button size="xs" onClick={() => startClass()}>
            {transI18n('begin_class')}
          </Button>
        ) : null}
      </div>
      <div className="header-actions">
        {actions.map((a) => (
          <NavigationBarAction key={a.iconType} action={a} />
        ))}
      </div>
    </Header>
  );
});
