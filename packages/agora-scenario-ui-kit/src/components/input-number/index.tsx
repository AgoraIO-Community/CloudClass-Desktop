import { FC, useState } from 'react';
import classnames from 'classnames';
import './index.css';
import { SvgIconEnum, SvgImg } from '..';

type InputNumberProps = {
  min: number;
  max: number;
  value?: number;
  onChange: (value: number) => void;
};

export const InputNumber: FC<InputNumberProps> = ({ min, max, value = 0, onChange }) => {
  const [focus, setFocus] = useState(false);

  const clsn = classnames('fcr-input-number-wrapper', {
    // 'fcr-input-number-focus': focus
  });

  const addClsn = classnames('fcr-input-number-add', { disabled: value >= max });
  const subClsn = classnames('fcr-input-number-sub', { disabled: value <= min });

  const handleChange = (num: number) => {
    if (num > max) {
      num = max;
    }
    if (num <= min) {
      num = min;
    }
    onChange(num);
  };

  return (
    <div className={clsn}>
      <input
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
        value={value}
        onChange={(e) => {
          let num = min;
          if (/\d+/.test(e.target.value)) {
            num = parseInt(e.target.value);
          }

          handleChange(num);
        }}
      />
      <div className="fcr-input-number-tail">
        <div
          className={addClsn}
          onClick={() => {
            handleChange(value + 1);
          }}>
          <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_UP} size={14} colors={{ iconPrimary: "#3f5c8f" }} />
        </div>
        <div
          className={subClsn}
          onClick={() => {
            handleChange(value - 1);
          }}>
          <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_DOWN} size={14} colors={{ iconPrimary: "#3f5c8f" }} />
        </div>
      </div>
    </div>
  );
};
