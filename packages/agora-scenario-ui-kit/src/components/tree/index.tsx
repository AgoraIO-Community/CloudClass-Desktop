import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { SvgIcon } from '..';
import './style.css';

type TreeModel = {
  text: string;
  children?: TreeModel[];
};

type TreeProps = {
  data: TreeModel[];
  renderSuffix?: (node: TreeModel, level: number) => JSX.Element | undefined;
  gap?: number;
  onClick?: () => void;
  disableExpansion?: boolean;
  childClassName?: string;
} & BaseProps;

type TreeNodeProps = {
  level: number;
  data: TreeModel;
  gap?: number;
  renderSuffix?: (node: TreeModel, level: number) => JSX.Element | undefined;
  onClick?: () => void;
  disableExpansion?: boolean;
  childClassName?: string;
};

export const Tree: FC<TreeProps> = ({
  data,
  renderSuffix,
  gap,
  onClick,
  disableExpansion,
  childClassName,
}) => {
  return (
    <div>
      {data.map((node, key) => (
        <TreeNode
          data={node}
          key={key.toString()}
          renderSuffix={renderSuffix}
          level={0}
          gap={gap}
          onClick={onClick}
          disableExpansion={disableExpansion}
          childClassName={childClassName}
        />
      ))}
    </div>
  );
};
export const TreeNode: FC<TreeNodeProps> = ({
  data,
  renderSuffix,
  level,
  gap,
  onClick,
  disableExpansion,
  childClassName,
}) => {
  const hasChildren = data.children?.length;

  const [expanded, setExtpanded] = useState(false);

  const indent = level * 2;

  const cls = classNames('fcr-tree-node flex items-center cursor-pointer', {
    [`mb-${gap}`]: !!gap,
    [`${childClassName}`]: !!childClassName,
  });

  return (
    <div>
      <div
        className={cls}
        onClick={() => {
          setExtpanded(!expanded);
        }}>
        {!disableExpansion &&
          (hasChildren ? (
            <SvgIcon
              type="triangle-solid"
              size={14}
              style={{
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform .2s',
              }}
              className="mr-2"
            />
          ) : (
            <i style={{ width: 22 }} />
          ))}
        <div className="flex-grow flex justify-between items-center" onClick={onClick}>
          <span>{data.text}</span>
          {renderSuffix && renderSuffix(data, level)}
        </div>
      </div>
      {expanded &&
        data.children &&
        data.children.map((node, key) => (
          <TreeNode
            data={node}
            key={key.toString()}
            level={level + 1}
            gap={gap}
            onClick={onClick}
            renderSuffix={renderSuffix}
            disableExpansion={disableExpansion}
            childClassName={childClassName}
          />
        ))}
    </div>
  );
};
