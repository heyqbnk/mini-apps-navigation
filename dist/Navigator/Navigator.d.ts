import { EventListenerFunc, NavigatorLocationType, ChangeLocationResult, NavigatorCompleteLocationType } from '../types';
import { NavigatorConstructorProps, SetLocationOptions } from './types';
/**
 * Abstract class which represents navigator which controls current application
 * routing state
 */
export declare class Navigator {
    protected readonly logging: boolean;
    /**
     * List of bound listeners
     * @type {any[]}
     */
    private listeners;
    /**
     * Locations stack
     * @type {any[]}
     */
    locationsStack: NavigatorCompleteLocationType[];
    /**
     * Current stack location index
     * @type {number}
     */
    locationIndex: number;
    constructor(props?: NavigatorConstructorProps);
    /**
     * Logs message into console
     * @param messages
     */
    private log;
    /**
     * Calls listeners which are bound to "location-changed" event
     */
    protected emitLocationChanged(): void;
    /**
     * Pushes location to stack on current position, removing every location
     * after
     * @param {NavigatorCompleteLocationType} location
     * @param options
     */
    private pushLocationToStack;
    /**
     * Pushes new location to stack and updates current location. Returns delta
     * which states how much location index was changed
     * @param {NavigatorLocationType} location
     * @param options
     */
    pushLocation(location: NavigatorLocationType, options?: SetLocationOptions): ChangeLocationResult;
    /**
     * Replaces last added stack location
     * @param {NavigatorLocationType} location
     * @param {SetLocationOptions} options
     */
    replaceLocation(location: NavigatorLocationType, options?: SetLocationOptions): void;
    /**
     * Goes through stack and reassigns current location. Returns delta
     * which states how much location index was changed
     * @param {number} delta
     * @param {SetLocationOptions} options
     * @returns {ChangeLocationResult}
     */
    go(delta: number, options?: SetLocationOptions): ChangeLocationResult;
    /**
     * Shortcut for go(-1)
     * @param {SetLocationOptions} options
     * @returns {ChangeLocationResult}
     */
    back(options?: SetLocationOptions): ChangeLocationResult;
    /**
     * Shortcut for go(1)
     * @param {SetLocationOptions} options
     * @returns {ChangeLocationResult}
     */
    forward(options?: SetLocationOptions): ChangeLocationResult;
    /**
     * Sets initial values for navigator
     */
    init(index: number, locationsStack: NavigatorCompleteLocationType[]): void;
    /**
     * Returns current location
     * @returns {NavigatorCompleteLocationType}
     */
    getLocation(): NavigatorCompleteLocationType;
    /**
     * Adds listener for specified event
     * @param {E} event
     * @param {EventListenerFunc<E>} listener
     */
    on: <E extends "location-changed">(event: E, listener: EventListenerFunc<E>) => void;
    /**
     * Removes listener from specified event
     * @param {E} event
     * @param {EventListenerFunc<E>} listener
     */
    off: <E extends "location-changed">(event: E, listener: EventListenerFunc<E>) => void;
}
