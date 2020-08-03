import {
  INavigator,
  NavigatorState, SilentOption,
} from '../Navigator';
import {MakePartial, State} from '../types';

export interface InitOptions {
  state: NavigatorState;
  history: NavigatorState[];
}

/**
 * Object, which represents "state" field of Browser History API item
 */
export interface BrowserHistoryState {
  /**
   * Custom passed by user state
   */
  state?: any;

  /**
   * Navigator based properties
   */
  navigator: {
    /**
     * State index
     */
    index: number;

    /**
     * Navigation history
     */
    history: NavigatorState[];
  };
}

export interface BrowserNavigatorState extends State {
}

export interface BrowserNavigatorSimplifiedState
  extends MakePartial<BrowserNavigatorState, 'params'> {
}

export type BrowserNavigatorStateType =
  | BrowserNavigatorState
  | BrowserNavigatorSimplifiedState;

export interface StateActionOptions extends SilentOption {
  /**
   * Should this state be visited only once
   */
  oneTime?: boolean;
}

export interface IBrowserNavigator
  extends Pick<INavigator, 'on' | 'off' | 'state' | 'history' | 'index'> {
  /**
   * Pushes new state to history
   * @param {BrowserNavigatorStateType} state
   * @param {StateActionOptions} options
   */
  pushState(
    state: BrowserNavigatorStateType,
    options?: StateActionOptions,
  ): void;

  /**
   * Replaces current state in history
   * @param {BrowserNavigatorStateType} state
   * @param {StateActionOptions} options
   */
  replaceState(
    state: BrowserNavigatorStateType,
    options?: StateActionOptions,
  ): void;

  /**
   * Initializes navigator
   * @param {InitOptions} options
   */
  init(options?: InitOptions): void;

  /**
   * Overrides history functions and adds event listener to popstate event
   */
  mount(): void;

  /**
   * Cancels all history functions rewires and removes event listener
   */
  unmount(): void;

  /**
   * Goes back in history
   */
  back: typeof window.history.back;

  /**
   * Goes forward in history
   */
  forward: typeof window.history.forward;

  /**
   * Goes on specified delta
   */
  go: typeof window.history.go;
}
