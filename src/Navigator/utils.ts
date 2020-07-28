import {isTechLocation} from '../utils';
import {NavigatorLocationType, NavigatorTechLocation} from '../types';

/**
 * States if location is empty tech location
 * @param {NavigatorLocationType} location
 * @returns {location is NavigatorTechLocation}
 */
export function isEmptyTechLocation(
  location: NavigatorLocationType
): location is NavigatorTechLocation {
  return isTechLocation(location) && location.modifiers.length === 0;
}
