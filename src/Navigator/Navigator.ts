import {
  EmitEventsOptions,
  INavigator,
  EventListener,
  EventType,
  EventListenerFunc,
  PushStateOptions, ReplaceLocationOptions, GoOptions, StateChangedEventParam,
} from './types';
import {NavigatorState} from './types';

/**
 * Class which represents navigation core. Recommended only for creating
 * new navigator class
 * @see https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/BrowserNavigator/BrowserNavigator.ts#L18
 */
export class Navigator implements INavigator {
  /**
   * List of bound listeners
   * @type {any[]}
   * @private
   */
  private listeners: EventListener[] = [];

  /**
   * Locations history
   * @type {any[]}
   * @private
   */
  private _history: NavigatorState[] = [];

  /**
   * Current state
   * @type {NavigatorState | null}
   * @private
   */
  private _state: NavigatorState | null = null;

  /**
   * Emits all bound events
   * @private
   * @param {EmitEventsOptions} options
   */
  private emitEvents(options: EmitEventsOptions) {
    const {history, state} = options;

    this.listeners.forEach(l => {
      if (l.event === 'change') {
        if (!history && !state) {
          return;
        }
        let formattedState: StateChangedEventParam['state'] | null = null;

        if (state) {
          const {
            currentIndex = this.index, previous, previousIndex,
          } = state;

          formattedState = {
            current: this._history[currentIndex],
            currentIndex,
            previous: previous || this._history[previousIndex],
            previousIndex,
          };
        }

        l.listener({
          history: history
            ? {...history, current: this._history}
            : undefined,
          state: formattedState || undefined,
        });
      }
    });
  }

  /**
   * Checks if index is in bounds. In case, its not, throws an error
   * @param {number} index
   * @param includeRight
   */
  private validateIndex(index: number, includeRight = false) {
    const rightModifier = includeRight ? 1 : 0;

    if (index < 0 || index >= (this._history.length + rightModifier)) {
      throw new Error('Location index is out of bounds');
    }
  }

  get index() {
    if (!this._state) {
      return -1;
    }
    return this._history.indexOf(this._state);
  }

  get history() {
    return this._history;
  }

  get state() {
    if (!this._state) {
      throw new Error(
        'Unable to get state due to Navigator\'s history is empty',
      );
    }
    return this._state;
  }

  pushState(state: NavigatorState, options: PushStateOptions = {}) {
    const previousIndex = this.index;
    const {drop, silent, index = previousIndex + 1} = options;
    this.validateIndex(index, true);

    // Update state
    this._state = state;

    // Save prev history
    const prevHistory = this.history;

    // If drop is required, drop states after inserted one
    if (drop) {
      this._history = [...this._history.slice(0, index), state];
    }
    // Otherwise, just insert
    else {
      this._history.splice(index, 0, state);
    }

    if (!silent) {
      this.emitEvents({
        state: {previousIndex},
        history: {previous: prevHistory},
      });
    }
  };

  replaceState(state: NavigatorState, options: ReplaceLocationOptions = {}) {
    const {index = this.index, silent} = options;
    this.validateIndex(index);

    const prevState = this._history[index];
    this._history[index] = state;

    if (!silent) {
      this.emitEvents({state: {previousIndex: index, previous: prevState}});
    }
  };

  go(delta: number, options: GoOptions = {}) {
    const {silent} = options;
    const previousIndex = this.index;
    let nextIndex = previousIndex + delta;
    nextIndex = nextIndex < 0
      ? 0
      : (nextIndex >= this._history.length
        ? this._history.length
        : nextIndex);

    if (nextIndex === previousIndex) {
      return {delta: 0, state: this.state};
    }
    this._state = this._history[nextIndex];

    if (!silent) {
      this.emitEvents({state: {previousIndex}});
    }

    return {delta: nextIndex - previousIndex, state: this._state};
  }

  goTo(index: number, options?: GoOptions) {
    return this.go(index - this.index, options);
  }

  init(state: NavigatorState, history: NavigatorState[]) {
    if (!history.includes(state)) {
      throw new Error('History does not include passed state');
    }
    // Reassign internal data
    const previousIndex = this.index;
    const prevHistory = this._history;
    this._state = state;
    this._history = history;

    // Emit events
    this.emitEvents({
      state: {
        previousIndex,
        previous: prevHistory[previousIndex] || null,
      },
      history: {previous: prevHistory},
    });
  }

  on = <E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) => {
    this.listeners.push({event, listener} as any);
  };

  off = <E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) => {
    this.listeners = this.listeners.filter(l => {
      return !(l.event === event && l.listener === listener);
    });
  };
}
