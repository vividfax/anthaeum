const WIDTH = 1080;
const HEIGHT = WIDTH;

const {
    createCanvas
} = require('canvas');
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');
const SimplexNoise = require('simplex-noise');

const guideWords = require('./guide-words');

const Colors = require('./js/Colors');
const Gif = require('./js/Gif');
const Post = require('./js/Post');
// Simplex

let gif;
let simplex;

function main() {

    let content = {
        'text': makeText(),
        'media': makeGif()
    };

    setTimeout(function () {

        let post = new Post();
        post.send(content);

    }, 1000 * 8);

    console.log(content);
}

function makeText() {

    const distance = Math.floor(Math.random() * 23) + 8;
    const length = guideWords.words.length - distance - 1;
    const place = Math.floor(Math.random() * length);

    const prefix = guideWords.words[place];
    const suffix = guideWords.words[place + distance];

    return [prefix, suffix].join('·');
}

function makeGif() {

    let gifLength = 11;

    let colors = new Colors();
    colors.mid = colors.str(colors.mid);

    simplex = new SimplexNoise();

    let path = __dirname + '/anth.gif';
    gif = new Gif(path, ctx);
    gif.start();

    draw(colors, simplex, gifLength);

    gif.end();

    setTimeout(function () {

        gif.optimise();

    }, 1000 * 3);

    return path;
}

function draw(colors, simplex, frames) {

    for (let i = 0; i < frames; i++) {

        drawClouds(colors, simplex, i, frames);
        drawWindows(colors);

        gif.saveFrame();
    }
}

function drawClouds(colors, simplex, position, totalFrames) {

    let speed = 8;

    let angle = Math.PI * 2 / totalFrames * position;
    let radius = totalFrames / Math.PI * 2 * speed;
    let z = radius * Math.cos(angle);
    let t = radius * Math.sin(angle);

    const imgData = ctx.createImageData(WIDTH, HEIGHT);

    for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {

            let noise = getSimplex(simplex, i, j, z, t);
            let color = colors.lerp(colors.light, colors.dark, noise);

            const place = (j * HEIGHT + i) * 4;

            imgData.data[place] = color.r;
            imgData.data[place + 1] = color.g;
            imgData.data[place + 2] = color.b;
            imgData.data[place + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function drawWindows(colors) {

    ctx.strokeStyle = colors.mid;
    ctx.lineWidth = WIDTH * .1;

    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
}

function map(value, low1, high1, low2, high2) {

    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getSimplex(simplex, x, y, z, t) {

    let scale = 0.002;
    let texture = 0.5;
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

    noise = map(noise, -1, 1, 0, 1);

    return noise;
}

main();
