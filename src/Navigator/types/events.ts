import {NavigatorState} from './navigator';

export interface StateChangedEventParam {
  state?: {
    current: NavigatorState;
    currentIndex: number;
    previous: NavigatorState | null;
    previousIndex: number;
  };
  history?: {
    current: NavigatorState[];
    previous: NavigatorState[];
  };
}

/**
 * Parameters returned to listeners for specified events
 */
export interface EventListenersMap {
  /**
   * Is being called when state or history is changed
   * @param {StateChangedEventParam} state
   */
  change: (state: StateChangedEventParam) => void;
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
