import { useStore } from '@/infra/hooks/use-edu-stores';
import { GroupMethod } from '@/infra/stores/common/group-ui';
import { range } from 'lodash';
import { observer } from 'mobx-react';
import { useMemo, useState, FC } from 'react';
import { Button, RadioGroup, Select, transI18n } from '~ui-kit';

type Props = {
  onNext: () => void;
};

export const Start: FC<Props> = observer(({ onNext }) => {
  const { groupUIStore } = useStore();

  const { createGroups } = groupUIStore;

  const groupNumOptions = useMemo(
    () =>
      range(1, 32).map((i) => ({
        label: `${i}`,
        value: i,
      })),
    [],
  );

  const [groupNum, setGroupNum] = useState(1);

  const [type, setType] = useState(1);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="outline-box pt-3 flex justify-center">
        <div className="inline-flex flex-col">
          <div className="inline-flex items-center mb-2">
            <span className="mr-1">{transI18n('breakout_room.create_prefix')}</span>
            <Select
              className="group-select"
              size="sm"
              options={groupNumOptions}
              onChange={(num) => {
                setGroupNum(num);
              }}
              value={groupNum}
            />
            <span className="ml-1">{transI18n('breakout_room.create_suffix')}</span>
          </div>
          <RadioGroup
            gap={3}
            direction="vertical"
            radios={[
              { label: transI18n('breakout_room.auto'), value: 1 },
              { label: transI18n('breakout_room.manual'), value: 2 },
            ]}
            name="breakout-room-type"
            value={type}
            onChange={(value) => {
              setType(value);
            }}
          />
        </div>
      </div>
      <div className="my-3">{transI18n('breakout_room.wait_for_assign', { reason: 10 })}</div>
      <Button
        onClick={() => {
          createGroups(GroupMethod.MANUAL, groupNum);
          onNext();
        }}>
        {transI18n('breakout_room.create_submit')}
      </Button>
    </div>
  );
});
