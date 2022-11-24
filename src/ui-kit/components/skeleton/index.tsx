import Skeleton, { SkeletonProps } from 'antd/lib/skeleton';
import { PropsWithChildren, ReactElement } from 'react';

type ASkeletonProps = Pick<SkeletonProps, 'className' | 'active' | 'paragraph' | 'avatar'>;

export function ASkeleton<T = any>(props: PropsWithChildren<ASkeletonProps>): ReactElement {
  return <Skeleton {...props} />;
}
