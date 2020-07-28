import {BrowserHistoryState} from './types';
import {Maybe} from '../types';

function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value);
}

function isString(value: any): value is string {
  return typeof value === 'string';
}

function isStringOrEmpty(value: any): value is Maybe<string> {
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
    typeof state.navigator.locationIndex === 'number' &&
    Array.isArray(state.navigator.locationsStack) &&
    state.navigator.locationsStack.every(location => {
      if (!isObject(location)) {
        return false;
      }
      const keysCount = Object.keys(location).length;
      const modifiersOk = Array.isArray(location.modifiers) &&
        location.modifiers.every(isString);

      // Modifiers should be OK in each type of locations
      if (!modifiersOk) {
        return false;
      }

      // Means, its tech location
      if (keysCount === 1) {
        return true;
      }

      return isString(location.view) &&
        isStringOrEmpty(location.modal) &&
        isStringOrEmpty(location.popup) &&
        isObject(location.params);
    });
}

/**
 * Tries to extract navigator info from current window.history.state
 */
export function extractBrowserNavigatorSettings() {
  if (isBrowserState(window.history.state)) {
    return window.history.state.navigator;
  }
  return null;
}
