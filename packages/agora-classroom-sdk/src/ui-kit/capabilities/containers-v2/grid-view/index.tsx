import { useStore } from '@/infra/hooks/ui-store';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { observer } from 'mobx-react';
import { DividedGridView } from './divided';
import { SurroundedGridView } from './surrounded';

export const GridView = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    return streamUIStore.viewMode === 'divided' ? <DividedGridView /> : <SurroundedGridView />;
});
