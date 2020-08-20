const SimplexNoise = require('simplex-noise');

module.exports = class Clouds {

    constructor(ctx, colors, gifLength) {

        this.simplex = new SimplexNoise();

        this.ctx = ctx;
        this.gifLength = gifLength;
        this.colors = colors;
    }

    draw(position) {

        const velocity = 3;

        const angle = Math.PI * 2 / this.gifLength * position;
        const radius = this.gifLength / Math.PI * 2 * velocity;
        const z = radius * Math.cos(angle);
        const t = radius * Math.sin(angle);

        const ctx = this.ctx;
        const colors = this.colors;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const imgData = ctx.createImageData(width, height);

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {

                const place = (j * height + i) * 4;
                const noise = getSimplex(this.simplex, i, j, z, t);
                const color = colors.lerp(colors.light, colors.dark, noise);

                imgData.data[place] = color.r;
                imgData.data[place + 1] = color.g;
                imgData.data[place + 2] = color.b;
                imgData.data[place + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

function getSimplex(simplex, x, y, z, t) {

    let scale = 0.002;
    const texture = 0.5;
    const octaves = 16;

    let noise = 0;
    let power = 0;
    let fraction = 1;

    for (let i = 0; i < octaves; i++) {

        noise += simplex.noise4D(x * scale, y * scale, z * scale, t * scale) * fraction;
        power += fraction;
        fraction *= texture;
        scale *= 2;
    }
    noise /= power;

    noise = sineMap(noise);
    noise = sineMap(noise);
    noise = sineMap(noise);
    noise = remap(noise, -1, 1, -.2, 1.15);

    return noise;
}

function sineMap(noise) {

    return Math.sin(noise * Math.PI / 2);
}

function remap(value, low1, high1, low2, high2) {

    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
