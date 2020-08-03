import qs from 'querystring';
import {BrowserHistoryState, InitOptions} from './types';
import {Maybe} from '../types';
import {NavigatorState} from '../Navigator/types';

/**
 * States if value is object
 * @param value
 * @returns {value is Record<string, any>}
 */
function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value);
}

/**
 * States if value is string
 * @param value
 * @returns {value is string}
 */
function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * States if value is null or undefined or string
 * @param value
 * @returns {value is Maybe<string>}
 */
function isMaybeString(value: any): value is Maybe<string> {
  return isString(value) || value == null || typeof value === 'undefined';
}

/**
 * States if value is BrowserHistoryState
 * @param state
 * @returns {state is BrowserHistoryState}
 */
export function isBrowserState(state: any): state is BrowserHistoryState {
  return isObject(state) &&
    'state' in state &&
    isObject(state.navigator) &&
    typeof state.navigator.index === 'number' &&
    Array.isArray(state.navigator.history) &&
    state.navigator.history.every(state => {
      if (!isObject(state)) {
        return false;
      }

      return isString(state.view) &&
        isMaybeString(state.modal) &&
        isMaybeString(state.popup) &&
        isObject(state.params) &&
        Array.isArray(state.modifiers) &&
        state.modifiers.every(isString);
    });
}

/**
 * Tries to extract navigator info from current window.history.state
 */
export function extractInitOptions(): InitOptions | null {
  if (isBrowserState(window.history.state)) {
    const {index, history} = window.history.state.navigator;
    return {state: history[index], history};
  }
  return null;
}

/**
 * Parses link and returns navigator location in case, it could be derived
 * @param {string} link
 * @returns {NavigatorState | null}
 */
export function parseLink(link: string): NavigatorState | null {
  // Examples of matching string:
  // shadow,back,compile://main/modal/popup?open=link&return_to=edit
  // back://
  // main//
  const match = link.match(/^#?(.+:\/\/|)(.*)/);

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
  const [view = '', modal = null, popup = null] = linkValue
    .split('/')
    .map(decodeURIComponent);

  // Otherwise return location
  const params = qs.parse(search);

  return {view, modal, popup, params, modifiers};
}

/**
 * Creates link to get into new location
 * @param {NavigatorState} location
 * @returns {string}
 */
export function createLink(location: NavigatorState): string {
  const modifiersPart = 'modifiers' in location && location.modifiers.length > 0
    ? location.modifiers.map(encodeURIComponent).join(',') + '://'
    : '';

  if (!('view' in location)) {
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

