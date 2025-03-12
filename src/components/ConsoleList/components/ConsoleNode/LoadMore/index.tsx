import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props<T extends any[]> {
  list: T;
  render: (item: T[number]) => React.ReactNode;
}

export const LoadMore = React.memo(
  <T extends any[]>({ list, render }: Props<T>) => {
    const [expand, setExpand] = useState(false);
    const dataRef = useRef<{ current: T; rest: T } | null>(null);
    useEffect(() => {
      return () => {
        dataRef.current = null;
      };
    }, []);

    if (!dataRef.current) {
      dataRef.current = {
        current: list.slice(0, 200) as T,
        rest: list.slice(200) as T,
      };
    }

    const { current, rest } = dataRef.current;

    return (
      <>
        {current.map(render)}
        {rest.length > 0 ? (
          !expand ? (
            <div onClick={() => setExpand(true)} className="load-more-btn">
              ({rest.length} more ...)
            </div>
          ) : (
            <LoadMore list={rest} render={render} />
          )
        ) : null}
      </>
    );
  },
);
