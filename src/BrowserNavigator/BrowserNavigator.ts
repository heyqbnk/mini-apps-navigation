import {
  EventListenerFunc,
  EventType,
  Navigator,
  NavigatorSimplifiedState,
  NavigatorState, removeModifiers,
  fulfillState, appendModifiers,
} from '../Navigator';
import {createLink, isBrowserState, parseLink} from './utils';
import {
  BrowserHistoryState, BrowserNavigatorStateType,
  IBrowserNavigator,
  InitOptions, StateActionOptions,
} from './types';
import {BACK_MOD, REPLACE_MOD, SKIP_MOD} from './constants';

export class BrowserNavigator implements IBrowserNavigator {
  private readonly navigator = new Navigator();
  private hash: string | null = null;
  private isMounted = false;
  private originalPushState = window.history.pushState.bind(window.history);
  private originalReplaceState = window.history.replaceState
    .bind(window.history);

  /**
   * Simplified version of original window.history.pushState
   * @param historyState
   * @param state
   * @returns {any}
   * @private
   */
  private _pushState(historyState: any, state: NavigatorState) {
    return this.originalPushState(
      this.createHistoryState(historyState),
      '',
      createLink(state),
    );
  }

  /**
   * Simplified version of original window.history.replaceState
   * @param historyState
   * @param state
   * @returns {any}
   * @private
   */
  private _replaceState(historyState: any, state: NavigatorState) {
    return this.originalReplaceState(
      this.createHistoryState(historyState),
      '',
      createLink(state),
    );
  }

  /**
   * Event listener which watches for popstate event and calls Navigator
   * location update
   * @param {PopStateEvent} e
   * @returns {any}
   */
  private onPopState = (e: PopStateEvent) => {
    const prevHash = this.hash;
    this.hash = window.location.hash;

    // If current location already has correct state, it means, it was added
    // by navigator. So we could get state index and move to it
    if (isBrowserState(e.state)) {
      const nextIndex = e.state.navigator.index;
      const initialDelta = nextIndex - this.index;

      if (initialDelta === 0) {
        return;
      }
      const direction = initialDelta > 0 ? 'forward' : 'backward';

      // We have a case when nextIndex refers to location which should be
      // slided (has "skip" modifier). So, we have to slide until non-slideable
      // location is found. In case, it cannot be found, we should go the
      // opposite direction from nextIndex
      const {index, history} = this.navigator;
      const state = history[nextIndex];
      let delta = initialDelta;

      if (state.modifiers.includes(SKIP_MOD)) {
        const testStack = direction === 'forward'
          ? [
            ...history.slice(nextIndex + 1),
            ...history
              .slice(index + 1, nextIndex)
              .reverse(),
          ]
          : [
            ...history.slice(0, nextIndex).reverse(),
            ...history.slice(nextIndex + 1, index),
          ];

        const compatibleLocation = testStack.find(l => {
          return !l.modifiers.includes(SKIP_MOD);
        });

        delta = compatibleLocation
          ? history.indexOf(compatibleLocation) - index
          : 0;
      }

      if (delta === 0) {
        if (direction === 'forward') {
          return this.back();
        }
        return this.forward();
      }

      this.navigator.go(delta);

      // Calculate how many more steps we have to do
      const additionalDelta = delta - initialDelta;

      // In case, more steps required, do them
      if (additionalDelta !== 0) {
        this.go(additionalDelta);
      }

      return;
    }

    // If state is incorrect, it means, this location is new for this navigator
    // Try parsing it
    const state = parseLink(this.hash);

    // In case, state cannot be extracted, prevent routing and throw error
    if (state === null) {
      this.back();
      throw new Error('Unable to extract state from popstate event');
    }

    const {modifiers} = state;
    const hasBackMod = modifiers.includes(BACK_MOD);
    const hasReplaceMod = modifiers.includes(REPLACE_MOD);

    // In case, prev hash is equal to current one, browser will not push
    // new history item and we are doing actions instead of him
    if (prevHash === this.hash) {
      // If we found a replace modifier, just ignore this event, due to
      // we will replace current state with the same one
      if (hasReplaceMod) {
        return;
      }
      // If back modifier met, just go back
      if (hasBackMod) {
        return this.back();
      }
      // Ot just push new state
      return this.pushState(state);
    }

    if (hasBackMod || hasReplaceMod) {
      const skipState = fulfillState({view: '', modifiers: [SKIP_MOD]});

      this.navigator.pushState(skipState, {drop: true, silent: true});
      this._replaceState(e.state, skipState);

      if (hasBackMod) {
        return this.go(-2);
      }

      // Go to previous location
      this.navigator.go(-1, {silent: true});
      this.navigator.replaceState(
        removeModifiers(state, [REPLACE_MOD]), {silent: true},
      );

      return this.go(-2);
    }

    this.navigator.pushState(state, {drop: true});
    this._replaceState(e.state, state);
  };

