/**
 * List of reserved by navigator location modifiers
 */
export type InternalModifierType =
/**
 * Is used to determine first locations stack element
 */
  'root' |

  /**
   * Makes navigator replace current location
   */
  'replace' |

  /**
   * Makes navigator go to previous location
   */
  'back' |

  /**
   * Makes navigator skip current location next time it is visited
   */
  'skip';

export interface SetLocationOptions {
  /**
   * Should replace be silent. It means, no event listeners will be called
   * @default false
   */
  silent?: boolean;
}
