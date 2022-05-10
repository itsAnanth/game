import type { Message as IMessage, DeflatedMessage } from '../types/Message';
import { decode, encode as encode } from 'msgpack-lite';
import { MessageType } from './MessageType';

interface Message extends IMessage {};

class Message {

    constructor({ type, data = [] }: { type: MessageType, data?: any[] }) {
        this.data = data;
        this.type = type;
    }

    static types = MessageType;

    static inflate(data: ArrayBuffer | DataView): Message | false {
        const _data = new Uint8Array(data instanceof DataView ? data.buffer : data);
        let decodedMessage = decode(_data);
        if (!Array.isArray(decodedMessage)) {
            try {
                decodedMessage = Array.from(decodedMessage);
                if (!decodedMessage) return false;
            } catch (e) {
                return false;
            }
        }

        const inflatedMessage = new Message({ type: decodedMessage.shift(), data: decodedMessage.length == 0 ? [] : decodedMessage });
        return inflatedMessage;
    }

    static deflate(msg: Message): DeflatedMessage {
        return [msg.type, ...(msg.data || [])];
    }

    static encode(data: Message): Buffer {
        return encode(Message.deflate(data));
    }

    static safeSend(send: WebSocket['send']) {
        return (data: Message | Uint8Array) => {
            if (!(data instanceof Uint8Array)) data = Message.encode(data);
            try {
                send((data as Uint8Array).buffer);
            } catch (e) {
                console.error(e);
            }
        };
    }

}

const ping = encode([MessageType.PING]);
const pong = encode([MessageType.PONG]);

export default Message;
export { Message, ping, pong };

