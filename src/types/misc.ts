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
   * it should pop this location. It is commonly used while creating back
   * segue
   */
  'back' |

  /**
   * Modifier "skip" is recognized by navigator as an indicator that current
   * location should be skipped (or "slided" to next one). So, navigator will
   * slide locations until normal location is found
   */
  'skip' |

  /**
   * Modifier "root" is used to determine first locations stack element
   */
  'root';

/**
 * List of all available types for location modifiers
 */
export type LocationModifierType = TechLocationModifierType | string;
