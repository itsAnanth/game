import Server from './components/WsServer';


const server = new Server({ port: 3000 });
server.start();
