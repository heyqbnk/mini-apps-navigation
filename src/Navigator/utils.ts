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
 * Removes modifiers from state
 * @param state
 * @param {string[]} excludeModifiers
 * @returns {NavigatorState}
 */
export function removeModifiers(
  state: NavigatorState,
  excludeModifiers: string[],
): NavigatorState {
  const {modifiers, ...rest} = state;

  return {
    ...rest,
    modifiers: modifiers.filter(m => !excludeModifiers.includes(m)),
  };
}

/**
 * Adds modifiers to state
 * @param state
 * @param appendModifiers
 * @returns {NavigatorState}
 */
export function appendModifiers(
  state: NavigatorState,
  appendModifiers: string[],
): NavigatorState {
  const {modifiers, ...rest} = state;

  return {
    ...rest,
    modifiers: [...modifiers, ...appendModifiers],
  };
}
