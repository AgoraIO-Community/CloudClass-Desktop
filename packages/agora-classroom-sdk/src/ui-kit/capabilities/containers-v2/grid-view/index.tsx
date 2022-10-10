import { useStore } from '@/infra/hooks/ui-store';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { observer } from 'mobx-react';
import { DividedGridView } from './divided';
import { SurroundedGridView } from './surrounded';

export const GridView = observer(() => {
    const { layoutUIStore } = useStore() as EduStudyRoomUIStore;

    const { viewMode } = layoutUIStore;

    return viewMode === 'divided' ? <DividedGridView /> : <SurroundedGridView />;
});
