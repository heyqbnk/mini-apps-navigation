[npm-badge]: https://img.shields.io/npm/v/@mini-apps/navigation.svg
[npm-link]: https://npmjs.com/package/@mini-apps/navigation

# Mini Apps Navigation [![NPM][npm-badge]][npm-link]
A package to organize navigation in Mini Apps applications

## Installation
```bash
yarn add @mini-apps/navigation
```
or
```bash
npm i @mini-apps/navigation
``` 

## Description
This package was created with aim on mobile applications. So, the main terms
which are used in this library are `view`, `modal`, `popup` etc. You
should not wait for any Web based terms used in context of `Navigator`. Here,
I tried to recreate a logic used in native mobile applications and waiting
for other developers contribution.

## Glossary
### State
`State` is like the one of the most often met terms in this project. It
is described with `view`, `modal`, `popup`, `params` and `modifiers`. 
Properties `modal` and `popup` are not required, but `view` is. Normally,
there cannot be any situation when view is unknown, we should always show
something, so that is the reason why `view` is required. `params` is passed 
custom dictionary.

### Modifier
`Modifier` is a modification applied to state. It can be any string and can
be used for any purposes.

## Classes
- [`Navigator` reference](https://github.com/wolframdeus/mini-apps-navigation/tree/master/src/Navigator/README.md)
- [`BrowserNavigator` reference](https://github.com/wolframdeus/mini-apps-navigation/tree/master/src/BrowserNavigator/README.md)

### BrowserNavigator

`BrowserNavigator` is adopted for browser and works with `window.history`. It
extends some `Navigator` methods like `on`, `off` and `go` with some extra 
lines of code, which are written mostly to interact with browser's history.

It rewires such functions as `window.history.pushState` and 
`window.history.replaceState`, so then, each history item has stable state,
which contains current location index and location history.

#### Usage
##### Creating instance
```typescript
import {BrowserNavigator} from '@mini-apps/navigation';

const navigator = new BrowserNavigator();
```

##### Initialization
When `window.history` becomes available, it is required to call navigator
init, to make him override `window.history.pushState` and 
`window.history.replaceState` and add event listener to window's popstate event.

```typescript
navigator.init();
```

To cancel overrides and remove event listener:

```typescript
navigator.unmount();
```

##### Initial navigator state

To make navigator initialization easier, there is a function 
`extractBrowserNavigatorSettings` which returns initial settings for navigator
if it is possible.

```typescript
import {extractBrowserNavigatorSettings} from '@mini-apps/navigation';

// Extract settings from browsers history
const navigatorSettings = extractBrowserNavigatorSettings();

// Initialize with received settings
navigator.init(navigatorSettings ? navigatorSettings : undefined);
```

If first parameter in `init` was not passed, navigator watches if current
history length is equal to 1, it understands that previously, it
was not mounted here before. It replaces current location with
modifier `root` which indicates about root location.

##### Popstate listener
When `mount()` is called, navigator adds its own listener, which watches
for location changes and automatically updates internal location. The logic
is rather simple - it tries to extract location info from history item
state and correctly updates navigator. But in case of fail, it will recognize 
pushed location as new one. So, it will try to parse it and push to navigator. 
Otherwise, an error will be thrown.
