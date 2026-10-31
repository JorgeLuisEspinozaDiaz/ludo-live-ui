import { useQueryClient } from "@tanstack/react-query";
import {
  REALTIME_EVENTS,
  applyRealtimeEvent,
  type RealtimeEventName,
  type RealtimePayloadMap,
} from "./event-cache-map";
import { useSocketEvent } from "./useSocketEvent";

function RealtimeEventListener<E extends RealtimeEventName>({
  event,
}: {
  event: E;
}) {
  const queryClient = useQueryClient();
  useSocketEvent<RealtimePayloadMap[E]>(event, (payload) => {
    applyRealtimeEvent(queryClient, event, payload);
  });
  return null;
}

/** Registers all live socket events and syncs TanStack Query cache. */
export function RealtimeBridge() {
  return (
    <>
      {REALTIME_EVENTS.map((event) => (
        <RealtimeEventListener key={event} event={event} />
      ))}
    </>
  );
}
