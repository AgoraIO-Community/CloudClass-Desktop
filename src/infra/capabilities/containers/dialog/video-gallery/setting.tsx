import { useClickAnywhere } from '@classroom/infra/hooks';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, useCallback, useMemo, useState } from 'react';
import './setting.css';

export type Props = {
  options: { text: string; value: number }[];
  setPageSize: (pageSize: number) => void;
  pageSize: number;
};

export const Setting: FC<Props> = observer(({ options, setPageSize, pageSize }) => {
  const [opened, setOpened] = useState(false);

  const buttonText = useMemo(
    () => options.find(({ value }) => value === pageSize)?.text,
    [pageSize],
  );

  const dropdownCls = classNames('fcr-video-grid-settings-dropdown', {
    'fcr-video-grid-settings-dropdown--closed': !opened,
  });

  const handleOpen = useCallback(() => setOpened((v) => !v), []);
  const handleSelect = useCallback((value: number) => {
    return () => {
      setOpened(false);
      setPageSize(value);
    };
  }, []);

  const ref = useClickAnywhere(() => {
    setOpened(false);
  });

  return (
    <div className="fcr-video-grid-settings" ref={ref}>
      {/* dropdown button */}
      <div className="fcr-video-grid-settings-button" onClick={handleOpen}>
        <SvgImg type={SvgIconEnum.MATRIX} size={26} />
        <span className="fcr-video-grid-settings-button-text">{buttonText}</span>
        <SvgImg
          style={{ transform: opened ? 'rotate(180deg)' : 'rotate(0deg)', transition: '.3s all' }}
          type={SvgIconEnum.DROPDOWN}
        />
      </div>
      {/* dropdown list options */}
      <div className={dropdownCls}>
        <ul>
          {options.map(({ text, value }, i) => {
            return (
              <li
                className="fcr-video-grid-settings-inner-el"
                key={i.toString()}
                onClick={handleSelect(value)}>
                {text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});
