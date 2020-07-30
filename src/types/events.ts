import {NavigatorCompleteLocationType} from './location';

export interface StateChangedEventParam {
  location?: {
    currentLocation: NavigatorCompleteLocationType;
    currentLocationIndex: number;
    prevLocation: NavigatorCompleteLocationType;
    prevLocationIndex: number;
  };
  stack?: {
    currentStack: NavigatorCompleteLocationType[];
    prevStack: NavigatorCompleteLocationType[];
  };
}

/**
 * Parameters returned to listeners for specified events
 */
export interface EventListenersMap {
  /**
   * Is being called when current location is changed
   * @param {NavigatorCompleteLocationType} currentLocation
   * @param {number} currentLocationIndex
   * @param {NavigatorCompleteLocationType} prevLocation
   * @param {number} prevLocationIndex
   */
  'location-changed': (
    currentLocation: NavigatorCompleteLocationType,
    currentLocationIndex: number,
    prevLocation: NavigatorCompleteLocationType,
    prevLocationIndex: number,
  ) => void;

  /**
   * Is being called when locations stack is updated
   * @param {NavigatorCompleteLocationType[]} currentStack
   * @param {NavigatorCompleteLocationType[]} previousStack
   */
  'stack-changed': (
    currentStack: NavigatorCompleteLocationType[],
    previousStack: NavigatorCompleteLocationType[],
  ) => void;

  /**
   * Is being called when location or locations stack is changed
   * @param {StateChangedEventParam} state
   */
  'state-changed': (state: StateChangedEventParam) => void;
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
