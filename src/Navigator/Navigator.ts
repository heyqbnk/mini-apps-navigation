import {
  EventListener,
  EventType,
  EventListenerFunc,
  NavigatorLocationType,
  ChangeLocationResult,
  NavigatorCompleteLocationType,
} from '../types';
import {
  formatLocation,
  isTechLocation,
} from '../utils';
import {
  NavigatorConstructorProps,
  SetLocationOptions,
} from './types';

/**
 * Abstract class which represents navigator which controls current application
 * routing state
 */
export class Navigator {
  protected readonly logging: boolean;

  /**
   * List of bound listeners
   * @type {any[]}
   */
  private listeners: EventListener[] = [];

  /**
   * Locations stack
   * @type {any[]}
   */
  public locationsStack: NavigatorCompleteLocationType[] = [{
    modifiers: ['root'],
  }];

  /**
   * Current stack location index
   * @type {number}
   */
  public locationIndex = 0;

  constructor(props: NavigatorConstructorProps = {}) {
    const {log = false} = props;
    this.logging = log;
    this.log('Instance created');
  }

  /**
   * Logs message into console
   * @param messages
   */
  private log(...messages: any[]) {
    if (this.logging) {
      console.log('%c[Navigator]:', 'font-weight: bold;', ...messages);
    }
  }

  /**
   * Calls listeners which are bound to "location-changed" event
   */
  protected emitLocationChanged() {
    const location = this.getLocation();

    this.listeners.forEach(({event, listener}) => {
      if (event === 'location-changed') {
        listener(location);
      }
    });
    this.log('Emitted location change:', location);
  }

  /**
   * Pushes location to stack on current position, removing every location
   * after
   * @param {NavigatorCompleteLocationType} location
   * @param options
   */
  private pushLocationToStack(
    location: NavigatorCompleteLocationType,
    options: SetLocationOptions = {},
  ) {
    this.locationIndex++;
    this.locationsStack = [
      ...this.locationsStack.slice(0, this.locationIndex),
      formatLocation(location),
    ];

    this.log(
      'Pushed location to stack. Location:', location,
      'Current stack:', this.locationsStack,
    );

    if (!options.silent) {
      this.emitLocationChanged();
    }
  }

  /**
   * Pushes new location to stack and updates current location. Returns delta
   * which states how much location index was changed
   * @param {NavigatorLocationType} location
   * @param options
   */
  pushLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    this.log('Pushing location:', location);
    const formattedLocation = formatLocation(location);
    const {modifiers, ...rest} = formattedLocation;

    // In case, we met tech location where there are no modifiers, we should
    // throw an error
    if (isTechLocation(formattedLocation) && modifiers.length === 0) {
      throw new Error(
        'pushLocation received tech location with no specified modifiers',
      );
    }

    // // In case, we met modifier "back", it means, location is requesting
    // // navigators "back" method. So, we are replacing current location with
    // // "skip" location to prevent going back again when this location met
    // if (modifiers.includes('back')) {
    //   this.pushLocationToStack({modifiers: ['skip']}, {silent: true});
    //   return this.go(-2, options);
    // }

    // In case, we met modifier "back", it means, location is requesting
    // navigators "back" method. So, we are just going back
    if (modifiers.includes('back')) {
      this.log('This location has back modifier. Going back..');
      return this.back(options);
    }

    // In case, shadowed location is passed, we have to replace it with "skip"
    // modifier to avoid getting this location again
    if (modifiers.includes('shadow')) {
      this.log('This location has shadow modifier');

      // Remove shadow modifier
      const filteredModifiers = modifiers.filter(m => m !== 'shadow');

      // Push location with "skip" modifier
      this.pushLocationToStack({
        ...rest,
        modifiers: [...filteredModifiers, 'skip'],
      });
    } else {
      this.log('This location has no special modifiers');
      this.pushLocationToStack(formattedLocation, options);
    }