  /**
   * Creates state for browser's history
   * @param data
   * @param index
   * @param history
   * @returns {BrowserHistoryState}
   */
  private createHistoryState(
    data: any = null,
    index = this.navigator.index,
    history = this.navigator.history,
  ): BrowserHistoryState {
    return {state: data, navigator: {index, history}};
  }

  /**
   * Returns handler for window.history.pushState or window.history.replaceState
   * @param {(state: (NavigatorState | NavigatorSimplifiedState)) => void} f
   * @returns {(data: any, title: string, url?: (string | null)) => void}
   */
  private getHistoryMethodHandler = (
    f: (state: NavigatorState | NavigatorSimplifiedState) => void,
  ) => {
    return (data: any, title: string, url?: string | null) => {
      if (!url) {
        throw new Error('Unable to process empty url');
      }
      const state = parseLink(url);

      if (state === null) {
        throw new Error('Unable to extract state from passed url');
      }
      f.call(this, state);
    };
  };

  /**
   * Prepares state and uses original window's pushState method
   * @param {BrowserNavigatorStateType} state
   * @param {StateActionOptions} options
   */
  pushState(
    state: BrowserNavigatorStateType,
    options: StateActionOptions = {},
  ) {
    const navigatorState = fulfillState(state);
    const formattedState = options.oneTime
      ? appendModifiers(navigatorState, [SKIP_MOD])
      : navigatorState;
    this.navigator.pushState(formattedState, {...options, drop: true});
    this._pushState(null, formattedState);
  }

  /**
   * Prepares state and uses original window's replaceState method
   * @param {BrowserNavigatorStateType} state
   * @param {StateActionOptions} options
   */
  replaceState(
    state: BrowserNavigatorStateType,
    options: StateActionOptions = {},
  ) {
    const navigatorState = fulfillState(state);
    const formattedState = options.oneTime
      ? appendModifiers(navigatorState, [SKIP_MOD])
      : navigatorState;
    this.navigator.replaceState(formattedState, options);
    this._replaceState(null, formattedState);
  }

  mount() {
    if (this.isMounted) {
      return;
    }
    window.history.pushState = this.getHistoryMethodHandler(this.pushState);
    window.history.replaceState = this.getHistoryMethodHandler(this.replaceState);
    window.addEventListener('popstate', this.onPopState);
    this.isMounted = true;
  }

  unmount() {
    if (!this.isMounted) {
      return;
    }
    window.history.pushState = this.originalPushState;
    window.history.replaceState = this.originalReplaceState;
    window.removeEventListener('popstate', this.onPopState);
    this.isMounted = false;
  }

  init(options?: InitOptions) {
    this.mount();
    let state: NavigatorState | null = null;
    let history: NavigatorState[] | null = null;

    if (options) {
      state = options.state;
      history = options.history;
    }
    // In case, browser's history length is 1, it means, we are currently on
    // the first its item. So then, we should replace current state with new one
    // compatible to navigator
    else if (window.history.length === 1) {
      state = {
        view: '',
        params: {},
        modifiers: ['root'],
      };
      history = [state];
    }

    if (state && history) {
      this.navigator.init(state, history);
      this._replaceState(null, state);
    }
  }

  get state() {
    return this.navigator.state;
  }

  get index() {
    return this.navigator.index;
  }

  get history() {
    return this.navigator.history;
  }

  back = window.history.back.bind(window.history);

  forward = window.history.forward.bind(window.history);

  go = window.history.go.bind(window.history);

  on<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) {
    this.navigator.on(event, listener);
  };

  off<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) {
    this.navigator.off(event, listener);
  };
}
