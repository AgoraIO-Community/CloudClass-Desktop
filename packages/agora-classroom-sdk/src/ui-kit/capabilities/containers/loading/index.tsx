import { observer } from 'mobx-react';
import { Card, Loading } from '~ui-kit';
import { useStore } from '~hooks/use-edu-stores';
import './index.css';

export const LoadingContainer = observer(() => {
  const { layoutUIStore } = useStore();
  const { loading } = layoutUIStore;
  return loading ? <PageLoading /> : null;
});

const PageLoading = () => {
  return (
    <div className="page-loading">
      <Card width={90} height={90} className="card-loading-position">
        <Loading></Loading>
      </Card>
    </div>
  );
};
