import EventEmitter from 'events';
import { TemplatedApp, WebSocket } from 'uWebSockets.js';
import crypto from 'crypto';
import Client from './Client';
import Player from '../../shared/components/Player';
import Inputs from '../../shared/components/Inputs';
import Message from '../../shared/components/Message';

declare module 'uWebSockets.js' {
    interface WebSocket {
        id: string;
    }
}

type ServerEvents = 'open' | 'close';


class Server extends EventEmitter {

    app: TemplatedApp;
    port: number;
    currentTime: number;
    sockets: Map<string, Client>;
    on: (eventName: ServerEvents, listener: (...args: any[]) => void) => this;
    // emit: (eventName: ServerEvents, ...args: any[]) => boolean;

    constructor({ app, port }: { app: TemplatedApp, port: number }) {
        super();
        this.port = port;
        this.app = app;
        this.sockets = new Map();
        this.currentTime = Date.now();
    }

    start() {
        let self = this;
        this.app.ws('/*', {
            open: (ws) => {
                // eslint-disable-next-line no-unused-vars
                const subscribed = ws.subscribe('STATE/');
                ws.id = crypto.randomBytes(16).toString('hex');
                
                const client = new Client(ws);
                client.player = new Player();
                client.inputs = new Inputs();
                client.time = self.currentTime;

                this.sockets.set(ws.id, client);

                ws.send(Message.encode(new Message({
                    type: Message.types.JOIN,
                    data: [ws.id]
                })), true)

                // self.emit('open', ws);
            },
            message: (ws: WebSocket, messageData: ArrayBuffer | DataView) => {
                const message = Message.inflate(messageData);
                if (!message) return;


                this.sockets.get(ws.id).messages.push(message)
            },
            close: (ws, code, _message) => {
                this.sockets.delete(ws.id);
                console.log(`Client with id ${ws.id} disconnected. code ${code} ${_message}`);
                // self.emit('close', ws, code, message);
            },
            idleTimeout: 32,
            maxPayloadLength: undefined
        }).listen(this.port, (success) => {
            success ? console.log(`Connected to port ${this.port}`) : console.error(`Connection failed at port ${this.port}`);
        })

    }

    update() {
        this.currentTime = Date.now();
        const clients = [...this.sockets.values()];

        for (let i = clients.length - 1; i >= 0; i--) {
            const client = clients[i];

            if (!client.isAlive) {
                this.sockets.delete(client.id);
                continue;
            }

            while (client.messages.length > 0) {
                const message = client.messages.shift();
                if (!message) continue;

                switch (message.type) {
                case Message.types.INPUTS:
                    const inputsArray: Inputs[] = message.data[0];
                    const ticks = message.data[1];

                    if (!inputsArray || !ticks) continue;

                    while (inputsArray.length > 0) {
                        const inputs = inputsArray.shift();
                        if (client.time + inputs.delta > this.currentTime)
                            inputs.delta = this.currentTime - client.time;

                        client.time += inputs.delta;
                        client.player.move(inputs);
                    }

                    const data = [
                        {
                            ...client.player.serialize(),
                            ticks: ticks + 1
                        }

                    ];


                    client.send(new Message({
                        type: Message.types.UPDATE,
                        data: data
                    }));

                    break;
                }
            }
        }

        const data = [...this.sockets.values()].map(p => ({
            id: p.id,
            position: { x: p.player.position.x, y: p.player.position.y }
        }))

        this.app.publish('STATE/', 
            Message.encode(
                new Message({
                    type: Message.types.WORLDUPDATE,
                    data: data
                })
            ), true
        )
    }

}

export default Server;

