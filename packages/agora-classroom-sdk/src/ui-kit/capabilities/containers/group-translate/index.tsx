import React from 'react';
import { observer } from 'mobx-react';
import { Button, Card, Input } from '~ui-kit';
import { useStore } from '~hooks/use-edu-stores';

const GroupTranslate = observer(() => {
  const { groupUIStore } = useStore();
  const { currentRoomUuid, groupState, generateSubRooms } = groupUIStore;
  const [number, setNumber] = React.useState<number>(4);

  return (
    <div>
      <Card>
        current room: {currentRoomUuid}
        group state: {groupState}
        generate subroom：{' '}
        <input
          type="number"
          onChange={(e) => setNumber(e.target.valueAsNumber)}
          value={number}></input>
      </Card>
      <Card>
        <Button type="primary" onClick={(_) => generateSubRooms(number)}>
          generate subroom
        </Button>
      </Card>
    </div>
  );
});

export default GroupTranslate;
