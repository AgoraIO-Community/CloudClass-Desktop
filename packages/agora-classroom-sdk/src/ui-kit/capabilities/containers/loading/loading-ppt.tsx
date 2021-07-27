import { BaseProps } from '~ui-kit/components/interface/base-props';
import { observer } from 'mobx-react';
import { Card, Loading } from '~ui-kit';
import { FC } from 'react';

export interface LoadingPptProps extends BaseProps {
  initCourseWareProgress: number;
  initCourseWareLoading: boolean;
}

export const LoadingPptContainer: FC<LoadingPptProps> = observer(
  ({ initCourseWareProgress = 0, initCourseWareLoading = false }) => {
    return initCourseWareLoading ? (
      <PageLoading loadingProcess={initCourseWareProgress} />
    ) : null;
  },
);

const PageLoading = (props: any) => {
  return (
    <div className="page-loading">
      <Card width={258} height={113}>
        <Loading
          hasLoadingGif={false}
          currentProgress={props.loadingProcess}
          loadingText="课件加载中，请稍候…"
          hasProgress></Loading>
      </Card>
    </div>
  );
};