    return {delta: 1, location: this.getLocation()};
  };

  /**
   * Replaces last added stack location
   * @param {NavigatorLocationType} location
   * @param {SetLocationOptions} options
   */
  replaceLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ) {
    this.log('Replacing location:', location);
    const formattedLocation = formatLocation(location);
    this.locationsStack[this.locationIndex] = formattedLocation;

    if (!options.silent) {
      this.emitLocationChanged();
    }

    this.log('Replaced location', formattedLocation);
  };

  /**
   * Goes through stack and reassigns current location. Returns delta
   * which states how much location index was changed
   * @param {number} delta
   * @param {SetLocationOptions} options
   * @returns {ChangeLocationResult}
   */
  go(
    delta: number,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    this.log('go() called', delta, options);
    const {locationIndex, locationsStack} = this;
    let nextIndex = locationIndex + delta;

    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= locationsStack.length) {
      nextIndex = locationsStack.length - 1;
    }

    if (nextIndex === locationIndex) {
      return {delta: 0, location: this.getLocation()};
    }

    const direction = delta > 0 ? 'forward' : 'backward';

    // We have a case when nextIndex refers to location which should be
    // slided (has "skip" modifier). So, we have to slide until non-slideable
    // location is found. In case, it cannot be found, we should go the
    // opposite direction from nextIndex
    const location = locationsStack[nextIndex];

    if (location.modifiers.includes('skip')) {
      const testStack = direction === 'forward'
        ? [
          ...locationsStack.slice(nextIndex + 1),
          ...locationsStack
            .slice(locationIndex + 1, nextIndex)
            .reverse(),
        ]
        : [
          ...locationsStack.slice(0, nextIndex).reverse(),
          ...locationsStack.slice(nextIndex + 1, this.locationIndex),
        ];

      const compatibleLocation = testStack.find(l => {
        return !l.modifiers.includes('skip');
      });

      nextIndex = !compatibleLocation
        ? locationIndex
        : locationsStack.indexOf(compatibleLocation);
    }

    if (nextIndex !== locationIndex) {
      this.locationIndex = nextIndex;

      if (!options.silent) {
        this.emitLocationChanged();
      }

      return {
        delta: nextIndex - locationIndex,
        location: this.getLocation(),
      };
    }

    return {delta: 0, location: this.getLocation()};
  }

  /**
   * Shortcut for go(-1)
   * @param {SetLocationOptions} options
   * @returns {ChangeLocationResult}
   */
  back(options: SetLocationOptions = {}): ChangeLocationResult {
    this.log('back() called', options);
    return this.go(-1, options);
  }

  /**
   * Shortcut for go(1)
   * @param {SetLocationOptions} options
   * @returns {ChangeLocationResult}
   */
  forward(options: SetLocationOptions = {}): ChangeLocationResult {
    this.log('forward() called', options);
    return this.go(1, options);
  }

  /**
   * Sets initial values for navigator
   */
  init(
    index: number,
    locationsStack: NavigatorCompleteLocationType[],
  ) {
    if (index < 0 || locationsStack.length <= index) {
      throw new Error(
        'Invalid index was passed. It should be an index in locationsStack',
      );
    }
    this.locationIndex = index;
    this.locationsStack = locationsStack;
    this.log('Initialization complete, Arguments:', index, locationsStack);
  }

  /**
   * Returns current location
   * @returns {NavigatorCompleteLocationType}
   */
  getLocation(): NavigatorCompleteLocationType {
    return this.locationsStack[this.locationIndex];
  }

  /**
   * Adds listener for specified event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  on = <E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) => {
    this.listeners.push({event, listener} as any);
    this.log('Added event listener:', event, listener, this.listeners);
  };

  /**
   * Removes listener from specified event
   * @param {E} event
   * @param {EventListenerFunc<E>} listener
   */
  off = <E extends EventType>(
    event: E,
    listener: EventListenerFunc<E>,
  ) => {
    this.listeners = this.listeners.filter(l => {
      return l.event !== event || l.listener !== listener;
    });
    this.log('Removed event listener:', event, listener, this.listeners);
  };
}
