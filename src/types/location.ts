import {MakePartial, Maybe} from './utils';
import {ParsedUrlQuery} from 'querystring';
import {TechLocationModifierType} from './misc';

export interface NavigatorLocation {
  /**
   * Current view. It is main and required part of location due to application
   * cannot exist without view currently displayed
   */
  view: string;

  /**
   * Currently opened modal
   */
  modal?: Maybe<string>;

  /**
   * Currently opened popup. Terms "modal" and "popup" are separated due to
   * there are cases, when modal and popup are both opened. For example, they
   * could be some usual modal and alert
   */
  popup?: Maybe<string>;

  /**
   * Current location parameters. In Web world, they are query-parameters
   * but renamed to avoid binding to Web
   */
  params: ParsedUrlQuery;

  /**
   * List of modifiers which are applied to current location. Each modifier
   * has its own influence on navigator's behaviour. These modifiers are mostly
   * used by Navigator and has a design character, but you could use them for
   * your own purposes
   */
  modifiers: (TechLocationModifierType | string)[];
}

/**
 * Tech navigator location which has only modifiers
 */
export interface NavigatorTechLocation
  extends Pick<NavigatorLocation, 'modifiers'> {
}

/**
 * List of types that that represents complete location data
 */
export type NavigatorCompleteLocationType =
  | NavigatorLocation
  | NavigatorTechLocation;

/**
 * List of all available navigator locations
 */
export type NavigatorLocationType =
  | NavigatorLocation
  | NavigatorSimplifiedLocation
  | NavigatorTechLocation;

/**
 * Minimal set of required properties for navigator location
 */
export interface NavigatorSimplifiedLocation
  extends MakePartial<NavigatorLocation, 'modifiers' | 'params'> {
}

export interface ChangeLocationResult {
  /**
   * States how much location index was changed
   */
  delta: number;

  /**
   * Final location found when location change ended
   */
  location: NavigatorCompleteLocationType;
}
