class Inputs {
    
    delta: number;
    up: boolean;
    right: boolean;
    left: boolean;
    down: boolean;

    constructor() {
        this.delta = 0;
        this.up = false;
        this.down = false;
        this.right = false;
        this.left = false;
    }

    clone() {
        const clone = new Inputs();

        for (const [k, v] of Object.entries(this)) {
            if (!['boolean', 'number'].includes(typeof v)) continue;
            Object.defineProperty(clone, k, { value: v });
        }

        return clone;
    }
}

export default Inputs;
