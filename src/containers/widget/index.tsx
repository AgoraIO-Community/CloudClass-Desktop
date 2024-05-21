import { useStore } from '@classroom/hooks/ui-store';
import { AgoraWidgetBase } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const WidgetContainer = observer(() => {
  const {
    widgetUIStore: { z0Widgets, z10Widgets },
  } = useStore();
  console.log('z0Widgetsz0Widgets', z0Widgets)
  return (
    <>
      <div className="widget-container fcr-z-0">
        {z0Widgets.map((w: AgoraWidgetBase) => {
          return <Widget key={w.widgetId} widget={w} />;
        })}
      </div>
      <div className="widget-container fcr-z-10">
        {z10Widgets.map((w: AgoraWidgetBase) => (
          <Widget key={w.widgetId} widget={w} />
        ))}
      </div>
    </>
  );
});
export const Widget = observer(({ widget }: { widget: AgoraWidgetBase }) => {
  
  const containerDom = useRef<HTMLElement>();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const locatedNode = widget.locate();
    if (locatedNode) {
      
      containerDom.current = locatedNode;
    }

    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const renderWidgetInner = () => {
    return (
      <div
        ref={(ref) => {
          if (ref) widget.render(ref);
          else widget.unload();
        }}
      />
    );
  };

  if (mounted) {
    if (containerDom.current) {
      return createPortal(renderWidgetInner(), containerDom.current);
    }
    return renderWidgetInner();
  }

  return null;
});
