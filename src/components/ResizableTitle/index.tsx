import { HTMLAttributes } from 'react';
import { Resizable, ResizableProps } from 'react-resizable';
import './index.less';

export type ResizableTitleProps = HTMLAttributes<any> & {
  onResizeStart: ResizableProps['onResizeStart'];
  onResize: ResizableProps['onResize'];
  onResizeStop: ResizableProps['onResizeStop'];
  width?: number;
  widthConstraints?: number[];
};

export const WIDTH_CONSTRAINTS = [60, 500];

export const ResizableTitle = (props: ResizableTitleProps) => {
  const {
    onResize,
    onResizeStart,
    onResizeStop,
    width,
    widthConstraints = WIDTH_CONSTRAINTS,
    ...rest
  } = props;

  if (!width) return <th {...rest} />;

  const minConstraints: ResizableProps['minConstraints'] = [
    widthConstraints[0],
    0,
  ];
  const maxConstraints: ResizableProps['maxConstraints'] = [
    widthConstraints[1],
    0,
  ];
  return (
    <Resizable
      className="resizable-title"
      minConstraints={minConstraints}
      maxConstraints={maxConstraints}
      width={width}
      height={0}
      handle={
        <span
          className="resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    >
      <th {...rest} style={{ width }} />
    </Resizable>
  );
};
