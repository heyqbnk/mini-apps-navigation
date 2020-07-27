import { EventListeningManipulator, NavigatorLocationType } from '../types';
export interface SetLocationOptions {
    /**
     * Should replace be silent. It means, no event listeners will be called
     * @default false
     */
    silent?: boolean;
}
export interface INavigator {
    /**
     * Current location. Read-only property
     */
    location: NavigatorLocationType | null;
    /**
     * Pushes new location adding it to locations stack
     * @param {NavigatorLocationType} location
     * @param {SetLocationOptions} options
     */
    pushLocation(location: NavigatorLocationType, options?: SetLocationOptions): void;
    /**
     * Replaces current location with new one
     * @param {NavigatorLocationType} location
     * @param {SetLocationOptions} options
     */
    replaceLocation(location: NavigatorLocationType, options?: SetLocationOptions): void;
    /**
     * Mounts navigator. It means that navigator will try to extract current
     * location from external environment and install external location change
     * listener
     */
    mount(): void;
    /**
     * Unmounts navigator. All handlers and function rewires will be rolled back
     */
    unmount(): void;
    /**
     * Creates segue for specified location
     * @param {NavigatorLocationType} location
     * @returns {string}
     */
    createSegue(location: NavigatorLocationType): string;
    /**
     * Removes last pushed location from routing stack. Calls event listeners
     */
    back(): void;
    /**
     * Goes forward through routing stack. Calls event listeners
     */
    forward(): void;
    /**
     * Goes through routing stack with passed delta. Calls event listeners
     */
    go(delta?: number): void;
    /**
     * Adds listener for specified event
     */
    on: EventListeningManipulator;
    /**
     * Removes listener from specified event
     */
    off: EventListeningManipulator;
}
export interface NavigatorConstructorProps {
    /**
     * Should navigator show logs. Can be used for debugging purposes
     * @default false
     */
    log?: boolean;
}
