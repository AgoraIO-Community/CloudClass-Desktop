import classNames from 'classnames';
import { FC, useState } from 'react';
import { BaseProps } from '~ui-kit/components/util/type';
import { SvgIcon } from '..';
import { SvgIconEnum } from '../svg-img/type';
import './style.css';

export type TreeModel = {
  id: string;
  text: string;
  children?: TreeModel[];
};

type MultiRootTreeProps = {
  data: TreeModel[];
  renderNode?: (node: TreeModel, level: number) => JSX.Element | undefined;
  gap?: number;
  disableExpansion?: boolean;
  childClassName?: string;
  showArrowAlways?: boolean;
} & BaseProps;

type TreeProps = {
  level: number;
  data: TreeModel;
  gap?: number;
  renderNode?: (node: TreeModel, level: number) => JSX.Element | undefined;
  disableExpansion?: boolean;
  childClassName?: string;
  showArrowAlways?: boolean;
};

export const MultiRootTree: FC<MultiRootTreeProps> = ({
  data,
  gap,
  disableExpansion,
  childClassName,
  renderNode,
  showArrowAlways,
}) => {
  return (
    <div className="fcr-multi-tree-root">
      {data.map((node, key) => (
        <Tree
          data={node}
          key={key.toString()}
          level={0}
          gap={gap}
          disableExpansion={disableExpansion}
          childClassName={childClassName}
          renderNode={renderNode}
          showArrowAlways={showArrowAlways}
        />
      ))}
    </div>
  );
};

export const Tree: FC<TreeProps> = ({
  data,
  level,
  gap,
  disableExpansion,
  childClassName,
  renderNode,
  showArrowAlways,
}) => {
  const hasChildren = data.children?.length || showArrowAlways;

  const [expanded, setExtpanded] = useState(false);

  const cls = classNames('fcr-tree-node flex items-center cursor-pointer', {
    [`mb-${gap}`]: !!gap,
    [`${childClassName}`]: !!childClassName,
  });

  return (
    <div className="fcr-tree-root">
      <div
        className={cls}
        onClick={
          !disableExpansion
            ? () => {
              setExtpanded(!expanded);
            }
            : undefined
        }>
        {!disableExpansion &&
          (hasChildren ? (
            <SvgIcon
              type={SvgIconEnum.TRIANGLE_SOLID_RIGHT}
              hoverType={SvgIconEnum.TRIANGLE_SOLID_RIGHT}
              size={14}
              style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform .2s',
              }}
              className="mr-2"
            />
          ) : (
            <i style={{ width: 22 }} />
          ))}
        {renderNode ? (
          renderNode(data, level)
        ) : (
          <div className="flex-grow flex justify-between items-center">
            <span>{data.text}</span>
          </div>
        )}
      </div>
      {expanded &&
        data.children &&
        data.children.map((node, key) => (
          <Tree
            data={node}
            key={key.toString()}
            level={level + 1}
            gap={gap}
            disableExpansion={disableExpansion}
            childClassName={childClassName}
            renderNode={renderNode}
          />
        ))}
    </div>
  );
};

type TreeNodeProps = {
  content: React.ReactNode;
  className?: string;
  tail?: JSX.Element;
} & React.HTMLAttributes<HTMLDivElement>;

export const TreeNode: FC<TreeNodeProps> = ({ content, tail, className, ...htmlProps }) => {
  const cls = classNames('flex-grow flex justify-between items-center', className);
  return (
    <div className={cls} {...htmlProps}>
      <span>{content}</span>
      {tail}
    </div>
  );
};
