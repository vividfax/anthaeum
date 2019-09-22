module.exports = class Windows {

    constructor(ctx, colors) {

        this.ctx = ctx;
        this.color = colors.mid;

        const border = {
            side: ctx.canvas.width * .03,
            top: ctx.canvas.height / random(7, 20),
            bottom: ctx.canvas.height / random(7, 20)
        };
        this.width = ctx.canvas.width + border.side * 2;
        this.height = ctx.canvas.height + border.top + border.bottom;

        this.origin = {
            x: -border.side,
            y: -border.top
        };
        this.frames = {
            weight: 22,
            columns: randInt(3, 5),
            rows: randInt(2, 3)
        }
        this.panes = {
            weight: this.frames.weight / 5,
            columns: randInt(2, 3),
            rows: randInt(1, 4)
        }
        // add detailing : arches, crosses, doors, squares, bottom panel
    }

    draw() {

        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.origin.x, this.origin.y);

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        drawFrames(ctx, this.width, this.height, this.frames, this.panes);

        ctx.restore();
    }
}

function drawFrames(ctx, width, height, frames, panes) {

    const frameWidth = width / frames.columns;
    const frameHeight = height / frames.rows;

    const paneWidth = frameWidth / panes.columns;
    const paneHeight = frameHeight / panes.rows;

    for (let i = 0; i < frames.columns; i++) {

        ctx.lineWidth = frames.weight;

        drawLine(ctx, frameWidth * i, 0, frameWidth * i, height);

        for (let j = 1; j < panes.columns; j++) {

            ctx.lineWidth = panes.weight;

            drawLine(ctx, frameWidth * i + paneWidth * j, 0, frameWidth * i + paneWidth * j, height);
        }
    }

    for (let i = 0; i < frames.rows; i++) {

        ctx.lineWidth = frames.weight;

        drawLine(ctx, 0, frameHeight * i, width, frameHeight * i);

        for (let j = 1; j < panes.rows; j++) {

            ctx.lineWidth = panes.weight;

            drawLine(ctx, 0, frameHeight * i + paneHeight * j, width, frameHeight * i + paneHeight * j);
        }
    }
}

function drawLine(ctx, x1, y1, x2, y2) {

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function random(min, max) {

    return Math.random() * (max - min) + min;
}

function randInt(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
