import { useStore } from '@/infra/hooks/ui-store';
import { GroupMethod } from '@/infra/stores/common/group-ui';
import { observer } from 'mobx-react';
import { useState, FC } from 'react';
import { Button, RadioGroup, transI18n, InputNumber } from '~ui-kit';
import './index.css';

type Props = {
  onCancel: () => void;
  onNext: (params: { groupNum: number }) => void;
};

export const Start: FC<Props> = observer(({ onCancel, onNext }) => {
  const { groupUIStore } = useStore();

  const { createGroups, numberToBeAssigned, MAX_USER_COUNT } = groupUIStore;

  const [groupNum, setGroupNum] = useState(1);

  const [type, setType] = useState(GroupMethod.AUTO);

  const perGroup = Math.floor(numberToBeAssigned / groupNum);

  return (
    <>
      <div className="group-start-content">
        <div className="start-main-title">{transI18n('breakout_room.create_group')}</div>
        <div className="start-sub-title">{transI18n('breakout_room.group_number')}</div>
        <InputNumber
          value={groupNum}
          onChange={(num) => {
            setGroupNum(num);
          }}
          min={1}
          max={20}
        />
        <div className="start-sub-title">{transI18n('breakout_room.group_type')}</div>
        <div className="flex justify-start">
          <RadioGroup
            gap={3}
            direction="vertical"
            radios={[
              { label: transI18n('breakout_room.auto'), value: GroupMethod.AUTO },
              { label: transI18n('breakout_room.manual'), value: GroupMethod.MANUAL },
            ]}
            name="breakout-room-type"
            value={type}
            onChange={(value) => {
              setType(value);
            }}
          />
          <div className="inline-flex flex-col">
            <div
              style={{
                marginLeft: 16,
                visibility:
                  type === GroupMethod.AUTO && numberToBeAssigned > 0 ? 'visible' : 'hidden',
              }}
              className="mb-3">
              {transI18n('breakout_room.wait_for_assign3', {
                reason:
                  perGroup >= MAX_USER_COUNT ? `${MAX_USER_COUNT}` : `${perGroup}-${perGroup + 1}`,
              })}
            </div>
            <div
              style={{
                marginLeft: 16,
                visibility: type === GroupMethod.MANUAL ? 'visible' : 'hidden',
              }}>
              {transI18n('breakout_room.wait_for_assign1', {
                reason: `${numberToBeAssigned}`,
              })}
              {numberToBeAssigned > 0 &&
                transI18n('breakout_room.wait_for_assign2', {
                  reason:
                    perGroup >= MAX_USER_COUNT
                      ? `${MAX_USER_COUNT}`
                      : `${perGroup}-${perGroup + 1}`,
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="group-start-footer">
        <Button
          type="secondary"
          size="xs"
          className="rounded-btn"
          style={{ marginRight: 15 }}
          onClick={() => {
            onCancel();
          }}>
          {transI18n('breakout_room.cancel_submit')}
        </Button>
        <Button
          size="xs"
          className="rounded-btn"
          onClick={() => {
            createGroups(type, groupNum);
            onNext({ groupNum });
          }}>
          {transI18n('breakout_room.create_submit')}
        </Button>
      </div>
    </>
  );
});
