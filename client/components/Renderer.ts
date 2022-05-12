import Player from '../../shared/components/Player';
import config from '../../shared/config.json';

const { MAP, PLAYER } = config;


class Renderer {

    static renderPlayer(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const dx = canvas.width / 2, dy = canvas.height / 2;
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(dx, dy, PLAYER.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Renderer.renderName(dx, dy, me);
    }

    // static renderName(x, y, { username, color }: { username: string, color: string }) {
    //     ctx.fillStyle = color;
    //     ctx.textAlign = 'center';
    //     ctx.font = `bold ${Constants.PLAYER.FONT_SIZE}px Arial`;
    //     ctx.fillText(username, x, y - (PLAYER.radius + Constants.PLAYER.FONT_SIZE));
    // }

    static renderEnemies(ctx: CanvasRenderingContext2D, me: Player, p: Player, canvas: HTMLCanvasElement) {
        ctx.fillStyle = 'red';
        const relativeX = p.position.x - me.position.x;
        const relativeY = p.position.y - me.position.y;

        if (
            relativeX > canvas.height ||
            relativeX < -canvas.height ||
            relativeY > canvas.width ||
            relativeY < -canvas.width
        ) return;

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(
            relativeX + canvas.width / 2,
            relativeY + canvas.height / 2,
            PLAYER.radius,
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Renderer.renderName(relativeX + canvas.width / 2, relativeY + canvas.height / 2, p);
    }


    static renderWorld(ctx: CanvasRenderingContext2D, pos: Player['position'], canvas: HTMLCanvasElement) {
        ctx.fillStyle = '#323232';
        ctx.fillRect(0, 0, MAP.x, MAP.y);
        ctx.lineWidth = 3;
        ctx.save();

        const dx = pos.x - canvas.width / 2;
        const dy = pos.y - canvas.height / 2;
        ctx.fillStyle = '#121212';
        ctx.strokeStyle = '#635f5f';
        const size = (MAP.x + MAP.y / 2) / 30;
        for (let x = 0; x < MAP.x; x += size) {
            for (let y = 0; y < MAP.y; y += size) 
                ctx.strokeRect(-dx + x, -dy + y, size, size);
            
        }

        Renderer.renderBorder(ctx, pos, canvas);

        ctx.restore();
    }

    static renderBorder(ctx: CanvasRenderingContext2D, pos: Player['position'], canvas: HTMLCanvasElement) {
        const dx = pos.x - canvas.width / 2;
        const dy = pos.y - canvas.height / 2;
        ctx.strokeStyle = '#010101';
        ctx.strokeRect(
            -dx - PLAYER.radius,
            -dy - PLAYER.radius,
            MAP.x + (PLAYER.radius * 4) / 2,
            MAP.y + (PLAYER.radius * 4) / 2
        );
    }
}

export default Renderer;
