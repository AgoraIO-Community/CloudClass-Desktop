import React from 'react';
import { Icon } from '~components/icon';
import { ExpandableToolItem, ToolItem } from './tool';

export const defaultTools: ExpandableToolItem[] = [
  {
    value: 'selection',
    label: '选择',
    icon: 'select',
    canActive: true,
  },
  {
    value: 'draw-tools',
    canActive: true,
    expand: {
      active: {
        value: 'pen',
        label: '铅笔',
        icon: 'pen',
      },
      items: [
        {
          value: 'pen',
          label: '铅笔',
          icon: 'pen',
        },
        {
          value: 'rectangle',
          icon: 'square',
          label: '矩形',
        },
        {
          value: 'circle',
          icon: 'circle',
          label: '圆形',
        },
        {
          value: 'line',
          icon: 'line',
          label: '直线',
        },
      ],
      renderExpand: (props) => {
        const { expand, onClick, value: parentValue } = props;
        return (
          <div className={`expand-tools`}>
            {expand?.items.map((item) => {
              const tool = item as ToolItem;
              const activeTool = expand.active as ToolItem;
              return (
                <div
                  key={tool.value}
                  className="expand-tool"
                  onClick={() => onClick && onClick(parentValue, tool)}>
                  {tool.icon ? <Icon type={tool.icon} /> : null}
                  {activeTool.value === tool.value ? (
                    <div className="active-indicator" />
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      },
    },
    renderContent: ({ expand, canActive, isActive }) => {
      const activeTool = expand?.active as ExpandableToolItem;
      return (
        <div className={`tool ${canActive && isActive ? 'active' : ''}`}>
          {activeTool.icon ? <Icon type={activeTool.icon} /> : null}
          {expand ? (
            <Icon className="expandable" type={'triangle-down'} />
          ) : null}
        </div>
      );
    },
  },
  {
    value: 'text',
    label: '文本',
    icon: 'text',
    canActive: true,
  },
  {
    value: 'eraser',
    label: '橡皮',
    icon: 'eraser',
    canActive: true,
  },
  {
    value: 'color',
    label: '颜色',
    icon: 'color',
    renderContent: ({ expand, icon }: ExpandableToolItem) => (
      <div
        className={`tool`}
        style={{
          color: expand?.active as string,
        }}>
        {icon ? <Icon type={icon} /> : null}
        {expand ? <Icon className="expandable" type={'triangle-down'} /> : null}
      </div>
    ),
    expand: {
      active: '#7ed321',
      items: [
        '#ffffff',
        '#9b9b9b',
        '#4a4a4a',
        '#000000',
        '#d0021b',
        '#f5a623',
        '#f8e71c',
        '#7ed321',
        '#9013fe',
        '#50e3c2',
        '#0073ff',
        '#ffc8e2',
      ],
      renderExpand: (props) => {
        const { expand, onClick, value: parentValue } = props;
        return (
          <div className={`expand-tools colors`}>
            {expand?.items.map((item) => {
              const value = item as string;
              return (
                <div
                  key={value}
                  onClick={() => onClick && onClick(parentValue, value)}
                  className="expand-tool color"
                  style={{
                    borderColor: expand.active === value ? value : undefined,
                  }}>
                  <div className="circle" style={{ backgroundColor: value }} />
                </div>
              );
            })}
          </div>
        );
      },
    },
  },
  {
    value: 'blank-page',
    label: '新增空白页',
    icon: 'blank-page',
  },
  {
    value: 'hand',
    label: '举手',
    icon: 'hand',
  },
  {
    value: 'cloud',
    label: '云盘',
    icon: 'cloud',
  },
  {
    value: 'follow',
    label: '视角跟随',
    icon: 'follow',
  },
  {
    value: 'tools',
    label: '工具箱',
    icon: 'tools',
    renderContent: ({ expand, icon }: ExpandableToolItem) => (
      <div className={`tool`}>
        {icon ? <Icon type={icon} /> : null}
        {expand ? <Icon className="expandable" type={'triangle-down'} /> : null}
      </div>
    ),
    expand: {
      items: [
        {
          value: 'screen-share',
          icon: 'share-screen',
          label: '屏幕共享',
        },
      ],
      renderExpand: (props) => {
        const { expand, onClick, value: parentValue } = props;
        return (
          <div className="expand-tools">
            {expand?.items.map((item) => {
              const tool = item as ToolItem;
              return (
                <div
                  key={tool.value}
                  className="expand-tool toolkit"
                  onClick={() => onClick && onClick(parentValue, tool)}>
                  {tool.icon ? <Icon type={tool.icon} /> : null}
                  <div className="label">{tool.label}</div>
                </div>
              );
            })}
          </div>
        );
      },
    },
  },
];
