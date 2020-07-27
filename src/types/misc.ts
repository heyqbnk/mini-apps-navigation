/**
 * List of reserved by navigator location modifiers
 */
export type InternalModifierType =
/**
 * Means, that normally, this route could be visited only
 * once. For example, it could be used for application alerts which usually
 * are displayed only once. After being visited, this modifier will be replaced
 * with "skip" modifier
 */
  'shadow' |

  /**
   * Makes navigator go to previous location in stack
   */
  'back' |

  /**
   * Makes navigator replace current location
   */
  'replace' |

  /**
   * Makes navigator go to next location
   */
  'forward' |

  /**
   * Makes navigator skip current location
   */
  'skip' |

  /**
   * Is used to determine first locations stack element. Cannot
   * be pushed. Cannot be used in replacement if currently navigator is not
   * on the first location on stack
   */
  'root';

/**
 * List of modifiers which could be used while pushing location
 */
export type PushableModifierType = Extract<InternalModifierType,
  'shadow' | 'back' | 'replace' | 'forward' | 'skip'>;

/**
 * List of modifiers which could be used while replacing location
 */
export type ReplaceableModifierType = InternalModifierType;

export interface SetLocationOptions {
  /**
   * Should replace be silent. It means, no event listeners will be called
   * @default false
   */
  silent?: boolean;
}
