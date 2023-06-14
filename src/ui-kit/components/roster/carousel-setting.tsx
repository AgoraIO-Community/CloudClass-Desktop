import { FC, useCallback } from 'react';
import { CheckBox } from '@classroom/ui-kit/components/checkbox';
import { Input } from '@classroom/ui-kit/components/input';
import { Select } from '../select';
import { CarouselProps } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';

type CarouselSettingProps = CarouselProps;

export const CarouselSetting: FC<CarouselSettingProps> = ({
  times,
  onTimesChange,
  isOpenCarousel,
  onOpenCarousel,
  mode,
  onModeChange,
  randomValue,
  onRandomValueChange,
}) => {
  const timesEventTransform = useCallback(
    (eventType: 'change' | 'blur') => (e: any) => onTimesChange(e.target.value, eventType),
    [onTimesChange],
  );
  const openEventTransform = useCallback(
    (e: any) => onOpenCarousel(e.target.checked),
    [onTimesChange],
  );

  const transI18n = useI18n();

  return (
    <div className="carousel-menu">
      <div className="carousel-flag">
        <CheckBox checked={isOpenCarousel} onChange={openEventTransform} />
        <span className="carousel-desc" style={{ position: 'relative', top: -2 }}>
          {transI18n('roster.shift')}
        </span>
      </div>
      <div className="student-order">
        <span className="carousel-desc">{transI18n('roster.students_in')}</span>
        <Select
          className="order-select"
          value={randomValue}
          options={[
            {
              label: transI18n('roster.sequence'),
              value: '1',
            },
            {
              label: transI18n('roster.random'),
              value: '2',
            },
          ]}
          onChange={onRandomValueChange}
        />
      </div>
      <div className="carousel-frequency">
        <span className="carousel-desc">{transI18n('roster.order_every')}</span>
        <div className="carousel-frequency-input">
          <Input
            value={times}
            onChange={timesEventTransform('change')}
            onBlur={timesEventTransform('blur')}
          />
        </div>
        <span className="carousel-desc">{transI18n('roster.seconds')}</span>
      </div>
    </div>
  );
};
