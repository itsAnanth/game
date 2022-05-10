class Vector {

    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    add(v: Vector | number, v1?: number) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v1 ?? v;
        }
        return this;
    }

    subtract(v: Vector) {
        this.x - v.x;
        this.y - v.y;
        return this;
    }

    multiply(n: number) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    /**
     * Get magnitude of a vecotr
     * equation -> sqart(square of x component + square of y component)
     */
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * returns the normal vector
     */
    normal() {
        return new Vector(-this.y, this.x).unit();
    }

    /**
     * create a unit vector
     * unit vector = all components / magnitude of the vector
     */
    unit() {
        const magnitude = this.magnitude();
        return (magnitude === 0) ?
            new Vector(0, 0) : new Vector(this.x / magnitude, this.y / magnitude);
    }

    /**
     * Draws the representation of a vector (visual only)
     */
    drawVector(ctx: CanvasRenderingContext2D, startx: number, starty: number, n: number, color: string) {
        ctx.beginPath();
        ctx.moveTo(startx, starty);
        ctx.lineTo(startx + this.x * n, starty + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Implementation of vector dot product
     * product = x1 + x2 * y1 + y2
     * or 
     * |v1| * |v2| * cos(angle)
     */
    static dot(v1: Vector, v2: Vector) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * Implementation of vector cross product
     * - product = x1 * y2 - y1 * x2
     */
    static cross(v1: Vector, v2: Vector) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    /**
     * Returns the distance between two vectors
     */
    static distance(v1: Vector, v2: Vector) {
        return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y, v1.y) ** 2);
    }

    static subtract(v1: Vector, v2: Vector) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static add(v1: Vector, v2: Vector) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static multiply(v: Vector, n: number) {
        return new Vector(v.x * n, v.y * n);
    }
}

export default Vector;
