const {
    createCanvas
} = require('canvas');

const Colors = require('./js/Colors');
const Clouds = require('./js/Clouds');
const Gif = require('./js/Gif');
const Post = require('./js/Post');
const Windows = require('./js/Windows');

const guideWords = require('./guide-words');

function main() {

    let content = {
        text: makeText(),
        media: makeGif()
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

    const gifLength = 11;
    const width = 1080;
    const height = width;
    const path = __dirname + '/anth.gif';

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const gif = new Gif(path, ctx, gifLength);

    drawGif(ctx, gif);

    setTimeout(function () {

        gif.optimise();

    }, 1000 * 3);

    return path;
}

function drawGif(ctx, gif) {

    const colors = new Colors();
    colors.mid = colors.str(colors.mid);
    const clouds = new Clouds(ctx, colors, gif.len);
    const windows = new Windows(ctx, colors);

    gif.start();

    for (let i = 0; i < gif.len; i++) {

        clouds.draw(i);
        windows.draw();

        gif.saveFrame();
    }
    gif.end();
}

main();
