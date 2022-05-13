import AnimationFrame from '../shared/components/AnimationFrame';
import Client from './components/Client';
import { config } from 'dotenv';

config();

declare global {
    interface Window {
        id?: string;
        client?: Client;
    }
}

let client: Client;

init();
new AnimationFrame(60, animate).start();


function init() {
    client = new Client();
    client.connect(window.location.href);
    (process.env.NODE_ENV === 'dev') && (window.client = client);
}

window.addEventListener('keydown', client.registerKeys.bind(client));
window.addEventListener('keyup', client.registerKeys.bind(client));
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    client.gameCanvasEl.width = window.innerWidth;
    client.gameCanvasEl.height = window.innerHeight;
}

function animate() {
    client.update();
    client.draw();
}

