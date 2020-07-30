import {NavigatorCompleteLocationType} from '../types';

/**
 * List of options required to call emitStateChanged
 */
export interface EmitEventsOptions {
  location?: {
    currentLocationIndex: number;
    currentLocation?: NavigatorCompleteLocationType;
    prevLocationIndex: number;
    prevLocation?: NavigatorCompleteLocationType;
  };
  stack?: {
    currentStack: NavigatorCompleteLocationType[];
    prevStack: NavigatorCompleteLocationType[];
  };
}
