import {
  BrowserNavigator,
  extractInitOptions,
  createLink, NavigatorState,
} from '../src';

const nav = new BrowserNavigator();
// @ts-ignore
window.nav = nav;

const log = document.getElementById('log') as HTMLDivElement;
const backHref = document.getElementById('back-href') as HTMLAnchorElement;

function createAnchor(text: string, state: Partial<NavigatorState>) {
  const link = document.createElement('a');
  link.href = createLink({view: '', params: {}, modifiers: [], ...state});
  link.innerText = text;
  link.style.display = 'block';

  document.body.appendChild(link);
}

function updateHistory() {
  log.innerHTML = '';

  nav.history.forEach((location, idx) => {
    const line = document.createElement('div');
    line.className = 'location';

    if (idx === nav.index) {
      line.classList.add('current-location');
    }
    if (location.modifiers.includes('skip')) {
      line.classList.add('skip-location');
    }
    line.innerText = JSON.stringify(location) + '\n';
    log.appendChild(line);
  });
}

backHref.href = createLink({view: '', params: {}, modifiers: ['back']});

createAnchor('onboarding', {view: 'onboarding'});
createAnchor('friends', {view: 'friends'});
createAnchor('friends / Vlad', {
  view: 'friends', params: {
    name: 'Vlad',
  },
});
createAnchor('friends / Vlad / Info (modal)', {
  view: 'friends',
  modal: 'info',
  params: {name: 'Vlad'},
});
createAnchor('friends / Vlad / Info (modal) / Delete friend confirm (alert)', {
  view: 'friends',
  modal: 'info',
  popup: 'delete',
  modifiers: ['skip'],
  params: {name: 'Vlad'},
});

createAnchor('Replace link (onboarding) ', {
  view: 'onboarding',
  modifiers: ['replace'],
});

const initOptions = extractInitOptions();
nav.on('state-changed', updateHistory);
nav.init(initOptions ? initOptions : undefined);

updateHistory();
