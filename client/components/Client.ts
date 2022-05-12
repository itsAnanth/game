import Inputs from '../../shared/components/Inputs';
import Message from '../../shared/components/Message';
import Player from '../../shared/components/Player';
import InterpolatedPlayer from './InterpolatedPlayer';
import Renderer from './Renderer';

class Client {
    gameCanvasEl: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    webSocket: WebSocket;
    messages: (ArrayBuffer | DataView)[];
    player: Player;
    inputs: Inputs;
    inputsArray: Inputs[];
    historySize: number;
    history: any[];
    tickNumber: number;
    currentTime: number;
    lastTime: number;
    deltaTime: number;
    interpolatedPlayer: InterpolatedPlayer;
    serverPlayer: Player;
    speedHackPlayer: Player;
    otherPlayers: InterpolatedPlayer[];

    trails: any[];
    hooked: boolean;

    constructor() {
        this.gameCanvasEl = document.querySelector('.game-canvas');

        this.gameCanvasEl.width = window.innerWidth;
        this.gameCanvasEl.height = window.innerHeight;

        this.context = this.gameCanvasEl.getContext('2d');

        this.webSocket = null;

        this.messages = [];

        this.player = new Player();
        this.inputs = new Inputs();
        this.inputsArray = [];

        this.historySize = 1024;
        this.history = [];

        this.tickNumber = 0;

        this.currentTime = null;
        this.lastTime = null;
        this.deltaTime = null;

        this.interpolatedPlayer = new InterpolatedPlayer();
        this.serverPlayer = new Player();
        this.speedHackPlayer = new Player();

        this.otherPlayers = [];

        this.trails = [];


        this.hooked = false;

    }

    connect(url: string) {
        const scope = this;

        if (scope.webSocket !== null) {
            // disconnect
        }

        url = url.replace('http', 'ws');

        scope.webSocket = new WebSocket('ws://localhost:8000');

        this.webSocket.binaryType = 'arraybuffer';


        scope.webSocket.addEventListener('open', () => console.log('ws open'));
        scope.webSocket.addEventListener('message', (msg) => this.messages.push(msg.data));
        scope.webSocket.addEventListener('close', () => console.log('ws closed'));
        scope.webSocket.addEventListener('error', (err) => console.log(`ws error: ${err}`));

    }
    /**
     * @param {KeyboardEvent} ev
     */
    registerKeys(ev: KeyboardEvent) {
        const state = ev.type == 'keydown' ? true : false;

        switch (ev.keyCode) {
        case 65:
            this.inputs.left = state;
            break;
        case 87:
            this.inputs.up = state;
            break;
        case 68:
            this.inputs.right = state;
            break;
        case 83:
            this.inputs.down = state;
            break;
        }

    }

    sendMessage(message: Message) {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN)
            this.webSocket.send(Message.encode(message));
    }

    update() {

        this.currentTime = Date.now();

        if (!this.lastTime) {
            this.lastTime = this.currentTime;
            return;
        }

        this.deltaTime = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;

        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {

            // console.log('not connected, skipping');

            return;

        }

        // deltatime to be used while calculating movement in both server and client

        this.inputs.delta = this.hooked ? this.deltaTime * 4 : this.deltaTime;


        const inputsClone = this.inputs.clone();

        this.inputsArray.push(inputsClone);

        // server state update
        this.sendMessage(new Message({
            type: Message.types.INPUTS,
            data: [
                this.inputsArray,
                this.tickNumber
            ]
        }))

        // clear input array to prevent overflow
        this.inputsArray = [];

        this.history[this.tickNumber % this.historySize] = {
            position: { x: this.player.position.x, y: this.player.position.y },
            velocity: { x: this.player.velocity.x, y: this.player.velocity.y },
            inputs: inputsClone
        };

        this.player.move(this.inputs);


        while (this.messages.length > 0) {

            const message = Message.inflate(this.messages.shift());
            if (!message) continue;


            switch (message.type) {

            case Message.types.JOIN:
                window.id = message.data[0];
                break;

            case Message.types.UPDATE:

                const serverState: {
                        position: { x: number, y: number },
                        velocity: { x: number, y: number },
                        ticks: number
                    } = message.data[0];


                // @ts-ignore
                let history = this.history[serverState.ticks % this.historySize];

                // if the server update that occured at {this.tickNumber} is not matching with the state recorded in history then correct it
                const error = Math.hypot(serverState.position.x - history.position.x, serverState.position.y - history.position.y)
                if (error > 0.00001) {

                    console.log('correcting');

                    this.player.position.setXY(serverState.position);
                    this.player.velocity.setXY(serverState.velocity);


                    let rewindTickNumber = serverState.ticks;

                    // fix states and move player right up till current tick
                    while (rewindTickNumber <= this.tickNumber) {

                        history = this.history[rewindTickNumber % this.historySize];

                        history.position = { x: this.player.position.x, y: this.player.position.y };
                        history.velocity = { x: this.player.velocity.x, y: this.player.velocity.y };

                        this.player.move(history.inputs);

                        rewindTickNumber++;

                    }

                }

                break;

            case Message.types.WORLDUPDATE:

                const players = [];

                while ((message.data).length > 0) {

                    const data: {
                            position: { x: number, y: number },
                            id: string
                        } = message.data.shift();

                    // update includes the player itself, ignore 
                    if (data.id === window.id) continue;


                    let player = this.otherPlayers.find(function (player) {
                        return player.id === data.id;
                    });


                    // player already exists, update it with reference to current time
                    if (player)
                        player.setNewState(data.position.x, data.position.y, this.currentTime);

                    else {

                        player = new InterpolatedPlayer();
                        player.id = data.id;
                        // new player, time will be 0
                        player.setNewState(data.position.x, data.position.y, 0);

                    }


                    players.push(player);

                }


                this.otherPlayers = players;

                break;

            }

            for (let i = 0; i < this.otherPlayers.length; i++)
                this.otherPlayers[i].update(this.currentTime, 200);

        }


        // increment ticks
        this.tickNumber++;


    }


    draw() {
        const canvas = this.gameCanvasEl;
        this.context.globalAlpha = 1;

        Renderer.renderWorld(this.context, this.player.position, canvas);

        this.context.save();
        let text = ''

        this.context.translate(this.gameCanvasEl.width / 2, this.gameCanvasEl.height / 2);

        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {

            this.context.font = 'bolder 50px arial';
            this.context.textBaseline = 'middle';
            this.context.textAlign = 'center';

            this.context.fillStyle = '#fff';
            this.context.strokeStyle = '#222';

            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';

            this.context.lineWidth = 6;

            if (this.webSocket.readyState < WebSocket.OPEN)

                text = 'Connecting...';

            else

                text = 'Disconnected!';



            this.context.strokeText(text, 0, 0);
            this.context.fillText(text, 0, 0);

            this.context.restore();

            return;

        }

        this.context.restore();

        Renderer.renderPlayer(this.gameCanvasEl, this.context);


        for (let i = 0; i < this.otherPlayers.length; i++)

            Renderer.renderEnemies(this.context, this.player, this.otherPlayers[i], canvas);


    }
}

export default Client;


