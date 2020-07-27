import { NavigatorTechLocation, NavigatorLocationType, NavigatorSimplifiedLocation, NavigatorLocation, NavigatorCompleteLocationType } from './types';
/**
 * Parses link and returns navigator location in case, it could be derived
 * @param {string} segue
 * @returns {NavigatorLocationType | null}
 */
export declare function parseSegue(segue: string): NavigatorLocationType | null;
/**
 * States if location is NavigatorTechLocation
 * @param {NavigatorLocationType} location
 * @returns {location is NavigatorTechLocation}
 */
export declare function isTechLocation(location: NavigatorLocationType): location is NavigatorTechLocation;
/**
 * Creates segue to get into new location
 * @param {NavigatorLocationType} location
 * @returns {string}
 */
export declare function createSegue(location: NavigatorLocationType): string;
/**
 * Fulfills missing NavigatorLocation properties with defaults
 * @param {NavigatorSimplifiedLocation} location
 * @returns {NavigatorLocation}
 */
export declare function fulfillLocation(location: NavigatorSimplifiedLocation): NavigatorLocation;
/**
 * Converts nullable location to null or complete location info
 * @param {NavigatorLocationType} location
 * @returns {NavigatorCompleteLocationType}
 */
export declare function formatLocation(location: NavigatorLocationType): NavigatorCompleteLocationType;
