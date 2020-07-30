import {NavigatorCompleteLocationType} from '../types';

/**
 * Options which are passed to emitLocationChanged
 */
export interface EmitLocationChangedOptions {
  currentLocationIndex: number;
  currentLocation?: NavigatorCompleteLocationType;
  prevLocationIndex: number;
  prevLocation?: NavigatorCompleteLocationType;
}

/**
 * Options which are passed to emitStackChanged
 */
export interface EmitStackChangedOptions {
  currentStack: NavigatorCompleteLocationType[];
  prevStack: NavigatorCompleteLocationType[];
}
