import {NavigatorSimplifiedState, NavigatorState} from './types';

/**
 * Converts simplified state to normal
 * @param {NavigatorSimplifiedState} state
 * @returns {NavigatorState}
 */
export function fulfillState(
  state: NavigatorState | NavigatorSimplifiedState,
): NavigatorState {
  const {params, modifiers, ...rest} = state;
  return {...rest, params: params || {}, modifiers: modifiers || []};
}

/**
 * Removes modifiers from location
 * @param {NavigatorState} location
 * @param {string[]} excludeModifiers
 * @returns {NavigatorState}
 */
export function removeModifiers(
  location: NavigatorState,
  excludeModifiers: string[],
): NavigatorState {
  const {modifiers, ...rest} = location;

  return {
    ...rest,
    modifiers: modifiers.filter(m => !excludeModifiers.includes(m)),
  };
}

/**
 * Removes modifiers from location
 * @param {NavigatorState} location
 * @param appendModifiers
 * @returns {NavigatorState}
 */
export function appendModifiers(
  location: NavigatorState,
  appendModifiers: string[],
): NavigatorState {
  const {modifiers, ...rest} = location;

  return {
    ...rest,
    modifiers: [...modifiers, ...appendModifiers],
  };
}
