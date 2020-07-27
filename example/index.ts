import {BrowserNavigator, NavigatorLocationType} from '../src';

const nav = new BrowserNavigator({
  log: true,
});

const log = document.createElement('textarea');
log.id = 'log';
log.rows = 20;
log.disabled = true;
document.body.appendChild(log);

window.nav = nav;

function createLink(text: string, location: NavigatorLocationType) {
  const link = document.createElement('a');
  link.href = nav.createSegue(location);
  link.innerText = text;
  link.style.display = 'block';

  document.body.appendChild(link);
}

createLink('onboarding', {view: 'onboarding'});
createLink('onboarding / [shadow]confirm', {
  view: 'onboarding',
  popup: 'confirm',
  modifiers: ['shadow'],
});
createLink('new', {view: 'new'});
createLink('friends', {view: 'friends'});
createLink('back', {modifiers: ['back']});

nav.mount();

nav.history.forEach(location => {
  log.value += 'Location changed: ' + JSON.stringify(location) + '\n';
})

nav.on('location-changed', location => {
  log.value += 'Location changed: ' + JSON.stringify(location) + '\n';
});
