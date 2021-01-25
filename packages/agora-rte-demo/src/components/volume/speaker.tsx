import React, {useEffect} from 'react';
import {CustomIcon} from '@/components/icon';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

import './index.scss';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginTop: '8px',
  },
  sliderClass: {
    color: '#44A2FC',
    minWidth: '210px',
    marginLeft: '6px'
  }
});

interface SliderProps {
  totalVolume?: number
  volume: number
  onChange: (volume: number) => void
  hideIcon?: boolean
  siderClassName?: string
}

export default function ContinuousSlider(props: SliderProps) {
  const classes = useStyles(props);
  // const [value, setValue] = React.useState<number>(props.volume);

  const handleChange = (event: any, newValue: any) => {
    props.onChange(newValue)
  };

  // useEffect(() => {
  //   props.onChange(value);
  // }, [value]);

  return (
    <div className="volume-container">
      <div className={classes.root}>
        {!props.hideIcon ? <CustomIcon className="icon-speaker" disable/> : null}
        <Slider className={props.siderClassName ? props.siderClassName : classes.sliderClass} value={props.volume} onChange={handleChange} aria-labelledby="continuous-slider" />
      </div>
    </div>
  );
}