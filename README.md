[npm-badge]: https://img.shields.io/npm/v/@mini-apps/navigation.svg
[npm-link]: https://npmjs.com/package/@mini-apps/navigation

[<img width="134" src="https://vk.com/images/apps/mini_apps/vk_mini_apps_logo.svg">](https://vk.com/services)

# Navigation [![NPM][npm-badge]][npm-link]

Documentation: [RU](https://github.com/wolframdeus/mini-apps-navigation/blob/master/README-ru.md) / [EN](https://github.com/wolframdeus/mini-apps-navigation/blob/master/README.md)

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
which are used in this library are `segue`, `view`, `modal`, `popup` etc. You
should not wait for any Web based terms used in context of `Navigator`. Here,
I tried to recreate a logic used in native mobile applications and waiting
for other developers contribution.

## Glossary
### Location
`Location` is like the one of the most often met terms in this project. It
is described with `view`, `modal`, `popup`, `params` and `modifiers`. 
Properties `modal` and `popup` are not required, but `view` is. Normally,
there cannot be any situation when view is unknown, we should always show
something, so that is the reason why `view` is required. `params` is passed 
custom dictionary.

### TechLocation

`TechLocation`s contains only modifiers and used to execute some special
flow. For example, tech location could be a location with modifier `root`. It
is added by navigator by default to detect first location in stack.

### Modifier
`Modifier` is a modification applied to location (which are URIs in web world). 
Current package reserves some list of modifiers. So, if navigator meets them 
while codeflow, it will behave in a special way.

| Name | Behaviour |
| --- | --- |
| `root` | Indicates that this location is first in stack. Not allowed to replace or pushed |
| `skip` | Makes navigator slide through locations stack. It is something like a gap in history which should be jumped |
| `replace` | Makes navigator replace current location |
| `back` | Makes navigator go back in history |

## Classes

### Navigator
`Navigator` represents navigation core. It should be used by any custom
router you already have in project. You should know, that this class has no
relation to any of environments. I mean, that this is just a core, so, it 
does not work with something like `window.history` itself. It waits for someone
who could do it for himself. `Navigator` just contains hard and main logic
connected with navigation.

If you are developing application which works with browser history you probably
need [BrowserNavigator](#BrowserNavigator).

[Definition](https://github.com/wolframdeus/mini-apps-navigation/blob/master/src/Navigator/Navigator.ts#L22)

#### Usage
##### Creating instance

```typescript
import {Navigator} from '@mini-apps/navigation';

// Create navigator instance
const navigator = new Navigator({
  // Enable logs
  log: true,
});
```

##### Initialization
Initialization is useful when full locations stack is known. So you could
keep it somewhere and pass to navigator

```typescript
const locationIndex = getLastLocationIndexFromCache();
const locationsStack = getLastLocationsStackFromCache();

navigator.init(locationIndex, locationsStack);
```

##### Adding and removing event listeners
```typescript
// Create listener
const listener = location => {
  console.log('New location:', location);
};

// Add listener on location change. It is important to know, that this event
// listener will be called only after calling special methods like
// pushLocation, replaceLocation, go, back and forward
navigator.on('location-changed', listener);

// Will call event listeners
navigator.pushLocation({modifiers: ['back']});

// Will NOT call event listeners
navigator.pushLocation({modifiers: ['back']}, {silent: true});

// Remove event listener
navigator.off('location-changed', listener);
```

##### Make navigator change location
```typescript
// Push new location
navigator.pushLocation({
  view: 'onboarding',
});

// Then open 1-time alert
navigator.pushLocation({
  view: 'onboarding',
  popup: 'my-alert',
  modifiers: ['shadow'],
});

// Then replace current location
navigator.replaceLocation({
  view: 'main',
});

// Return to onboarding
navigator.go(-1);
// or
navigator.back();

// Move forward to onboarding
navigator.forward();
```

### BrowserNavigator

`BrowserNavigator` is adopted for browser and works with `window.history`. It
extends some `Navigator` methods like `on`, `off`, `back`, `forward`, `go`
etc with some extra lines of code, which are written mostly to interact with
browser's history.

It rewires such functions as `window.history.pushState` and 
`window.history.replaceState`, so then, each history item has stable state,
which contains current location index and location history.

#### Usage
##### Creating instance
```typescript
import {BrowserNavigator} from '@mini-apps/navigation';

const navigator = new BrowserNavigator({
  // Available modes are 'default' and 'hash'. It determines with which part
  // navigator should work - with window.location.pathname or 
  // window.location.hash. 'hash' is default value
  mode: 'hash',

  // Log messages
  log: true,
});
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

**Initial navigator state**

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

##### `popstate` listening
When `mount()` was called, navigator adds its own listener, which watches
for location changes and automatically updates internal location. The logic
is rather simple - it tries to extract location info from history item
state and correctly updates navigator. But in case of fail, it will recognize 
pushed location as new one. So, it will try to parse it and push to navigator. 
Otherwise, an error will be thrown.
