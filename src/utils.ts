import {
  NavigatorTechLocation,
  NavigatorLocationType,
  NavigatorSimplifiedLocation, NavigatorLocation, NavigatorCompleteLocationType,
} from './types';
import qs from 'querystring';

/**
 * Parses link and returns navigator location in case, it could be derived
 * @param {string} segue
 * @returns {NavigatorLocationType | null}
 */
export function parseSegue(segue: string): NavigatorLocationType | null {
  // Examples of matching string:
  // shadow,back,compile://main/modal/popup?open=link&return_to=edit
  // back://
  // main//
  const match = segue.match(/^#?(.+:\/\/|)(.*)/);

  if (!match) {
    return null;
  }
  const [, modifiersStr, linkStr] = match;
  const modifiers = modifiersStr.length > 0
    ? modifiersStr
      .slice(0, modifiersStr.length - 3)
      .split(',')
      .filter(elem => elem.length > 0)
      .map(decodeURIComponent)
    : [];

  let linkValue = '';
  let search = '';
  const qIndex = linkStr.indexOf('?');

  if (qIndex > -1) {
    linkValue = linkStr.slice(0, qIndex);
    search = linkStr.slice(qIndex + 1);
  } else {
    linkValue = linkStr;
  }
  const [view = null, modal = null, popup = null] = linkValue
    .split('/')
    .map(decodeURIComponent)
    .map(part => part.length === 0 ? null : part);

  // In case, view cannot be determined, we should check if this segue is
  // tech segue
  if (view === null) {
    return modifiers.length > 0 ? {modifiers} : null;
  }

  // Otherwise return location
  const params = qs.parse(search);

  return {view, modal, popup, params, modifiers};
}

/**
 * States if location is NavigatorTechLocation
 * @param {NavigatorLocationType} location
 * @returns {location is NavigatorTechLocation}
 */
export function isTechLocation(
  location: NavigatorLocationType,
): location is NavigatorTechLocation {
  return location !== null && !('view' in location);
}

/**
 * Creates segue to get into new location
 * @param {NavigatorLocationType} location
 * @returns {string}
 */
export function createSegue(location: NavigatorLocationType): string {
  const {modifiers} = location;
  const modifiersPart = modifiers && modifiers.length > 0
    ? modifiers.map(encodeURIComponent).join(',') + '://'
    : '';

  if (isTechLocation(location)) {
    return '#' + modifiersPart;
  }
  const {modal, view, params, popup} = location;
  const valuePart = (view ? encodeURIComponent(view) : '') +
    `/${modal ? encodeURIComponent(modal) : ''}` +
    `/${popup ? encodeURIComponent(popup) : ''}`;
  const queryPart = params && Object.keys(params).length > 0
    ? `?${qs.stringify(params)}`
    : '';

  return '#' + modifiersPart + valuePart + queryPart;
}

/**
 * Fulfills missing NavigatorLocation properties with defaults
 * @param {NavigatorSimplifiedLocation} location
 * @returns {NavigatorLocation}
 */
export function fulfillLocation(
  location: NavigatorSimplifiedLocation,
): NavigatorLocation {
  const {modifiers, params, ...rest} = location;
  return {...rest, modifiers: modifiers || [], params: params || {}};
}

/**
 * Converts nullable location to null or complete location info
 * @param {NavigatorLocationType} location
 * @returns {NavigatorCompleteLocationType}
 */
export function formatLocation(
  location: NavigatorLocationType,
): NavigatorCompleteLocationType {
  return isTechLocation(location) ? location : fulfillLocation(location);
}
