# BrowserNavigator
`BrowserNavigator` is adopted for browser and works with `window.history`. It
extends some `Navigator` methods like `on`, `off` and `go` with some extra 
lines of code, which are written mostly to interact with browser's history.

It rewires such functions as `window.history.pushState` and 
`window.history.replaceState`, so then, each history item has stable state,
which contains current state index and navigation history.

- [Class definition](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/BrowserNavigator/BrowserNavigator.ts)
- [Other type definitions](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/BrowserNavigator/types.ts)

## Properties
### `pushState(state: BrowserNavigatorStateType, options?: StateActionOptions): void`
Prepares state, pushes state via Navigator and uses original window's pushState
method.

### `replaceState(state: BrowserNavigatorStateType, options?: StateActionOptions): void`
Prepares state, replaces state via Navigator and uses original window's
replaceState method.

### `mount(): void`
Overrides history functions and adds event listener to popstate event.

### `unmount(): void`
Cancels all history functions rewires and removes event listener.

### `back(): void`
Calls `window.history.back()`.

### `forward(): void`
Calls `window.history.forward()`.

### `go(delta?: number): void`
Calls `window.history.go(delta)`.

## Properties picked from `Navigator`
These properties are: `on`, `off`, `state`, `history` and `index`. To
learn more, follow this [link](https://github.com/wolframdeus/mini-apps-navigation/tree/master/src/Navigator/README.md#Properties).
