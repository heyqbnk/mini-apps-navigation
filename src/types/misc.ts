/**
 * List of reserved by navigator location modifiers
 */
export type TechLocationModifierType =
/**
 * Modifier "shadow" means, that normally, this route could be visited only
 * once. For example, it could be used for application alerts which usually
 * are displayed only once. After being visited, this modifier will be replaced
 * with "skip" modifier
 */
  'shadow' |

  /**
   * Modifier "back" is recognized by navigator as an indicator that currently
   * it should pop current location. It is commonly used while creating back
   * segue
   */
  'back' |

  /**
   * Modifier "replace" is recognized by navigator as an indicator that
   * currently it should replace current location. It is commonly used while
   * creating replace segue
   */
  'replace' |

  /**
   * Modifier "skip" is recognized by navigator as an indicator that current
   * location should be skipped (or "slided" to next one). So, navigator will
   * slide locations until normal location is found
   */
  'skip' |

  /**
   * Modifier "root" is used to determine first locations stack element. Cannot
   * be pushed in case current location index is not 0. Additionally, no
   * any other location instead of location on first place could have this
   * modifier
   */
  'root';

/**
 * List of all available types for location modifiers
 */
export type LocationModifierType = TechLocationModifierType | string;

export interface SetLocationOptions {
  /**
   * Should replace be silent. It means, no event listeners will be called
   * @default false
   */
  silent?: boolean;
}
