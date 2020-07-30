import {
  EventListener,
  EventType,
  EventListenerFunc,
  NavigatorLocationType,
  ChangeLocationResult,
  NavigatorCompleteLocationType, SetLocationOptions,
} from '../types';
import {formatLocation, isTechLocation} from '../utils';
import {isEmptyTechLocation} from './utils';
import {EmitEventsOptions} from './types';

/**
 * Class which represents navigation core. Recommended only for creating
 * new navigator
 * @see https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/BrowserNavigator/BrowserNavigator.ts#L18
 */
export class Navigator {
  /**
   * List of bound listeners
   * @type {EventListener[]}
   */
  private listeners: EventListener[] = [];

  /**
   * Locations stack. Represents locations history. First entry should
   * be a location which has modifier "root" to let navigator know this is
   * first entry
   * @type {{modifiers: string[]}[]}
   */
  private _locationsStack: NavigatorCompleteLocationType[] = [{
    modifiers: ['root'],
  }];

  /**
   * Current stack location index
   * @type {number}
   */
  private _locationIndex = 0;

  /**
   * Emits events
   * @param {EmitEventsOptions} options
   */
  private emitEvents(options: EmitEventsOptions) {
    const {location, stack} = options;

    this.listeners.forEach(l => {
      if (l.event === 'location-changed') {
        if (location) {
          const {
            currentLocation, currentLocationIndex, prevLocation,
            prevLocationIndex,
          } = location;

          l.listener(
            currentLocation || this._locationsStack[currentLocationIndex],
            currentLocationIndex,
            prevLocation || this._locationsStack[prevLocationIndex],
            prevLocationIndex,
          );
        }
      } else if (l.event === 'stack-changed') {
        if (stack) {
          const {currentStack, prevStack} = stack;

          l.listener(currentStack, prevStack);
        }
      } else if (l.event === 'state-changed') {
        if (!stack && !location) {
          return;
        }
        // const {currentStack, prevStack} = stack;
        // const {
        //   currentLocation, currentLocationIndex, prevLocation,
        //   prevLocationIndex,
        // } = location;

        l.listener({
          stack, location
        });
      }
    });
  }

  /**
   * Inserts location on current position, removing each location
   * after it. Works the same as browser history state push
   * @param {NavigatorCompleteLocationType} location
   * @param options
   */
  pushLocation(
    location: NavigatorCompleteLocationType,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    const formattedLocation = formatLocation(location);
    const {modifiers} = formattedLocation;

    if (isEmptyTechLocation(formattedLocation)) {
      throw new Error('Unable to push empty tech location');
    }

    if (modifiers.includes('root')) {
      throw new Error('Root location push is forbidden');
    }

    // Increase location index, due to new location was pushed
    const prevLocationIndex = this._locationIndex;
    this._locationIndex++;

    // Take all locations before current one including it and append new 
    // location
    const prevStack = this._locationsStack;
    this._locationsStack = [
      ...this._locationsStack.slice(0, this._locationIndex),
      formattedLocation,
    ];

    if (!options.silent) {
      this.emitEvents({
        location: {
          currentLocationIndex: this._locationIndex,
          prevLocationIndex,
        },
        stack: {
          prevStack,
          currentStack: this._locationsStack,
        },
      });
    }

    return {delta: 1, location: formattedLocation};
  }

  /**
   * Pushes location with "back" modifier
   * @param {NavigatorCompleteLocationType} location
   * @param {SetLocationOptions} options
   * @returns {ChangeLocationResult}
   */
  pushBackLocation(
    location: NavigatorCompleteLocationType,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    this.pushLocation({modifiers: ['skip']}, {silent: true});
    return this.go(-2, options);
  }

  /**
   * Replaces last added location
   * @param {NavigatorLocationType} location
   * @param {SetLocationOptions} options
   */
  replaceLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    const formattedLocation = formatLocation(location);
    const {modifiers} = formattedLocation;

    if (isEmptyTechLocation(formattedLocation)) {
      throw new Error('Unable to replace current location with empty one');
    }

    if (modifiers.includes('root') && this._locationIndex !== 0) {
      throw new Error(
        'Unable to replace current location because "root" modifier was ' +
        'passed and current location is not first in stack',
      );
    }

    const prevLocation = this._locationsStack[this._locationIndex];
    this._locationsStack[this._locationIndex] = formattedLocation;

    if (!options.silent) {
      this.emitEvents({
        location: {
          prevLocationIndex: this._locationIndex,
          prevLocation,
          currentLocationIndex: this._locationIndex,
        },
      });
    }

