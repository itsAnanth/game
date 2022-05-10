class AnimationFrame {

    requestId: number;
    fps: number;
    callback: (delta: number) => any|Promise<any>;

    constructor(fps = 60, callback: (delta: number) => any|Promise<any>) {
        this.requestId = 0;
        this.fps = fps;
        this.callback = callback;
    }

    start() {
        let then = performance.now();
        const interval = 1000 / this.fps;
        const tolerance = 0.1;

        const animateLoop = (now: number) => {
            this.requestId = requestAnimationFrame(animateLoop);
            const delta = now - then;

            if (delta >= interval - tolerance) {
                then = now - (delta % interval);
                this.callback(delta);
            }
        };
        this.requestId = requestAnimationFrame(animateLoop);
    }

    stop() {
        cancelAnimationFrame(this.requestId);
    }
}

export default AnimationFrame;
