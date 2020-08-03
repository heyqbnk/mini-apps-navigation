import {Maybe} from './utils';
import {ParsedUrlQuery} from 'querystring';

export interface State {
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
}
