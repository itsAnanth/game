import EventEmitter from 'events';
import { App, TemplatedApp } from 'uWebSockets.js';
import crypto from 'crypto';

declare module 'uWebSockets.js' {
    interface WebSocket {
        id: string;
    }
}

type ServerEvents = 'open' | 'close';


class Server extends EventEmitter {

    app: TemplatedApp;
    port: number;
    sockets: Map<string, WebSocket>;
    on: (eventName: ServerEvents, listener: (...args: any[]) => void) => this;
    emit: (eventName: ServerEvents, ...args: any[]) => boolean;

    constructor({ port }: { port: number }) {
        super();
        this.port = port;
        this.app = App();
        this.sockets = new Map();
    }

    start() {
        this.app.ws('/*', {
            open: (ws) => {
                // eslint-disable-next-line no-unused-vars
                const subscribed = ws.subscribe('STATE/');
                ws.id = crypto.randomBytes(16).toString('hex');
                this.emit('open', ws);
            },
            close: (ws, code, message) => {
                console.log(`Client with id ${ws.id} disconnected. code ${code}`);
                this.emit('close', ws, code, message);
            },
            idleTimeout: 32,
            maxPayloadLength: undefined
        }).listen(this.port, (success) => {
            success ? console.log(`Connected to port ${this.port}`) : console.error(`Connection failed at port ${this.port}`);
        })

    }

}

export default Server;

