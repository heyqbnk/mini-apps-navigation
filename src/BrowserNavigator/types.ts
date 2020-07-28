import {NavigatorCompleteLocationType} from '../types';

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

export interface BrowserNavigatorInitOptions {
  locationIndex: number;
  locationsStack: NavigatorCompleteLocationType[];
}
