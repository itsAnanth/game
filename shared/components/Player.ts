import Inputs from './Inputs';
import Vector from './Vector';

class Player {
    position: Vector;
    velocity: Vector;

    constructor() {
        this.position = new Vector();
        this.velocity = new Vector();
    }

    move(inputs: Inputs) {
        const delta = inputs.delta / 1000;

        let dx = 0, dy = 0;

        if (inputs.left)
            dx -= 5;
        else if (inputs.right)
            dx += 5;

        if (inputs.up)
            dy -= 5;
        else if (inputs.down)
            dy += 5;

        const acceleration = 400;
        const maxSpeed = 500;

        const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);

        // console.log(this.velocity.magnitude())

        if (currentSpeed > 0) {
            // friction

            this.velocity.multiply(0.85); // 0.85

        }

        let amount = acceleration * delta;

        if (currentSpeed + amount > maxSpeed) 

            amount = maxSpeed - currentSpeed;

        this.velocity.add(amount * dx, amount * dy);

        this.position.add(Vector.multiply(this.velocity, delta));
        
    }

    serialize() {
        return {
            position: this.position.serialize(),
            velocity: this.velocity.serialize()
        }
    }
}

export default Player;

