import Player from '../../shared/components/Player';

class InterpolatedPlayer extends Player {
    old: { x: number, y: number };
    new: { x: number, y: number };
    id?: string;
    updateTime: number;
    constructor() {
        super();
        this.old = this.new = this.position;
        this.updateTime = 0;
    }

    setNewState(x: number, y: number, time: number) {

        this.new = { x: x, y: y };

        this.old = { x: this.position.x, y: this.position.y };

        this.updateTime = time;

    }

    update(currentTime: number, period: number) {

        const t = Math.min((currentTime - this.updateTime) / period, 1.5);

        let dx = this.old.x + (this.new.x - this.old.x) * t;
        let dy = this.old.y + (this.new.y - this.old.y) * t;

        this.position.setXY({ x: dx, y: dy });
    }

}

export default InterpolatedPlayer;
