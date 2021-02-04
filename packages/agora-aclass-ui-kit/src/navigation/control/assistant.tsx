import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles'
import { NavigationControlButton } from './button'
import { SignalBar } from '../../signalBar'
interface IProps {
  userSignalStatus?: ISignalStatus[]
}
interface ISignalStatus {
  userName: string,
  userUid: string,
  signalLevel: number,
  delay: number,
  packagesLost: number

}
const ITEM_HEIGHT = 48;
const useStyles = makeStyles((theme: Theme) => ({
  assistant: {
    fontSize: '12px',
    color: '#fff',
    position: 'relative'
  },
  realTimeText: {
    fontSize: '12px',
    color: '#fff'
  },
  userNetwork: {
    background: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    border: '50px solid transparent',
    borderBottom: '50px solid green',
  },
  userNetworkList: {
    position: 'absolute',
    background: '#DEF4FF',
    boxShadow: '0px 0px 3px 0px rgba(40, 122, 191, 0.61)',
    borderRadius: '10px',
    border: '1px solid #75C0FF',
    width: '290px',
    listStyleType: "none",
    padding: '20px'
  },
  userNetworkItem: {
    color: '#333',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'flex-start'
  },
  useNetworkStatus: {
    paddingLeft: '12px'
  },
  packagesLost: {
    paddingLeft: '24px'
  }
}))
export const LongMenu = (props: IProps) => {

  const { userSignalStatus = [] } = props
  console.log(userSignalStatus);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [iconUp, setIconUp] = React.useState(false);
  const open = Boolean(anchorEl);
  const colorMap = {
    1: '#F34C76',
    2: '#F1A73E',
    3: '#A6D90E'
  }
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIconUp(!iconUp);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIconUp(false);
  }
  const classes = useStyles()
  return (
    <div>
      <div className={classes.assistant}>
        <div onClick={handleClick} className={classes.userNetwork}>
          <NavigationControlButton icon="userNetwork" iconStyle={{ width: 20, height: 16 }} />
          <span>用户实时网络</span>
          <NavigationControlButton icon={!iconUp ? 'triangleDown' : 'triangleUp'} iconStyle={{ width: 20, height: 16 }} />
        </div>
      </div>
      <ul className={classes.userNetworkList}>
        {userSignalStatus.length && userSignalStatus.map((option) => (
          <li className={classes.userNetworkItem} key={option.userUid} >
            <SignalBar level={option.signalLevel} width='20px' height='16px' foregroundColor={colorMap[option.signalLevel]} />
            <div className={classes.useNetworkStatus}>
              <div>{option.userName}</div>
              <div>
                网络延时：
                <span style={{ color: colorMap[option.signalLevel] }}>{option.delay}</span>ms

              </div>
              <div>
                丢包率
              <span className={classes.packagesLost} style={{ color: colorMap[option.signalLevel] }} >{option.packagesLost}</span>%
           </div>
            </div>
          </li>
        ))}

      </ul>

    </div>
  );
}
