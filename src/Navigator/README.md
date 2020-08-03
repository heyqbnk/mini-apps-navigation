# Navigator
`Navigator` represents navigation core. It should be used by any custom
router you already have in project. You should know, that this class has no
relation to any of environments. I mean, that this is just a core, so, it 
does not work with something like `window.history` itself. It waits for someone
who could do it for himself. `Navigator` just contains main logic
connected with navigation.

- [Class definition](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/Navigator/Navigator.ts)
- [Events definitions](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/Navigator/types/events.ts)
- [Main types definitions](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/Navigator/types/navigator.ts)

If you are developing application which works with browser history you probably
need [BrowserNavigator](https://github.com/wolframdeus/mini-apps-navigation/tree/master/src/BrowserNavigator/README.md).

# Properties
## `index: number`
Returns current state index in history.

## `state: NavigatorState`
Returns current state. In case, no states were pushed previously, throws an 
error.

## `history: NavigatorState[]`
Returns navigation history.

## `pushState(state: NavigatorState, options?: PushStateOptions}): void`
*Could be called silently. It means, no event listeners will be called*

Pushes new state on specified index. In case, index is not specified, navigator
will insert state on current position

## `replaceState(state: NavigatorState, options?: ReplaceLocationOptions}): void`
*Could be called silently. It means, no event listeners will be called*

Replaces state on specified index. In case, index is not specified, navigator
will take current position

## `go(delta: number, options?: GoOptions): void`
*Could be called silently. It means, no event listeners will be called*

Moves forward or backward on specified delta. In case, delta is out of bounds,
it will be changed to one of bounds values.

## `goTo(index: number, options?: GoOptions): void`
*Could be called silently. It means, no event listeners will be called*

Goes to specified index. In case, delta is out of bounds, it will be changed to 
one of bounds values.

## `init(state: NavigatorState, history: NavigatorState[]): void`
Sets initial values for navigator.

## `on<E extends EventType>(event: E, listener: EventListenerFunc<E>): void`
Adds listener for specified event.

## `off<E extends EventType>(event: E, listener: EventListenerFunc<E>): void`
Removes listener for specified event.
