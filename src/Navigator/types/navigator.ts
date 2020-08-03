import {EventListenerFunc, EventType} from './events';
import {MakePartial, State} from '../../types';

export interface NavigatorState extends State {
  /**
   * List of modifiers which are applied to current state. Each modifier
   * has its own influence on navigator's behaviour. These modifiers are mostly
   * used by Navigator and has a design character
   */
  modifiers: string[];
}

export interface NavigatorSimplifiedState
  extends MakePartial<NavigatorState, 'params' | 'modifiers'> {
}

export interface ChangeLocationResult {
  /**
   * States how much state index changed
   */
  delta: number;

  /**
   * Final state found when state change ended
   */
  state: NavigatorState;
}

/**
 * List of options required to call emitStateChanged
 */
export interface EmitEventsOptions {
  state?: {
    currentIndex?: number;
    previous?: NavigatorState | null;
    previousIndex: number;
  };
  history?: {
    previous: NavigatorState[];
  };
}

export interface SilentOption {
  /**
   * Should replace be silent. It means, no event listeners will be called
   * @default false
   */
  silent?: boolean;
}

export interface PushStateOptions extends SilentOption {
  /**
   * Position index where state should be inserted
   * @default Current index
   */
  index?: number;

  /**
   * Should all states after passed index be dropped
   * @default false
   */
  drop?: boolean;
}

export interface ReplaceLocationOptions extends SilentOption {
  /**
   * Position index where state should be replaced
   * @default Current index
   */
  index?: number;
}

export interface GoOptions extends SilentOption {
}

export interface INavigator {
  /**
   * Current state index
   */
  index: number;

  /**
   * Current state
   */
  state: NavigatorState;

  /**
   * Locations stack
   */
  history: NavigatorState[];

  /**
   * Pushes new state on specified index
   * @param state
   * @param {PushStateOptions} options
   */
  pushState(
    state: NavigatorState,
    options?: PushStateOptions,
  ): void;

  /**
   * Replaces current state with new one
   * @param state
   * @param {ReplaceLocationOptions} options
   */
  replaceState(
    state: NavigatorState,
    options?: ReplaceLocationOptions,
  ): void;

  /**
   * Goes through stack and reassigns current state. Returns
   * navigation change results
   * @param {number} delta
   * @param {GoOptions} options
   * @returns {ChangeLocationResult}
   */
  go(delta: number, options?: GoOptions): ChangeLocationResult;

  /**
   * Goes to state on specified index
   * @param {number} index
   * @param {GoOptions} options
   * @returns {ChangeLocationResult}
   */
  goTo(index: number, options?: GoOptions): ChangeLocationResult;

  /**
   * Sets initial values for navigator
   * @param state
   * @param history
   */
  init(state: NavigatorState, history: NavigatorState[]): void;

  /**
   * Adds listener for event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  on<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ): void;

  /**
   * Removes listener from event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  off<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ): void;
}
