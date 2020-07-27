import { INavigator, SetLocationOptions } from '../Navigator';
import { EventListenerFunc, EventType, NavigatorLocationType } from '../types';
import { BrowserNavigatorConstructorProps } from './types';
export declare class BrowserNavigator implements INavigator {
    private readonly logging;
    private readonly mode;
    private readonly navigator;
    constructor(props?: BrowserNavigatorConstructorProps);
    private originalPushState;
    private originalReplaceState;
    /**
     * Event listener which watches for popstate event and calls Navigator
     * location update
     */
    private onPopState;
    /**
     * Creates state for browser's history
     * @param data
     * @returns {BrowserHistoryState}
     */
    private createHistoryState;
    /**
     * Logs message into console
     * @param messages
     */
    private log;
    /**
     * Prepares location and uses original window's pushState method
     * @param {NavigatorLocationType} location
     * @param data
     * @param {SetLocationOptions} options
     */
    private pushState;
    /**
     * Prepares location and uses original window's replaceState method
     * @param {NavigatorLocationType} location
     * @param {SetLocationOptions} options
     * @param data
     */
    private replaceState;
    get location(): import("../types").NavigatorCompleteLocationType;
    pushLocation(location: NavigatorLocationType, options?: SetLocationOptions): void;
    replaceLocation(location: NavigatorLocationType, options?: SetLocationOptions): void;
    mount(): void;
    unmount(): void;
    back(): void;
    forward(): void;
    go(delta?: number): void;
    on<E extends EventType>(event: E, listener: EventListenerFunc<E>): void;
    off<E extends EventType>(event: E, listener: EventListenerFunc<E>): void;
    createSegue(location: NavigatorLocationType): string;
}
