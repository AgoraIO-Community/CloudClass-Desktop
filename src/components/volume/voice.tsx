import React from 'react';
import {CustomIcon} from '@/components/icon';
import {makeStyles} from '@material-ui/core/styles';

import './index.scss';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginTop: '8px',
  },
  sliderClass: {
    color: '#44A2FC',
    minWidth: '210px',
    marginLeft: '6px',
  },
  sliderRailClass: {
    height: '12px',
    color: '#44A2FC'
  },
  sliderMarkClass: {
    height: '12px',
    color: '#CCCCCC'
  }
});

function CustomSlider(props: any) {

  const totalVolumes = props.totalVolumes

  return (
    <div className="voice-sliders">
      {[...Array(totalVolumes)].map((e: any, key: number) => <span className={props.volume > key ? "active" : ""} key={key}></span>)}
    </div>
  )
}

const defaultTotalVolumes = 52;

function VoiceSlider(props: any) {
  const classes = useStyles(props);
  const volume = props.volume;

  const totalVolumes = props.totalVolumes ? props.totalVolumes : defaultTotalVolumes;

  return (
    <div className={classes.root}>
      {!props.hideIcon ? <CustomIcon className="icon-voice" disable /> : null}
      <CustomSlider totalVolumes={totalVolumes} volume={volume * totalVolumes} className={classes.sliderClass} />
    </div>
  );
}

export default function (props: any) {
  return (
    <div className="volume-container">
      <VoiceSlider
        totalVolumes={props.totalVolumes}
        hideIcon={props.hideIcon}
        volume={props.volume}
      />
    </div>
  )
}