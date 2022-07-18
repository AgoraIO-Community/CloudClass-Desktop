import { observer } from 'mobx-react';
import { Card, Loading } from '~ui-kit';
import { useStore } from '@/infra/hooks/ui-store';
import './index.css';

export const LoadingContainer = observer(() => {
  const { layoutUIStore } = useStore();
  const { loading, loadingText } = layoutUIStore;
  return loading ? <PageLoading loadingText={loadingText} /> : null;
});

const PageLoading = (props: { loadingText?: string }) => {
  const { loadingText } = props;
  return (
    <div className="page-loading">
      <Card width={90} height={90} className="card-loading-position">
        <Loading></Loading>
        {loadingText && <p className="page-loading-text">{loadingText}</p>}
      </Card>
    </div>
  );
};
