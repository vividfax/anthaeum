const WIDTH = 1080;
const HEIGHT = WIDTH;

const {
    createCanvas
} = require('canvas');
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');
const SimplexNoise = require('simplex-noise');

const GIFEncoder = require('gifencoder');
const encoder = new GIFEncoder(WIDTH, HEIGHT);
const fs = require('fs');
const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');

const Mastodon = require('mastodon-api');
const Twit = require('twit');

const config = require('./config');
const guideWords = require('./guide-words');

let gif;
let simplex;

function main() {

    let content = {
        'text': getText(),
        'media': makeGif()
    }
    setTimeout(function () {

        sendTweet(content);
        sendToot(content);

        console.log('Posted');

    }, 1000 * 8);

    console.log(content);
}

function getText() {

    const distance = Math.floor(Math.random() * 23) + 8;
    const length = guideWords.words.length - distance - 1;
    const place = Math.floor(Math.random() * length);

    const prefix = guideWords.words[place];
    const suffix = guideWords.words[place + distance];

    return [prefix, suffix].join('·');
}

function makeGif() {

    let gifLength = 11;

    let colors = getColors();
    simplex = new SimplexNoise();

    let filename = '/anth.gif';
    gif = new Gif(filename);
    gif.start();

    draw(colors, simplex, gifLength);

    gif.end();

    setTimeout(function () {

        gif.optimise();

    }, 1000 * 3);

    return filename;
}

function getColors() {

    let hues = [randomHue(), randomHue()];
    let distance = hues[0] - hues[1];
    let midHue = hues[0] + hues[1];

    if (distance > 180 || distance < -180) {
        midHue += 360;
    }
    midHue = (midHue / 2) % 360;

    let colors = {
        'light': hslToHex(hues[0], 95, 88),
        'mid': hslToHex(midHue, 30, 60),
        'dark': hslToHex(hues[1], 80, 25)
    }
    return colors;
}

function randomHue() {
    return Math.floor(Math.random() * 360);
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

class Gif {

    constructor(filename) {

        this.filename = filename;
    }

    start() {

        encoder.createReadStream().pipe(fs.createWriteStream(__dirname + this.filename));
        encoder.start();
        encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
        encoder.setDelay(1000 / 5); // frame delay in ms
        encoder.setQuality(20); // image quality. 10 is default.

        console.log('Making gif...');
    }

    saveFrame() {

        encoder.addFrame(ctx);
        console.log('+');
    }

    end() {

        encoder.finish();
        console.log('Saved gif');
    }

    optimise() {

        imagemin([__dirname + this.filename], '.', {
            use: [imageminGifsicle({
                colors: 255,
                optimizationLevel: 3
            })]
        }).then(() => {
            console.log('Optimized gif');
        });
    }
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

    for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {

            let noise = getSimplex(simplex, i, j, z, t);
            let color = lerpColor(colors.light, colors.dark, noise);

            ctx.fillStyle = color;
            ctx.fillRect(i, j, 1, 1);
        }
    }
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

function lerpColor(a, b, ratio) {

    let ah = parseInt(a.replace(/#/g, ""), 16),
        ar = ah >> 16,
        ag = ah >> 8 & 0xff,
        ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ""), 16),
        br = bh >> 16,
        bg = bh >> 8 & 0xff,
        bb = bh & 0xff,
        rr = ar + ratio * (br - ar),
        rg = ag + ratio * (bg - ag),
        rb = ab + ratio * (bb - ab);

    return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function savePng(filename) {

    let out = fs.createWriteStream(__dirname + filename);
    let stream = canvas.pngStream();

    stream.on('data', function (chunk) {
        out.write(chunk);
    });
    stream.on('end', function () {
        console.log('Saved png');
    });
}

function sendToot(content) {

    const M = new Mastodon(config.mastodon);

    M.post('media', {
        file: fs.createReadStream(__dirname + content.media)
    }).then(resp => {
        const id = resp.data.id;
        M.post('statuses', {
            status: content.text,
            media_ids: [id]
        })
    });
}

function sendTweet(content) {

    const T = new Twit(config.twitter);

    const b64content = fs.readFileSync(__dirname + content.media, {
        encoding: 'base64'
    });
    T.post('media/upload', {
        media_data: b64content
    }, function (err, data, response) {
        let mediaIdStr = data.media_id_string
        let meta_params = {
            media_id: mediaIdStr
        }
        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
                let params = {
                    status: content.text,
                    media_ids: [mediaIdStr]
                }
                T.post('statuses/update', params, function (err, data, response) {
                    console.log(data)
                })
            }
        })
    });
}

main();
