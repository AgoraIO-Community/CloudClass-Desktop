import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import './index.css';
import { SvgIconEnum, SvgImg } from '..';
import { isNumber } from 'lodash';

type InputNumberProps = {
  min: number;
  max: number;
  value?: number;
  onChange: (value: number | null) => void;
};

export const InputNumber: FC<InputNumberProps> = ({ min, max, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [innerVal, setInnerVal] = useState('');
  const lastValidNum = useRef<number | null>();

  useEffect(() => {
    if (isNumber(value)) {
      setInnerVal(`${value}`);
      lastValidNum.current = value;
    }
  }, [value]);

  const getValidNumber = (n: number) => {
    if (isNumber(max)) {
      n = Math.min(max, n);
    }
    if (isNumber(min)) {
      n = Math.max(min, n);
    }
    return n;
  };
  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    if (!isNumber(lastValidNum.current)) {
      setInnerVal('');
      return;
    }

    if (/^-?\d+$/.test(innerVal)) {
      const n = parseInt(innerVal, 10);
      const vn = getValidNumber(n);
      if (vn !== n) {
        setInnerVal(`${vn}`);
        lastValidNum.current = vn;
        onChange(vn);
      }
    } else {
      setInnerVal(`${lastValidNum.current}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value.trim();

    setInnerVal(e.target.value);

    if (!s && lastValidNum.current !== null) {
      lastValidNum.current = null;
      onChange(null);
    }

    if (/^-?\d+$/.test(s)) {
      const n = parseInt(e.target.value, 10);
      const vn = getValidNumber(n);
      if (n === vn) {
        lastValidNum.current = vn;
        onChange(vn);
      }
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocused(true);
    let n = (lastValidNum.current ?? 0) + 1;
    if (isNumber(max)) {
      n = Math.min(max, n);
    }
    setInnerVal(`${n}`);
    lastValidNum.current = n;
    onChange(n);
  };
  const handleSubtract = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocused(true);
    let n = (lastValidNum.current ?? 0) - 1;
    if (isNumber(min)) {
      n = Math.max(min, n);
    }
    setInnerVal(`${n}`);
    lastValidNum.current = n;
    onChange(n);
  };

  const clsn = classnames('fcr-input-number-wrapper', {
    // 'fcr-input-number-focus': focus
  });

  const addClsn = classnames('fcr-input-number-add', { disabled: value ?? 0 >= max });
  const subClsn = classnames('fcr-input-number-sub', { disabled: value ?? 0 <= min });

  return (
    <div className={clsn}>
      <input onFocus={handleFocus} onBlur={handleBlur} value={innerVal} onChange={handleChange} />
      <div className="fcr-input-number-tail">
        <div className={addClsn} onClick={handleAdd}>
          <SvgImg
            type={SvgIconEnum.TRIANGLE_SOLID_UP}
            size={14}
            colors={{ iconPrimary: '#3f5c8f' }}
          />
        </div>
        <div className={subClsn} onClick={handleSubtract}>
          <SvgImg
            type={SvgIconEnum.TRIANGLE_SOLID_DOWN}
            size={14}
            colors={{ iconPrimary: '#3f5c8f' }}
          />
        </div>
      </div>
    </div>
  );
};
