import {NavigatorCompleteLocationType} from './location';

/**
 * Parameters returned to listeners for specified events
 */
export interface EventListenerParamsMap {
  'location-changed': NavigatorCompleteLocationType;
}

/**
 * Available listening events
 */
export type EventType = keyof EventListenerParamsMap;

/**
 * Returns passed to listener list of parameters
 */
export type EventListenerParams<E extends EventType> = EventListenerParamsMap[E];

/**
 * Defines event listener
 */
export type EventListenerFunc<E extends EventType> = (params: EventListenerParams<E>) => void;

/**
 * Describes any existing event listener
 */
export type EventListener = {
  [E in EventType]: {
    event: E;
    listener: EventListenerFunc<E>;
  };
}[EventType];

/**
 * Type for adding and removing listeners
 */
export type EventListeningManipulator = <E extends EventType>(
  event: E,
  listener: EventListenerFunc<E>,
) => void;
