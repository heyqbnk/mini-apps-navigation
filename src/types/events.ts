import {NavigatorCompleteLocationType} from './location';

/**
 * Parameters returned to listeners for specified events
 */
export interface EventListenersMap {
  'location-changed': (
    currentLocation: NavigatorCompleteLocationType,
    currentLocationIndex: number,
    previousLocation: NavigatorCompleteLocationType,
    previousLocationIndex: number,
  ) => void;
  'stack-changed': (
    currentStack: NavigatorCompleteLocationType[],
    previousStack: NavigatorCompleteLocationType[],
  ) => void;
}

/**
 * Available listening events
 */
export type EventType = keyof EventListenersMap;

/**
 * Defines event listener
 */
export type EventListenerFunc<E extends EventType> = EventListenersMap[E]

/**
 * Describes any existing event listener
 */
export type EventListener = {
  [E in EventType]: {
    event: E;
    listener: EventListenerFunc<E>;
  };
}[EventType];
