import {BrowserNavigator, NavigatorLocationType} from '../src';

const nav = new BrowserNavigator();

nav.on('location-changed', console.warn)

window.nav = nav;

function createLink(text: string, location: NavigatorLocationType) {
  const link = document.createElement('a');
  link.href = nav.createSegue(location);
  link.innerText = text;
  link.style.display = 'block';

  document.body.appendChild(link);
}

createLink('1', {view: '1'});
createLink('2', {view: '2'});
createLink('3', {view: '3'});
createLink('back', {modifiers: ['back']});

nav.mount();
