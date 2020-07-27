import {INavigator, Navigator, SetLocationOptions} from '../Navigator';
import {
  EventListenerFunc,
  EventType,
  NavigatorLocationType,
} from '../types';
import {
  parseSegue,
  createSegue,
} from '../utils';
import {
  BrowserHistoryState,
  BrowserNavigatorConstructorProps,
  BrowserNavigatorModeType,
} from './types';
import {isBrowserState} from './utils';

export class BrowserNavigator implements INavigator {
  private readonly logging: boolean;
  private readonly mode: BrowserNavigatorModeType;
  private readonly navigator: Navigator;
  private lastPopstateSegue: string | null = null;
  private originalPushState = window.history.pushState.bind(window.history);
  private originalReplaceState = window.history.replaceState
    .bind(window.history);

  constructor(props: BrowserNavigatorConstructorProps = {}) {
    const {mode = 'hash', log = false} = props;

    this.navigator = new Navigator(props);
    this.mode = mode;
    this.logging = log;
  }

  /**
   * Event listener which watches for popstate event and calls Navigator
   * location update
   */
  private onPopState = (e: PopStateEvent) => {
    const prevSegue = this.lastPopstateSegue;
    const segue = this.mode === 'default'
      ? window.location.pathname
      : window.location.hash;

    this.lastPopstateSegue = segue;

    // Skip the same locations. This problem occurs when user clicks
    // one link several times. History does not change but event is triggered
    if (prevSegue === segue) {
      return;
    }

    if (isBrowserState(e.state)) {
      // When popstate event is called, it means, browser create history move.
      // So, we have to detect which direction user chose and how far he
      // went
      const delta = e.state.navigator.locationIndex -
        this.navigator.locationIndex;

      // Synchronize user move with navigator
      const {delta: navigatorDelta} = this.navigator.go(delta);
      const additionalDelta = navigatorDelta - delta;

      if (additionalDelta !== 0) {
        this.go(additionalDelta);
      }
    } else {
      const location = parseSegue(segue);

      if (location === null) {
        throw new Error('Unable to extract location from popstate event');
      }
      this.navigator.pushLocation(location);
      this.originalReplaceState(
        this.createHistoryState(e.state),
        '',
        this.createSegue(location),
      );
    }
  };

  /**
   * Creates state for browser's history
   * @param data
   * @returns {BrowserHistoryState}
   */
  private createHistoryState(data: any = null): BrowserHistoryState {
    return {
      state: data,
      navigator: {
        locationIndex: this.navigator.locationIndex,
        locationsStack: this.navigator.locationsStack,
      },
    };
  }

  /**
   * Logs message into console
   * @param messages
   */
  private log(...messages: any[]) {
    if (this.logging) {
      console.log('%c[BrowserNavigator]:', 'font-weight: bold;', ...messages);
    }
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
    const {
      location: parsedLocation, delta,
    } = this.navigator.pushLocation(location, options);

    // In case, location push was successful, we can original pushState
    if (delta > 0) {
      this.originalPushState(
        this.createHistoryState(data),
        '',
        this.createSegue(parsedLocation),
      );
    }
    // Otherwise, if we returned in history, just call "go" 
    else if (delta < 0) {
      window.history.go(delta);
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
    this.navigator.replaceLocation(location, options);
    this.originalReplaceState(
      this.createHistoryState(data),
      '',
      this.createSegue(location),
    );
  }

  get location() {
    return this.navigator.getLocation();
  }

  get history() {
    return this.navigator.locationsStack;
  }

  pushLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ) {
    this.pushState(location, options);
  }

  replaceLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ) {
    this.replaceState(location, options);
  }

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

    // Add event listener watching for history changes
    window.addEventListener('popstate', this.onPopState);

    // Derive initial state from current browser state
    if (isBrowserState(window.history.state)) {
      this.log(
        'Detected initial state while mounting:',
        window.history.state.navigator,
      );
      const {locationIndex, locationsStack} = window.history.state.navigator;
      this.navigator.init(locationIndex, locationsStack);
    }
    // In case, history length is 1, it means, we are currently on the first
    // its item. So then, we should replace current state with new one
    // compatible to navigator
    else if (window.history.length === 1) {
      this.log('Detected empty history. Replaced with root location');
      this.replaceState({modifiers: ['root']}, {silent: true});
    }

    this.log(
      'Mount completed. Stack:', this.navigator.locationsStack,
      'Location:', this.location,
    );
  }

  unmount() {
    window.removeEventListener('popstate', this.onPopState);
    window.history.pushState = this.originalPushState;
    window.history.replaceState = this.originalReplaceState;
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

  createSegue(location: NavigatorLocationType): string {
    return (this.mode === 'default' ? '' : '#') + createSegue(location);
  }
}
