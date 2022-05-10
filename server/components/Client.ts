import type { WebSocket } from 'uWebSockets.js';
import Inputs from '../../shared/components/Inputs';
import Message from '../../shared/components/Message';
import Player from '../../shared/components/Player';

class Client {

    socket: WebSocket;
    isAlive: boolean;
    id: string;
    messages: (Message)[];
    player: Player;
    inputs: Inputs;
    time: number;

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.id = socket.id;
        this.isAlive = true;
        this.messages = [];
    }

    send(message: Message) {
        if (!this.socket) return;
        this.socket.send(Message.encode(message), true);
    }

}

export default Client;
