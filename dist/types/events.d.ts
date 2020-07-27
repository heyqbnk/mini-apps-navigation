import { NavigatorCompleteLocationType } from './location';
/**
 * Parameters returned to listeners for specified events
 */
export interface EventListenerParamsMap {
    'location-changed': NavigatorCompleteLocationType;
}
/**
 * Available listening events
 */
export declare type EventType = keyof EventListenerParamsMap;
/**
 * Returns passed to listener list of parameters
 */
export declare type EventListenerParams<E extends EventType> = EventListenerParamsMap[E];
/**
 * Defines event listener
 */
export declare type EventListenerFunc<E extends EventType> = (params: EventListenerParams<E>) => void;
/**
 * Describes any existing event listener
 */
export declare type EventListener = {
    [E in EventType]: {
        event: E;
        listener: EventListenerFunc<E>;
    };
}[EventType];
/**
 * Type for adding and removing listeners
 */
export declare type EventListeningManipulator = <E extends EventType>(event: E, listener: EventListenerFunc<E>) => void;
