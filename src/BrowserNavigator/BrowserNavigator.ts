import {Navigator} from '../Navigator';
import {
  EventListenerFunc,
  EventType,
  NavigatorLocationType,
  SetLocationOptions,
} from '../types';
import {
  parseSegue,
  createLogger, createSegue,
} from '../utils';
import {
  BrowserHistoryState,
  BrowserNavigatorConstructorProps, BrowserNavigatorInitOptions,
} from './types';
import {isBrowserState} from './utils';

export class BrowserNavigator {
  private readonly navigator: Navigator;
  private hash: string | null = null;
  private originalPushState = window.history.pushState.bind(window.history);
  private originalReplaceState = window.history.replaceState
    .bind(window.history);

  /**
   * Logs message into console
   */
  private readonly log: (...messages: any[]) => void;

  constructor(props: BrowserNavigatorConstructorProps = {}) {
    const {log = false} = props;

    this.navigator = new Navigator(props);
    this.log = log ? createLogger('BrowserNavigator') : () => {
    };
    this.log('Instance created');
  }

  /**
   * Event listener which watches for popstate event and calls Navigator
   * location update
   */
  private onPopState = (e: PopStateEvent) => {
    const prevHash = this.hash;
    this.hash = window.location.hash;

    // If current location already has correct state, it means, it was added
    // by navigator
    if (isBrowserState(e.state)) {
      // We have to calculate delta to determine which direction we should
      // choose
      const delta = e.state.navigator.locationIndex -
        this.navigator.locationIndex;

      // Move only in distance changed
      if (delta !== 0) {
        // Update navigator state and get, how really much distance changed
        const {delta: navigatorDelta} = this.navigator.go(delta);

        // Calculate how many more steps we have to do
        const additionalDelta = navigatorDelta - delta;

        // In case, more steps required, do them
        if (additionalDelta !== 0) {
          this.go(additionalDelta);
        }
      }

      return;
    }

    // If state is incorrect, it means, this location is new for this navigator
    // Try parsing it
    const location = parseSegue(this.hash);

    // In case, location cannot be extracted, prevent routing and throw error
    if (location === null) {
      this.back();
      throw new Error('Unable to extract location from popstate event');
    }

    // In case, prev segue is equal to current one, browser will not push
    // new history item and we are doing it instead of him
    if (prevHash === this.hash) {
      return this.pushLocation(location);
    }

    // Otherwise, location was pushed natively. So, we push it into navigator
    // and replace browser history state
    const {
      location: parsedLocation, delta,
    } = this.navigator.pushLocation(location);

    this.originalReplaceState(
      this.createHistoryState(
        e.state,
        location.modifiers?.includes('back')
          ? this.navigator.locationIndex - delta
          : this.navigator.locationIndex,
      ),
      '',
      createSegue(parsedLocation),
    );

    if (delta < 0) {
      this.go(delta);
    }
  };

  /**
   * Creates state for browser's history
   * @param data
   * @param locationIndex
   * @param locationsStack
   * @returns {BrowserHistoryState}
   */
  private createHistoryState(
    data: any = null,
    locationIndex = this.navigator.locationIndex,
    locationsStack = this.navigator.locationsStack,
  ): BrowserHistoryState {
    return {
      state: data,
      navigator: {locationIndex, locationsStack},
    };
  }

  /**
   * Prepares location and uses original window's pushState method
   * @param {NavigatorLocationType} location
   * @param data
   * @param {SetLocationOptions} options
   */
  private pushState(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
    data: any = null,
  ) {
    // Save navigator location index in case, location
    const {
      location: parsedLocation, delta,
    } = this.navigator.pushLocation(location, options);

    // Call original pushState
    this.originalPushState(
      this.createHistoryState(
        data,
        location.modifiers?.includes('back')
          // If it was back location, we should get location index of inserted
          // skip location
          ? this.navigator.locationIndex - delta
          : this.navigator.locationIndex,
      ),
      '',
      createSegue(parsedLocation),
    );

    // If it was back location we should go back. We do subtract 1 more because
    // previously, new state was added
    if (delta < 0) {
      this.go(delta - 1);
    }
  }

