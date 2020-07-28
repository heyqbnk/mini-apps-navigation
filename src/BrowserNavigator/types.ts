import {NavigatorConstructorProps} from '../Navigator';
import {NavigatorCompleteLocationType} from '../types';

/**
 * Browser navigation mode types
 */
export type BrowserNavigatorModeType = 'default' | 'hash';

/**
 * Browser's history state
 */
export interface BrowserHistoryState {
  /**
   * Custom passed by user state
   */
  state?: any;

  /**
   * Navigator based properties
   */
  navigator: {
    /**
     * Location index
     */
    locationIndex: number;

    /**
     * Locations stack
     */
    locationsStack: NavigatorCompleteLocationType[];
  };
}

export interface BrowserNavigatorConstructorProps
  extends NavigatorConstructorProps {
  /**
   * Navigation mode. If "hash" is specified, navigator will work with window's
   * location hash. Otherwise, window.location.pathname is used
   * @default "hash"
   */
  mode?: BrowserNavigatorModeType;
}

export interface BrowserNavigatorInitOptions {
  locationIndex: number;
  locationsStack: NavigatorCompleteLocationType[];
}
