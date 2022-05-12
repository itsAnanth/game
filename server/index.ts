import Server from './components/WsServer';
import { App } from 'uWebSockets.js';

const app = App();
const server = new Server({ app, port: 8000 });
server.start();


setInterval(() => server.update(), 50);
