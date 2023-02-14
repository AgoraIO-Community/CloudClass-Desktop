import { useStore } from '@classroom/infra/hooks/ui-store';
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

  return (
    <div className="fcr-video-grid-settings">
      {/* dropdown button */}
      <div className="fcr-video-grid-settings-button" onClick={handleOpen}>
        <SvgImg type={SvgIconEnum.MATRIX} size={26} colors={{ iconPrimary: '#000' }} />
        <span className="fcr-video-grid-settings-button-text">{buttonText}</span>
        <SvgImg type={SvgIconEnum.DROPDOWN} colors={{ iconPrimary: '#000' }} />
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