  /**
   * Prepares location and uses original window's replaceState method
   * @param {NavigatorLocationType} location
   * @param {SetLocationOptions} options
   * @param data
   */
  private replaceState(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
    data: any = null,
  ) {
    // Save navigator location index in case, location
    const {
      location: parsedLocation, delta,
    } = this.navigator.replaceLocation(location, options);

    // Call original replaceState
    this.originalReplaceState(
      this.createHistoryState(
        data,
        location.modifiers?.includes('back')
          // If it was back location, we should get location index of inserted
          // skip location
          ? this.navigator.locationIndex - delta
          : this.navigator.locationIndex,
      ),
      '',
      createSegue(parsedLocation),
    );

    // If it was back location we should go back
    if (delta < 0) {
      this.go(delta);
    }
  }

  /**
   * Returns current location. Read-only property
   */
  get location() {
    return this.navigator.location;
  }

  /**
   * Returns current location index
   * @returns {number}
   */
  get locationIndex() {
    return this.navigator.locationIndex;
  }

  /**
   * Returns current history
   * @returns {NavigatorCompleteLocationType[]}
   */
  get history() {
    return this.navigator.locationsStack;
  }

  /**
   * Pushes new location adding it to locations stack
   * @param {NavigatorLocationType} location
   * @param {SetLocationOptions} options
   */
  pushLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ) {
    this.pushState(location, options);
  }

  /**
   * Replaces current location with new one
   * @param {NavigatorLocationType} location
   * @param {SetLocationOptions} options
   */
  replaceLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ) {
    this.replaceState(location, options);
  }

  /**
   * Overrides history functions and adds event listener to popstate event
   */
  mount() {
    // Override pushState and fulfill with navigators data
    window.history.pushState = (
      data: any,
      title: string,
      url?: string | null,
    ) => {
      const parsedLocation = parseSegue(url || '');

      if (parsedLocation === null) {
        throw new Error(
          'Unable to extract location from passed url to pushState',
        );
      }
      this.pushState(parsedLocation);
    };

    // Override replaceState and fulfill with navigators data
    window.history.replaceState = (
      data: any,
      title: string,
      url?: string | null,
    ) => {
      const parsedLocation = parseSegue(url || '');

      if (parsedLocation === null) {
        throw new Error(
          'Unable to extract location from passed url to replaceState',
        );
      }
      this.replaceState(parsedLocation);
    };
    window.addEventListener('popstate', this.onPopState);
    this.log('mount() called');
  }

  /**
   * Cancels all history functions rewires and removes event listener
   */
  unmount() {
    window.history.pushState = this.originalPushState;
    window.history.replaceState = this.originalReplaceState;
    window.removeEventListener('popstate', this.onPopState);
    this.log('unmount() called');
  }

  /**
   * Initializes navigator. Adds all required listeners and rewires functions.
   * If options are passed, it will initialize navigator with them. Otherwise
   * will try to do it by himself
   * @param {BrowserNavigatorInitOptions} options
   */
  init(options?: BrowserNavigatorInitOptions) {
    this.mount();

    if (options) {
      this.log('Initialized navigator with options:', options);
      this.navigator.init(options.locationIndex, options.locationsStack);
    }
    // In case, history length is 1, it means, we are currently on the first
    // its item. So then, we should replace current state with new one
    // compatible to navigator
    else if (window.history.length === 1) {
      this.log('Detected empty history. Replaced with root location');
      this.replaceState({modifiers: ['root']}, {silent: true});
    }
  }

  /**
   * Removes last pushed location from routing stack
   * @type {any}
   */
  back = window.history.back.bind(window.history);

  /**
   * Goes forward through routing stack
   * @type {any}
   */
  forward = window.history.forward.bind(window.history);

  /**
   * Goes through routing stack with passed delta
   * @type {any}
   */
  go = window.history.go.bind(window.history);

  /**
   * Adds listener for specified event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  on<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) {
    this.navigator.on(event, listener);
  };

  /**
   * Removes listener from specified event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  off<E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) {
    this.navigator.off(event, listener);
  };
}
