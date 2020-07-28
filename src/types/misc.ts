/**
 * List of reserved by navigator location modifiers
 */
export type InternalModifierType =
/**
 * Is used to determine first locations stack element. Can be pushed only along
 * with "replace" modifier.
 * PRIORITY: 1
 */
  'root' |

  /**
   * Makes navigator replace current location.
   * PRIORITY: 2
   */
  'replace' |

  /**
   * Makes navigator go to previous location.
   * PRIORITY: 3
   */
  'back' |

  /**
   * Makes navigator skip current location next time it is visited.
   * PRIORITY: 4
   */
  'skip';

export interface SetLocationOptions {
  /**
   * Should replace be silent. It means, no event listeners will be called
   * @default false
   */
  silent?: boolean;
}
