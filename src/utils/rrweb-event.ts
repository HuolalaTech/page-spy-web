import {
  EventType,
  mouseInteractionData,
  MouseInteractions,
  eventWithTime,
  IncrementalSource,
  metaEvent,
} from '@rrweb/types';

interface RRWebClickEvent {
  type: EventType.IncrementalSnapshot;
  data: mouseInteractionData & {
    type: MouseInteractions.Click;
  };
  timestamp: number;
  delay?: number;
}
export const isRRWebClickEvent = (event: unknown): event is RRWebClickEvent => {
  const { type, data } = event as eventWithTime;
  if (
    type === EventType.IncrementalSnapshot &&
    data.source === IncrementalSource.MouseInteraction &&
    data.type === MouseInteractions.Click
  ) {
    return true;
  }

  return false;
};

export const isRRWebMetaEvent = (event: unknown): event is metaEvent => {
  const { type } = event as eventWithTime;
  if (type === EventType.Meta) {
    return true;
  }
  return false;
};
