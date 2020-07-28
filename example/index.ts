import {
  BrowserNavigator,
  NavigatorLocationType,
  extractBrowserNavigatorSettings,
  createSegue,
} from '../src';

const nav = new BrowserNavigator();
// @ts-ignore
window.nav = nav;

const log = document.getElementById('log') as HTMLDivElement;
const backHref = document.getElementById('back-href') as HTMLAnchorElement;

function createLink(text: string, location: NavigatorLocationType) {
  const link = document.createElement('a');
  link.href = createSegue(location);
  link.innerText = text;
  link.style.display = 'block';

  document.body.appendChild(link);
}

function updateHistory() {
  log.innerHTML = '';

  nav.history.forEach((location, idx) => {
    const line = document.createElement('div');
    line.className = 'location';

    if (idx === nav.locationIndex) {
      line.classList.add('current-location');
    }
    if (location.modifiers.includes('skip')) {
      line.classList.add('skip-location');
    }
    line.innerText = JSON.stringify(location) + '\n';
    log.appendChild(line);
  });
}

backHref.href = createSegue({modifiers: ['back']});

createLink('onboarding', {view: 'onboarding'});
createLink('friends', {view: 'friends'});
createLink('friends / Vlad', {
  view: 'friends', params: {
    name: 'Vlad',
  },
});
createLink('friends / Vlad / Info (modal)', {
  view: 'friends',
  modal: 'info',
  params: {name: 'Vlad'},
});
createLink('friends / Vlad / Info (modal) / Delete friend confirm (alert)', {
  view: 'friends',
  modal: 'info',
  popup: 'delete',
  modifiers: ['skip'],
  params: {name: 'Vlad'},
});

createLink('Replace link (onboarding) ', {view: 'onboarding'});

const navigatorInfo = extractBrowserNavigatorSettings();
nav.on('location-changed', updateHistory);
nav.init(navigatorInfo ? navigatorInfo : undefined);

updateHistory();