    return {delta: 0, location: formattedLocation};
  };

  /**
   * Processes new location
   * @param {NavigatorLocationType} location
   * @param options
   */
  processLocation(
    location: NavigatorLocationType,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    const formattedLocation = formatLocation(location);
    const {modifiers} = formattedLocation;

    // In case, we met tech location where there are no modifiers, we should
    // throw an error
    if (isTechLocation(location) && modifiers.length === 0) {
      throw new Error('pushLocation received empty location');
    }

    if (modifiers.includes('replace')) {
      return this.replaceLocation(formattedLocation, options);
    }

    if (modifiers.includes('back')) {
      return this.pushBackLocation(formattedLocation, options);
    }

    return this.pushLocation(formattedLocation, options);
  };

  /**
   * Returns current location index
   * @returns {number}
   */
  get locationIndex() {
    return this._locationIndex;
  }

  /**
   * Returns current locations stack
   * @returns {number}
   */
  get locationsStack() {
    return this._locationsStack;
  }

  /**
   * Returns current location
   * @returns {NavigatorCompleteLocationType}
   */
  get location(): NavigatorCompleteLocationType {
    return this._locationsStack[this._locationIndex];
  }

  /**
   * Goes through stack and reassigns current location. Returns
   * navigation change results
   * @param {number} delta
   * @param {SetLocationOptions} options
   * @returns {ChangeLocationResult}
   */
  go(
    delta: number,
    options: SetLocationOptions = {},
  ): ChangeLocationResult {
    const {_locationIndex, _locationsStack} = this;
    let nextIndex = _locationIndex + delta;

    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= _locationsStack.length) {
      nextIndex = _locationsStack.length - 1;
    }

    if (nextIndex === _locationIndex) {
      return {delta: 0, location: this.location};
    }

    const direction = delta > 0 ? 'forward' : 'backward';

    // We have a case when nextIndex refers to location which should be
    // slided (has "skip" modifier). So, we have to slide until non-slideable
    // location is found. In case, it cannot be found, we should go the
    // opposite direction from nextIndex
    const location = _locationsStack[nextIndex];

    if (location.modifiers.includes('skip')) {
      const testStack = direction === 'forward'
        ? [
          ..._locationsStack.slice(nextIndex + 1),
          ..._locationsStack
            .slice(_locationIndex + 1, nextIndex)
            .reverse(),
        ]
        : [
          ..._locationsStack.slice(0, nextIndex).reverse(),
          ..._locationsStack.slice(nextIndex + 1, this._locationIndex),
        ];

      const compatibleLocation = testStack.find(l => {
        return !l.modifiers.includes('skip');
      });

      nextIndex = !compatibleLocation
        ? _locationIndex
        : _locationsStack.indexOf(compatibleLocation);
    }

    if (nextIndex !== _locationIndex) {
      this._locationIndex = nextIndex;

      if (!options.silent) {
        this.emitEvents({
          location: {
            currentLocationIndex: this._locationIndex,
            prevLocationIndex: _locationIndex,
          },
        });
      }

      return {delta: nextIndex - _locationIndex, location: this.location};
    }

    return {delta: 0, location: this.location};
  }

  /**
   * Sets initial values for navigator
   */
  init(
    index: number,
    locationsStack: NavigatorCompleteLocationType[],
  ) {
    if (index < 0 || locationsStack.length <= index) {
      throw new Error('Invalid index was passed (out of bounds)');
    }
    const [firstLocation] = locationsStack;
    const hasRootModifier = firstLocation.modifiers.includes('root');

    if (!hasRootModifier) {
      throw new Error(
        'Unable to initialize locations stack where the first location ' +
        'has no "root" modifier. Probably, stack is corrupted',
      );
    }

    if (firstLocation.modifiers.includes('skip')) {
      throw new Error(
        'Unable to initialize locations stack where root location ' +
        'contains forbidden modifiers. Probably, this location was created ' +
        'not by Navigator',
      );
    }

    // Reassign internal data
    const prevLocationIndex = this._locationIndex;
    const prevLocationsStack = this._locationsStack;
    this._locationIndex = index;
    this._locationsStack = locationsStack;

    // Emit events
    this.emitEvents({
      location: {
        currentLocationIndex: this._locationIndex,
        prevLocationIndex,
        prevLocation: prevLocationsStack[prevLocationIndex],
      },
      stack: {
        currentStack: this._locationsStack,
        prevStack: prevLocationsStack,
      },
    });
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
      return !(l.event === event && l.listener === listener);
    });
  };
}
